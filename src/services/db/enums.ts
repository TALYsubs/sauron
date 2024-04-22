export const role_company_media_type = {
    LOGO: "LOGO",
    COVER: "COVER",
    AVATAR: "AVATAR",
    VIDEO: "VIDEO"
} as const;
export type role_company_media_type = (typeof role_company_media_type)[keyof typeof role_company_media_type];
export const role_company_type = {
    VENDOR: "VENDOR",
    CORP: "CORP"
} as const;
export type role_company_type = (typeof role_company_type)[keyof typeof role_company_type];
export const subscription_status = {
    ACTIVE: "ACTIVE",
    PAUSED: "PAUSED",
    SKIP: "SKIP",
    CANCELLED: "CANCELLED",
    DRAFT: "DRAFT",
    COMPLETED: "COMPLETED",
    PAYMENT_FAILURE: "PAYMENT_FAILURE"
} as const;
export type subscription_status = (typeof subscription_status)[keyof typeof subscription_status];
export const contract_status = {
    NO_ACTION: "NO_ACTION",
    UPDATE: "UPDATE"
} as const;
export type contract_status = (typeof contract_status)[keyof typeof contract_status];
export const product_selection = {
    FIXED: "FIXED",
    DYNAMIC: "DYNAMIC"
} as const;
export type product_selection = (typeof product_selection)[keyof typeof product_selection];
export const pricing_type = {
    FIXED: "FIXED",
    DYNAMIC: "DYNAMIC"
} as const;
export type pricing_type = (typeof pricing_type)[keyof typeof pricing_type];
export const plan_type = {
    BUILD_A_BOX: "BUILD_A_BOX",
    BUNDLE: "BUNDLE",
    TRIAL: "TRIAL",
    START_REFILL: "START_REFILL",
    STANDARD: "STANDARD"
} as const;
export type plan_type = (typeof plan_type)[keyof typeof plan_type];
export const duration_type = {
    DAY: "DAY",
    WEEK: "WEEK",
    MONTH: "MONTH",
    YEAR: "YEAR"
} as const;
export type duration_type = (typeof duration_type)[keyof typeof duration_type];
export const address_type = {
    DELIVERY: "DELIVERY",
    BILLING: "BILLING",
    COMPANY: "COMPANY"
} as const;
export type address_type = (typeof address_type)[keyof typeof address_type];
export const cart_type = {
    MAIN: "MAIN",
    RENEWAL: "RENEWAL"
} as const;
export type cart_type = (typeof cart_type)[keyof typeof cart_type];
export const coupon_duration_type = {
    ONCE: "ONCE",
    FOREVER: "FOREVER",
    REPEATING: "REPEATING"
} as const;
export type coupon_duration_type = (typeof coupon_duration_type)[keyof typeof coupon_duration_type];
export const invoice_item_type = {
    SUBSCRIPTION: "SUBSCRIPTION",
    DELIVERY: "DELIVERY",
    DISCOUNT: "DISCOUNT"
} as const;
export type invoice_item_type = (typeof invoice_item_type)[keyof typeof invoice_item_type];
export const order_line_type = {
    SUBSCRIPTION: "SUBSCRIPTION",
    PRODUCT: "PRODUCT",
    DELIVERY: "DELIVERY",
    DISCOUNT: "DISCOUNT"
} as const;
export type order_line_type = (typeof order_line_type)[keyof typeof order_line_type];
export const plan_status = {
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
} as const;
export type plan_status = (typeof plan_status)[keyof typeof plan_status];
export const payout_status = {
    PENDING: "PENDING",
    PROCESSED: "PROCESSED",
    ERROR: "ERROR"
} as const;
export type payout_status = (typeof payout_status)[keyof typeof payout_status];
export const order_status = {
    PENDING: "PENDING",
    SCHEDULE: "SCHEDULE",
    FULFILLED: "FULFILLED",
    ON_HOLD: "ON_HOLD",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
} as const;
export type order_status = (typeof order_status)[keyof typeof order_status];
export const recurring_type = {
    WEEKLY: "WEEKLY",
    BIWEEKLY: "BIWEEKLY",
    MONTHLY: "MONTHLY",
    QUARTERLY: "QUARTERLY"
} as const;
export type recurring_type = (typeof recurring_type)[keyof typeof recurring_type];
export const purchase_type = {
    RECURRING: "RECURRING",
    ONCE_OFF: "ONCE_OFF"
} as const;
export type purchase_type = (typeof purchase_type)[keyof typeof purchase_type];
