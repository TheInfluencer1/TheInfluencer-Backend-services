// Authentication Errors
const AUTH_ERRORS = {
    MISSING_TOKEN: "Access denied. No token provided.",
    INVALID_TOKEN: "Invalid or expired token.",
    USER_NOT_FOUND: "User not found.",
    ACCOUNT_NOT_VERIFIED: "Account not verified. Please verify your account first.",
};

// User Registration & Login Errors
const USER_ERRORS = {
    MISSING_FIELDS: "Please enter all required fields.",
    PASSWORD_MISMATCH: "Confirm password does not match password.",
    USER_EXISTS: "User already exists. Please log in.",
    EMAIL_NOT_FOUND: "Email does not exist. Please sign up.",
    INVALID_CREDENTIALS: "Invalid credentials.",
};

// OTP & Verification Errors
const OTP_ERRORS = {
    EMAIL_REQUIRED: "Email is required.",
    ACCOUNT_ALREADY_VERIFIED: "Account is already verified.",
    INVALID_OTP: "Invalid or expired OTP.",
};

// General Server Errors
const SERVER_ERRORS = {
    INTERNAL_ERROR: "Internal Server Error.",
};

// Success Messages
const SUCCESS_MESSAGES = {
    SIGNUP_SUCCESS: "User registered successfully. Please verify your account.",
    LOGIN_SUCCESS: "Login successful.",
    LOGOUT_SUCCESS: "Logout successful.",
    OTP_SENT: "OTP sent successfully. Please check your email.",
    ACCOUNT_VERIFIED: "Account verified successfully.",
};

module.exports = {
    AUTH_ERRORS,
    USER_ERRORS,
    OTP_ERRORS,
    SERVER_ERRORS,
    SUCCESS_MESSAGES,
}; 