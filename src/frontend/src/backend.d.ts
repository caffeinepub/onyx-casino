import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ManualPaymentRequest {
    id: bigint;
    status: ManualPaymentRequestStatus;
    user: Principal;
    timestamp: Time;
    amount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Transaction {
    id: bigint;
    transactionType: TransactionType;
    user: Principal;
    description?: string;
    timestamp: Time;
    outcallType?: string;
    amount: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ManualPaymentConfig {
    qrImageReference: string;
    instructions: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface RegistrationData {
    couponCode?: string;
    referrer?: Principal;
    displayName: string;
    dateOfBirth: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SpinResult {
    user: Principal;
    balanceAfterSpin: bigint;
    profit: bigint;
    outcome: GameOutcome;
}
export interface UserProfile {
    id: string;
    bonusGranted: boolean;
    couponCode?: string;
    credits: bigint;
    referrer?: Principal;
    kCheckerState: boolean;
    displayName: string;
    referralBonusAvailed: boolean;
    dateOfBirth: string;
    isEligibleForKidDiscount: boolean;
    lastUpdateTime: bigint;
    creationTime: bigint;
    bonusCouponAvailed: boolean;
    lastSpinResult?: SpinResult;
    balanceUpdates: Array<bigint>;
    profileSetupCompleted: boolean;
    transactions: Array<Transaction>;
}
export enum GameOutcome {
    tiger = "tiger",
    crit = "crit",
    miss = "miss",
    dragon = "dragon"
}
export enum ManualPaymentRequestStatus {
    pending = "pending",
    approved = "approved",
    declined = "declined"
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal",
    gameSpin = "gameSpin",
    referralBonus = "referralBonus",
    couponBonus = "couponBonus"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addValidCouponCode(couponCode: string): Promise<void>;
    adminUpdateCredits(user: Principal, newBalance: bigint): Promise<bigint>;
    approveManualPayment(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeInitialProfileSetup(registrationData: RegistrationData): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createManualPaymentRequest(amount: bigint): Promise<bigint>;
    declineManualPayment(requestId: bigint): Promise<void>;
    getAdminUserBalance(user: Principal, _keep: bigint): Promise<bigint>;
    getAllManualPaymentRequests(): Promise<Array<ManualPaymentRequest>>;
    getAllUserTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCreditPackages(): Promise<Array<{
        credits: bigint;
        name: string;
        priceInrMultiplier: bigint;
    }>>;
    getHouseEdgeValue(): Promise<bigint>;
    getLeaderboard(): Promise<Array<[Principal, bigint]>>;
    getManualPaymentConfig(): Promise<ManualPaymentConfig | null>;
    getManualPaymentRequest(requestId: bigint): Promise<ManualPaymentRequest>;
    getMyBalance(): Promise<bigint>;
    getMyCreditTransactions(): Promise<Array<Transaction>>;
    getMyManualPaymentRequests(): Promise<Array<ManualPaymentRequest>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserCreditTransactions(user: Principal, onlyWithdrawals: boolean, onlyDeposits: boolean): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isValidCouponCode(couponCode: string): Promise<boolean>;
    removeValidCouponCode(couponCode: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setHouseEdgeValue(value: bigint): Promise<void>;
    setManualPaymentConfig(config: ManualPaymentConfig): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    spinWheel(): Promise<SpinResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
