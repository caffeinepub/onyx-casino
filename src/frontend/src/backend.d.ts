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
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
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
export interface CreditTransaction {
    description: string;
    outcallType?: string;
    amount: bigint;
}
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
    credits: bigint;
    transactions: Array<Transaction>;
}
export enum GameOutcome {
    tiger = "tiger",
    crit = "crit",
    miss = "miss",
    dragon = "dragon"
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal",
    gameSpin = "gameSpin"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHouseEdgeValue(): Promise<bigint>;
    getLeaderboard(): Promise<Array<[Principal, bigint]>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserCreditTransactions(user: Principal, onlyWithdrawals: boolean, onlyDeposits: boolean): Promise<Array<CreditTransaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setHouseEdgeValue(value: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    spinWheel(): Promise<SpinResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
