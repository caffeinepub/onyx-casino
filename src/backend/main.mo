import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  let withdrawalRequests = Map.empty<Nat, RegistrationData>();
  let suspiciousActivityLog = Map.empty<Principal, [Text]>();
  let validCouponCodes = Map.empty<Text, Bool>();

  public type ManualPaymentRequestStatus = { #pending; #approved; #declined };
  public type ManualPaymentRequest = {
    id : Nat;
    user : Principal;
    amount : Nat;
    status : ManualPaymentRequestStatus;
    timestamp : Time.Time;
  };
  public type ManualPaymentConfig = {
    qrImageReference : Text;
    instructions : Text;
  };

  let manualPaymentRequests = Map.empty<Nat, ManualPaymentRequest>();
  var manualPaymentConfig : ?ManualPaymentConfig = null;

  public type GameOutcome = {
    #tiger;
    #dragon;
    #miss;
    #crit;
  };

  public type GameSettings = {
    houseEdge : Nat;
    probabilities : {
      tiger : Nat;
      dragon : Nat;
      miss : Nat;
      crit : Nat;
    };
  };

  public type TransactionType = {
    #deposit;
    #withdrawal;
    #gameSpin;
    #couponBonus;
    #referralBonus;
  };

  public type Transaction = {
    id : Nat;
    user : Principal;
    transactionType : TransactionType;
    amount : Nat;
    description : ?Text;
    outcallType : ?Text;
    timestamp : Time.Time;
  };

  public type RegistrationData = {
    displayName : Text;
    dateOfBirth : Text;
    couponCode : ?Text;
    referrer : ?Principal;
  };

  public type UserProfile = {
    id : Text;
    displayName : Text;
    dateOfBirth : Text;
    credits : Nat;
    transactions : [Transaction];
    couponCode : ?Text;
    referrer : ?Principal;
    kCheckerState : Bool;
    creationTime : Int;
    lastUpdateTime : Int;
    isEligibleForKidDiscount : Bool;
    balanceUpdates : [Int];
    referralBonusAvailed : Bool;
    bonusCouponAvailed : Bool;
    profileSetupCompleted : Bool;
    bonusGranted : Bool;
  };

  public type SpinResult = {
    user : Principal;
    outcome : GameOutcome;
    profit : Int;
    balanceAfterSpin : Nat;
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  var currentSettings : GameSettings = {
    houseEdge = 800;
    probabilities = {
      tiger = 2900;
      dragon = 980;
      miss = 4620;
      crit = 2500;
    };
  };

  let creditConversionRate = 2;
  let baseBet = 50;
  let bigCreditBonusThreshold = 250_000;
  let withdrawalBonusThreshold = 300_000;
  let couponBonusAmount = 100;
  let referralBonusAmount = 200;

  validCouponCodes.add("WELCOME100", true);
  validCouponCodes.add("NEWUSER", true);

  func getUserProfileOrTrap(caller : Principal) : UserProfile {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func adminUpdateCredits(user : Principal, newBalance : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let oldProfile = getUserProfileOrTrap(user);
    let updatedProfile = { oldProfile with credits = newBalance };
    users.add(user, updatedProfile);
    newBalance;
  };

  public query ({ caller }) func getAdminUserBalance(user : Principal, _keep : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view user balances");
    };
    let profile = getUserProfileOrTrap(user);
    profile.credits;
  };

  public shared ({ caller }) func completeInitialProfileSetup(registrationData : RegistrationData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete profile setup");
    };

    if (users.containsKey(caller)) {
      Runtime.trap("Profile already exists. Cannot re-register.");
    };

    switch (registrationData.referrer) {
      case (?referrerPrincipal) {
        if (Principal.equal(referrerPrincipal, caller)) {
          Runtime.trap("Cannot refer yourself");
        };
      };
      case (null) {};
    };

    let newProfile : UserProfile = {
      id = caller.toText();
      displayName = registrationData.displayName;
      dateOfBirth = registrationData.dateOfBirth;
      credits = 100;
      transactions = [];
      couponCode = registrationData.couponCode;
      referrer = registrationData.referrer;
      kCheckerState = false;
      creationTime = Time.now();
      lastUpdateTime = Time.now();
      isEligibleForKidDiscount = false;
      balanceUpdates = [];
      referralBonusAvailed = false;
      bonusCouponAvailed = false;
      profileSetupCompleted = true;
      bonusGranted = true;
    };

    users.add(caller, newProfile);

    switch (registrationData.couponCode) {
      case (?couponCode) {
        switch (validCouponCodes.get(couponCode)) {
          case (?true) { grantCouponBonus(caller) };
          case (null) {};
          case (?false) {};
        };
      };
      case (null) {};
    };

    switch (registrationData.referrer) {
      case (?referrerPrincipal) {
        switch (users.get(referrerPrincipal)) {
          case (?_referrerProfile) {
            grantReferralBonus(caller, referrerPrincipal);
          };
          case (null) {};
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = getUserProfileOrTrap(caller);

    let updatedProfile : UserProfile = {
      profile with
      id = existingProfile.id;
      credits = existingProfile.credits;
      transactions = existingProfile.transactions;
      couponCode = existingProfile.couponCode;
      referrer = existingProfile.referrer;
      bonusCouponAvailed = existingProfile.bonusCouponAvailed;
      referralBonusAvailed = existingProfile.referralBonusAvailed;
      creationTime = existingProfile.creationTime;
      kCheckerState = existingProfile.kCheckerState;
      balanceUpdates = existingProfile.balanceUpdates;
      profileSetupCompleted = existingProfile.profileSetupCompleted;
      bonusGranted = existingProfile.bonusGranted;
    };

    users.add(caller, updatedProfile);
  };

  func grantCouponBonus(user : Principal) {
    let profile = getUserProfileOrTrap(user);

    if (profile.bonusCouponAvailed) { return };

    let newTransaction : Transaction = {
      id = profile.transactions.size();
      user = user;
      transactionType = #couponBonus;
      amount = couponBonusAmount;
      description = ?"Coupon bonus: 100 credits";
      outcallType = null;
      timestamp = Time.now();
    };

    let updatedProfile : UserProfile = {
      profile with
      credits = profile.credits + couponBonusAmount;
      transactions = profile.transactions.concat([newTransaction]);
      bonusCouponAvailed = true;
    };

    users.add(user, updatedProfile);
  };

  func grantReferralBonus(referredUser : Principal, referrer : Principal) {
    let referredProfile = getUserProfileOrTrap(referredUser);

    if (referredProfile.referralBonusAvailed) { return };

    let updatedReferredProfile : UserProfile = {
      referredProfile with
      referralBonusAvailed = true;
    };
    users.add(referredUser, updatedReferredProfile);

    let referrerProfile = getUserProfileOrTrap(referrer);

    let newTransaction : Transaction = {
      id = referrerProfile.transactions.size();
      user = referrer;
      transactionType = #referralBonus;
      amount = referralBonusAmount;
      description = ?"Referral bonus: 200 credits for referring a user";
      outcallType = null;
      timestamp = Time.now();
    };

    let updatedReferrerProfile : UserProfile = {
      referrerProfile with
      credits = referrerProfile.credits + referralBonusAmount;
      transactions = referrerProfile.transactions.concat([newTransaction]);
    };

    users.add(referrer, updatedReferrerProfile);
  };

  func updateCreditBalance(caller : Principal, amount : Int, transactionType : TransactionType) {
    let profile = getUserProfileOrTrap(caller);
    var newBalance : Int = profile.credits;

    if (amount < 0) {
      if (profile.credits < -amount) {
        Runtime.trap("Insufficient balance for transaction");
      };
      newBalance -= -amount;
    } else { newBalance += amount };

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
      timestamp = Time.now();
    };

    let updatedProfile : UserProfile = {
      profile with
      credits = newBalance.toNat();
      transactions = profile.transactions.concat([newTransaction]);
    };

    users.add(caller, updatedProfile);
  };

  func handleWithdrawalBonus(_user : Principal, withdrawalAmount : Nat) : Nat {
    if (withdrawalAmount >= withdrawalBonusThreshold) { withdrawalAmount / 10 } else { 0 };
  };

  func processMultipliers(caller : Principal, effectType : GameOutcome, baseBet : Nat) : Nat {
    let multiplier = switch (effectType) {
      case (#tiger) { 140 };
      case (#dragon) { 196 };
      case (#miss) { 0 };
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
      timestamp = Time.now();
    };

    let newCredits = baseBet + multiplierAmount;
    let profile = getUserProfileOrTrap(caller);
    let updatedProfile : UserProfile = {
      profile with
      credits = newCredits;
      transactions = profile.transactions.concat([newTransaction]);
    };
    users.add(caller, updatedProfile);
    baseBet;
  };

  func applyMultiplier(_gain : Nat) : Nat { baseBet };

  func payoutReferralBonus(user : Principal) : Nat {
    let profile = getUserProfileOrTrap(user);
    if (profile.referralBonusAvailed or profile.referrer == null) { 0 } else {
      let update : UserProfile = { profile with referralBonusAvailed = true };
      users.add(user, update);
      1;
    };
  };

  func payoutBonusCoupon(user : Principal) : Nat {
    let profile = getUserProfileOrTrap(user);
    if (profile.bonusCouponAvailed or profile.couponCode == null) { 0 } else {
      let update : UserProfile = { profile with bonusCouponAvailed = true };
      users.add(user, update);
      100;
    };
  };

  func getBonusTypes(user : Principal) : [Text] {
    let profile = getUserProfileOrTrap(user);

    if ((not profile.bonusCouponAvailed) and (not profile.referralBonusAvailed)) {
      ["BonusCoupon", "ReferralBonus"];
    } else if (profile.bonusCouponAvailed and (not profile.referralBonusAvailed)) {
      ["ReferralBonus"];
    } else if ((not profile.bonusCouponAvailed) and profile.referralBonusAvailed) {
      ["BonusCoupon"];
    } else { [] };
  };

  func determineWheelOutcome(spinResult : Nat, _flags : [Text]) : GameOutcome {
    if (spinResult <= currentSettings.probabilities.tiger) {
      #tiger;
    } else if (spinResult <= (currentSettings.probabilities.tiger + currentSettings.probabilities.dragon)) {
      #dragon;
    } else if (spinResult <= (currentSettings.probabilities.tiger + currentSettings.probabilities.dragon + currentSettings.probabilities.miss)) {
      #miss;
    } else { #crit };
  };

  public shared ({ caller }) func spinWheel() : async SpinResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can spin the wheel");
    };

    let profile = getUserProfileOrTrap(caller);

    if (profile.credits < baseBet) { Runtime.trap("Insufficient funds, bet failed") };

    let spinResult = 7727;
    let outcome = determineWheelOutcome(spinResult, []);
    var profit : Int = -Int.abs(baseBet);

    switch (outcome) {
      case (#tiger) {
        profit := baseBet * 140 / 100 - baseBet;
      };
      case (#dragon) {
        profit := baseBet * 196 / 100 - baseBet;
      };
      case (#crit) { profit := -Int.abs((baseBet / 2) + baseBet) };
      case (#miss) { profit := -Int.abs(baseBet) };
    };

    if (profit < 0 and profile.credits < -profit) {
      Runtime.trap("Insufficient balance for transaction");
    };

    let balanceAfterSpin : Nat = if (profit < 0) {
      profile.credits - (-profit).toNat();
    } else { profile.credits + profit.toNat() };

    let updatedProfile = {
      profile with
      credits = balanceAfterSpin;
    };
    users.add(caller, updatedProfile);

    {
      user = caller;
      outcome;
      profit;
      balanceAfterSpin;
    };
  };

  func handleWithdrawal(value : Nat) : Nat {
    value;
  };

  func processWithdrawalBonus(caller : Principal, withdrawalAmount : Nat) : Nat {
    if (withdrawalAmount >= withdrawalBonusThreshold) {
      let bonusAmount = (withdrawalAmount * 2) / 10;
      let profile = getUserProfileOrTrap(caller);
      let newTransaction : Transaction = {
        id = users.toArray().size() + 1;
        user = caller;
        transactionType = #deposit;
        amount = bonusAmount;
        description = ?"Bonus";
        outcallType = null;
        timestamp = Time.now();
      };
      let updatedProfile : UserProfile = {
        profile with
        credits = profile.credits + bonusAmount;
        transactions = profile.transactions.concat([newTransaction]);
      };
      users.add(caller, updatedProfile);
      return bonusAmount;
    };
    0;
  };

  func processBigCreditBonus(caller : Principal, creditAmount : Nat) : Nat {
    if (creditAmount >= bigCreditBonusThreshold) {
      let bonus = creditAmount;
      let profile = getUserProfileOrTrap(caller);
      let newTransaction : Transaction = {
        id = users.toArray().size() + 1;
        user = caller;
        transactionType = #deposit;
        amount = bonus;
        description = ?"Bonus";
        outcallType = null;
        timestamp = Time.now();
      };
      let updatedProfile : UserProfile = {
        profile with
        credits = profile.credits + bonus;
        transactions = profile.transactions.concat([newTransaction]);
      };
      users.add(caller, updatedProfile);
      bonus;
    } else { 0 };
  };

  func getUserSuspiciousActivity(caller : Principal) : [Text] {
    switch (suspiciousActivityLog.get(caller)) {
      case (null) { [] };
      case (?activity) { activity };
    };
  };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view house edge");
    };
    currentSettings.houseEdge;
  };

  public query ({ caller }) func getAllUserTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };

    let allTransactionArrays = users.toArray().map(
      func((_, profile)) { profile.transactions }
    );
    let transactionsFlatArray = Array.fromIter(
      allTransactionArrays.values().flatMap(
        func(x) { x.values() }
      )
    );
    transactionsFlatArray;
  };

  public query ({ caller }) func getMyCreditTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    let profile = getUserProfileOrTrap(caller);
    profile.transactions;
  };

  public query ({ caller }) func getUserCreditTransactions(user : Principal, onlyWithdrawals : Bool, onlyDeposits : Bool) : async [Transaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    let profile = getUserProfileOrTrap(user);
    profile.transactions.filter(
      func(tx) {
        if (onlyWithdrawals and not onlyDeposits) {
          switch (tx.transactionType) {
            case (#withdrawal or #couponBonus or #referralBonus) { true };
            case (#deposit or #gameSpin) { false };
          };
        } else if (not onlyWithdrawals and onlyDeposits) {
          switch (tx.transactionType) {
            case (#deposit or #couponBonus or #referralBonus) { true };
            case (#withdrawal or #gameSpin) { false };
          };
        } else { true };
      }
    );
  };

  public query ({ caller }) func getMyBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };

    let profile = getUserProfileOrTrap(caller);
    profile.credits;
  };

  public query ({ caller }) func getLeaderboard() : async [(Principal, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leaderboard");
    };

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

  public query ({ caller }) func getCreditPackages() : async [{
    name : Text;
    credits : Nat;
    priceInrMultiplier : Nat;
  }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view credit packages");
    };
    [
      {
        name = "Basic";
        credits = 8000;
        priceInrMultiplier = 2000;
      },
      {
        name = "Premium";
        credits = 22_000;
        priceInrMultiplier = 5500;
      },
      {
        name = "Special";
        credits = 5000;
        priceInrMultiplier = 1000;
      },
      {
        name = "High Roller";
        credits = 990_000;
        priceInrMultiplier = 50_000;
      },
    ];
  };

  public shared ({ caller }) func addValidCouponCode(couponCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add coupon codes");
    };
    validCouponCodes.add(couponCode, true);
  };

  public shared ({ caller }) func removeValidCouponCode(couponCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove coupon codes");
    };
    validCouponCodes.remove(couponCode);
  };

  public query ({ caller }) func isValidCouponCode(couponCode : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate coupon codes");
    };
    validCouponCodes.get(couponCode) == ?true;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func createManualPaymentRequest(amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment requests");
    };

    let newId = manualPaymentRequests.size() + 1;
    let request : ManualPaymentRequest = {
      id = newId;
      user = caller;
      amount;
      status = #pending;
      timestamp = Time.now();
    };
    manualPaymentRequests.add(newId, request);
    newId;
  };

  public query ({ caller }) func getManualPaymentRequest(requestId : Nat) : async ManualPaymentRequest {
    switch (manualPaymentRequests.get(requestId)) {
      case (null) { Runtime.trap("Manual request not found") };
      case (?request) {
        if (caller != request.user and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own payment requests");
        };
        request;
      };
    };
  };

  public query ({ caller }) func getAllManualPaymentRequests() : async [ManualPaymentRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list payment requests");
    };
    manualPaymentRequests.values().toArray();
  };

  public query ({ caller }) func getMyManualPaymentRequests() : async [ManualPaymentRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their requests");
    };

    manualPaymentRequests.values().toArray().filter(
      func(request) { request.user == caller }
    );
  };

  public query ({ caller }) func getManualPaymentConfig() : async ?ManualPaymentConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment configuration");
    };
    manualPaymentConfig;
  };

  public shared ({ caller }) func setManualPaymentConfig(config : ManualPaymentConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update QR instructions");
    };
    manualPaymentConfig := ?config;
  };

  public shared ({ caller }) func approveManualPayment(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve payment requests");
    };

    switch (manualPaymentRequests.get(requestId)) {
      case (null) { Runtime.trap("Payment request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Payment must be pending to approve");
        };

        let updatedRequest = { request with status = #approved };
        manualPaymentRequests.add(requestId, updatedRequest);

        let profile = getUserProfileOrTrap(request.user);
        let transactionId = profile.transactions.size();

        let newTransaction : Transaction = {
          id = transactionId;
          user = request.user;
          transactionType = #deposit;
          amount = request.amount;
          description = ?"Manual payment deposit via admin approval";
          outcallType = null;
          timestamp = Time.now();
        };

        let updatedProfile : UserProfile = {
          profile with
          credits = profile.credits + request.amount;
          transactions = profile.transactions.concat([newTransaction]);
        };

        users.add(request.user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func declineManualPayment(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can decline payment requests");
    };

    switch (manualPaymentRequests.get(requestId)) {
      case (null) { Runtime.trap("Payment request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Payment must be pending to decline");
        };
        let updatedRequest = { request with status = #declined };
        manualPaymentRequests.add(requestId, updatedRequest);
      };
    };
  };
};
