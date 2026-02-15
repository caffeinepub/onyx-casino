import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Types for original actor state
  type OldUserProfile = {
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

  type Transaction = {
    id : Nat;
    user : Principal;
    transactionType : TransactionType;
    amount : Nat;
    description : ?Text;
    outcallType : ?Text;
    timestamp : Int;
  };

  type TransactionType = {
    #deposit;
    #withdrawal;
    #gameSpin;
    #couponBonus;
    #referralBonus;
  };

  type OldActor = {
    users : Map.Map<Principal, OldUserProfile>;
    withdrawalRequests : Map.Map<Nat, RegistrationData>;
    suspiciousActivityLog : Map.Map<Principal, [Text]>;
    validCouponCodes : Map.Map<Text, Bool>;
    manualPaymentRequests : Map.Map<Nat, ManualPaymentRequest>;
    manualPaymentConfig : ?ManualPaymentConfig;
    stripeConfig : ?StripeConfiguration;
    currentSettings : GameSettings;
  };

  type ManualPaymentRequestStatus = {
    #pending;
    #approved;
    #declined;
  };

  type ManualPaymentRequest = {
    id : Nat;
    user : Principal;
    amount : Nat;
    status : ManualPaymentRequestStatus;
    timestamp : Int;
  };

  type ManualPaymentConfig = {
    qrImageReference : Text;
    instructions : Text;
  };

  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  type GameSettings = {
    houseEdge : Nat;
    probabilities : {
      tiger : Nat;
      dragon : Nat;
      miss : Nat;
      crit : Nat;
    };
  };

  type RegistrationData = {
    displayName : Text;
    dateOfBirth : Text;
    couponCode : ?Text;
    referrer : ?Principal;
  };

  // Types for new actor state
  type NewUserProfile = {
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
    lastSpinResult : ?SpinResult;
  };

  type SpinResult = {
    user : Principal;
    outcome : GameOutcome;
    profit : Int;
    balanceAfterSpin : Nat;
  };

  type GameOutcome = {
    #tiger;
    #dragon;
    #miss;
    #crit;
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserProfile>;
    withdrawalRequests : Map.Map<Nat, RegistrationData>;
    suspiciousActivityLog : Map.Map<Principal, [Text]>;
    validCouponCodes : Map.Map<Text, Bool>;
    manualPaymentRequests : Map.Map<Nat, ManualPaymentRequest>;
    manualPaymentConfig : ?ManualPaymentConfig;
    stripeConfig : ?StripeConfiguration;
    currentSettings : GameSettings;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with lastSpinResult = null };
      }
    );
    { old with users = newUsers };
  };
};
