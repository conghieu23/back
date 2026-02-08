function required(name: string) {
    const val = process.env[name];
    if (!val) throw new Error(`Missing env variable: ${name}`);
    return val;
}
export const env = {
    port: required("PORT"),
    db_url: required("DB_URL"),
    jwt_secret: required("JWT_SECRET"),
    jwt_expires_in: required("JWT_EXPIRES_IN"),

    google_client_id: required("GOOGLE_CLIENT_ID"),
    google_client_secret: required("GOOGLE_CLIENT_SECRET"),

    fpayment_merchant_id: required("FPAYMENT_MERCHANT_ID"),
    fpayment_secret: required("FPAYMENT_SECRET"),

    gmail_user: required("GMAIL_USER"),
    gmail_app: required("GMAIL_APP"),
}