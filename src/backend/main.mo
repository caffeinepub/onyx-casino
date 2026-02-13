import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type GameOutcome = {
    #tiger; // 1.4x
    #dragon; // 1.96x
    #miss; // 0x (formerly 'null')
    #crit; // -50% partial loss
  };

  public type GameSettings = {
    houseEdge : Nat;
    probabilities : {
      tiger : Nat;
      dragon : Nat;
      miss : Nat; // formerly 'null'
      crit : Nat;
    };
  };

  public type CreditTransaction = {
    amount : Nat;
    description : Text;
    outcallType : ?Text;
  };

  public type TransactionType = {
    #deposit;
    #withdrawal;
    #gameSpin;
  };

  public type Transaction = {
    id : Nat;
    user : Principal;
    transactionType : TransactionType;
    amount : Nat;
    description : ?Text;
    outcallType : ?Text;
  };

  public type UserProfile = {
    credits : Nat;
    transactions : [Transaction];
  };

  public type SpinResult = {
    user : Principal;
    outcome : GameOutcome;
    profit : Int;
    balanceAfterSpin : Nat;
  };

  public type WithdrawalRequest = {
    id : Nat;
    user : Principal;
    amount : Nat;
    status : {
      #pending;
      #approved;
      #denied;
      #completed;
    };
    createdAt : Int;
    processedAt : ?Int;
  };

  public type WithdrawalRequestResult = {
    #inProgress : { message : Text };
    #completed : { message : Text };
    #denied : { message : Text };
  };

  // Persistent state
  let users = Map.empty<Principal, UserProfile>();
  let withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
  let suspiciousActivityLog = Map.empty<Principal, [Text]>();

  // Stripe configuration state (persisted as a singleton)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Global variables
  var currentSettings : GameSettings = {
    houseEdge = 1000; // 10%
    probabilities = {
      tiger = 3500; // 35% chance
      dragon = 1400; // 14% chance
      miss = 3080; // 30.8% chance (formerly 'null')
      crit = 2030; // 20.3% chance
    };
  };

  // Constants
  let creditConversionRate = 2;
  let baseBet = 50;
  let bigCreditBonusThreshold = 100000; // Example value
  let bigCreditBonusMultiplier = 1.2;
  let withdrawalBonusThreshold = 300000;

  // User profile management (required by instruction)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  // User credit management & game logic
  func getUserProfileNonTrap(caller : Principal) : UserProfile {
    switch (users.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          credits = 0;
          transactions = [];
        };
        users.add(caller, newProfile);
        newProfile;
      };
      case (?profile) { profile };
    };
  };

  func getUserProfileTrap(caller : Principal) : UserProfile {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  func updateUserProfile(caller : Principal, profile : UserProfile) {
    users.add(caller, profile);
  };

  // Credit transactions
  func updateCreditBalance(caller : Principal, amount : Int, transactionType : TransactionType) {
    let profile = getUserProfileNonTrap(caller);
    var newBalance : Int = profile.credits;

    if (amount < 0) {
      if (profile.credits < -amount) {
        Runtime.trap("Insufficient balance for transaction");
      };
      newBalance -= -amount;
    } else {
      newBalance += amount;
    };

    if (newBalance < 0) {
      Runtime.trap("Credit balance cannot be negative");
    };

    let newTransaction : Transaction = {
      id = profile.transactions.size();
      user = caller;
      transactionType;
      amount = if (amount < 0) { (-amount).toNat() } else { amount.toNat() };
      description = null;
      outcallType = null;
    };

    let updatedProfile : UserProfile = {
      credits = newBalance.toNat();
      transactions = profile.transactions.concat([newTransaction]);
    };

    updateUserProfile(caller, updatedProfile);
  };

  // Internal utilities
  func classifyCreditAction(actionType : TransactionType, amount : Nat) : (Text, Nat) {
    switch (actionType) {
      case (#deposit) { ("Deposit", amount) };
      case (#withdrawal) { ("Withdrawal", amount) };
      case (#gameSpin) { ("Game spin", amount) };
    };
  };

  func handleWithdrawalBonus(_user : Principal, withdrawalAmount : Nat) : Nat {
    if (withdrawalAmount >= withdrawalBonusThreshold) { withdrawalAmount / 10 } else { 0 };
  };

  func processMultipliers(caller : Principal, effectType : GameOutcome, baseBet : Nat) : Nat {
    let multiplier = switch (effectType) {
      case (#tiger) { 140 };
      case (#dragon) { 196 };
      case (#miss) { 0 }; // formerly 'null'
      case (#crit) { 50 };
    };

    let multiplierAmount = (baseBet * multiplier) / 100;
    let newTransaction : Transaction = {
      id = users.toArray().size() + 1;
      user = caller;
      transactionType = (#gameSpin : TransactionType);
      amount = multiplierAmount;
      description = ?"Multiplier applied";
      outcallType = null;
    };

    let newCredits = baseBet + multiplierAmount;
    let profile = getUserProfileNonTrap(caller);
    let updatedProfile : UserProfile = {
      credits = newCredits;
      transactions = profile.transactions.concat([newTransaction]);
    };
    updateUserProfile(caller, updatedProfile);
    baseBet;
  };

  // Spin wheel logic
  func determineWheelOutcome(spinResult : Nat) : GameOutcome {
    if (spinResult <= currentSettings.probabilities.tiger) {
      #tiger;
    } else if (spinResult <= (currentSettings.probabilities.tiger + currentSettings.probabilities.dragon)) {
      #dragon;
    } else if (spinResult <= (currentSettings.probabilities.tiger + currentSettings.probabilities.dragon + currentSettings.probabilities.miss)) {
      #miss; // formerly 'null'
    } else { #crit };
  };

  func applyMultiplier(_gain : Nat) : Nat { baseBet };

  public shared ({ caller }) func spinWheel() : async SpinResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can spin the wheel");
    };

    let profile = getUserProfileTrap(caller);

    // Bet validation
    if (profile.credits < baseBet) { Runtime.trap("Insufficient funds, bet failed") };
    let uncappedBet = baseBet * creditConversionRate;

    // Outcome
    let spinResult = 7727;
    let outcome = determineWheelOutcome(spinResult);

    // Processing win/lose
    var newBalance : Int = profile.credits - uncappedBet;
    var prize = 0;
    var profit = -Int.abs(uncappedBet);

    switch (outcome) {
      case (#tiger) {
        let payout = uncappedBet * 140 / 100;
        newBalance += payout;
        prize := payout;
        profit := payout - uncappedBet;
      };
      case (#dragon) {
        let payout = uncappedBet * 196 / 100;
        newBalance += payout;
        prize := payout;
        profit := payout - uncappedBet;
      };
      case (#crit) {
        let payout = uncappedBet / 2;
        newBalance += payout;
        profit := -Int.abs(payout);
      };
      case (#miss) { // formerly 'null'
        profit := -Int.abs(uncappedBet);
      };
    };

    if (newBalance < 0) { Runtime.trap("An error occurred when updating balance") };

    let transactionId = profile.transactions.size();

    let newTransaction : Transaction = {
      id = transactionId;
      user = caller;
      transactionType = #gameSpin;
      amount = if (profit < 0) { (-profit).toNat() } else { profit.toNat() };
      description = switch (outcome) {
        case (#tiger) { ?"Multiplier applied: Tiger" };
        case (#dragon) { ?"Multiplier applied: Dragon" };
        case (#crit) { ?"Multiplier applied: Crit" };
        case (#miss) { ?"Multiplier applied: Miss" };
      };
      outcallType = null;
    };

    let updatedTransactions = profile.transactions.concat([newTransaction]);
    let updatedProfile : UserProfile = {
      credits = newBalance.toNat();
      transactions = updatedTransactions;
    };
    updateUserProfile(caller, updatedProfile);

    {
      user = caller;
      outcome;
      profit;
      balanceAfterSpin = newBalance.toNat();
    };
  };

  // Withdrawal
  func handleWithdrawal(value : Nat) : Nat {
    value;
  };

  func processWithdrawalBonus(caller : Principal, withdrawalAmount : Nat) : Nat {
    if (withdrawalAmount >= withdrawalBonusThreshold) {
      let bonusAmount = (withdrawalAmount * 2) / 10;
      let profile = getUserProfileNonTrap(caller);
      let newTransaction : Transaction = {
        id = users.toArray().size() + 1;
        user = caller;
        transactionType = #deposit;
        amount = bonusAmount;
        description = ?"Bonus";
        outcallType = null;
      };
      let updatedProfile : UserProfile = {
        credits = profile.credits + bonusAmount;
        transactions = profile.transactions.concat([newTransaction]);
      };
      updateUserProfile(caller, updatedProfile);
      return bonusAmount;
    };
    0;
  };

  func processBigCreditBonus(caller : Principal, creditAmount : Nat) : Nat {
    if (creditAmount >= bigCreditBonusThreshold) {
      let bonus = creditAmount;
      let profile = getUserProfileNonTrap(caller);
      let newTransaction : Transaction = {
        id = users.toArray().size() + 1;
        user = caller;
        transactionType = #deposit;
        amount = bonus;
        description = ?"Bonus";
        outcallType = null;
      };
      let updatedProfile : UserProfile = {
        credits = profile.credits + bonus;
        transactions = profile.transactions.concat([newTransaction]);
      };
      updateUserProfile(caller, updatedProfile);
      bonus;
    } else { 0 };
  };

  func getUserSuspiciousActivity(caller : Principal) : [Text] {
    switch (suspiciousActivityLog.get(caller)) {
      case (null) { [] };
      case (?activity) { activity };
    };
  };

  // House Edge Management
  public shared ({ caller }) func setHouseEdgeValue(value : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    currentSettings := {
      houseEdge = value;
      probabilities = currentSettings.probabilities;
    };
  };

  public query ({ caller }) func getHouseEdgeValue() : async Nat {
    currentSettings.houseEdge;
  };

  // Stripe Integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  // Helper to get the current Stripe configuration (traps if not set)
  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getLeaderboard() : async [(Principal, Nat)] {
    let leaderboard = users.toArray().map(
      func((principal, profile)) {
        (principal, profile.credits);
      }
    );
    leaderboard.sort(
      func(a, b) {
        Nat.compare(b.1, a.1);
      }
    );
  };

  // Filters
  public query ({ caller }) func getUserCreditTransactions(user : Principal, onlyWithdrawals : Bool, onlyDeposits : Bool) : async [CreditTransaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    getUserProfileNonTrap(user).transactions.filter(
      func(tx) {
        if (onlyWithdrawals) {
          tx.transactionType == #withdrawal;
        } else if (onlyDeposits) { tx.transactionType == #deposit } else { true };
      }
    ).map(
      func(tx) {
        {
          amount = tx.amount;
          description = "Filtered transaction";
          outcallType = tx.outcallType;
        };
      }
    );
  };
};
