"use strict";

const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
// const AWS = require("aws-sdk");
const router = express.Router();
const {authMiddleware }= require('../utils/auth_utils');
const  {
    AUTH_ERRORS,
    USER_ERRORS,
    OTP_ERRORS,
    SERVER_ERRORS,
    SUCCESS_MESSAGES,
} = require('../../../../config/const');
const {run} = require("../utils/ses");
// Utility function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send Verification OTP via Amazon SES using the `run` function
router.post("/api/send-verification-otp", authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: OTP_ERRORS.EMAIL_REQUIRED });
        }

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: AUTH_ERRORS.USER_NOT_FOUND });
        }

        // Check if already verified
        if (user.is_verified) {
            return res.status(400).json({ error: OTP_ERRORS.ACCOUNT_ALREADY_VERIFIED });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP to user model
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send email using `run` function from SES module
        // email will be receipent email 
        // ses will be sender email 
        await run(email, process.env.SES_EMAIL,otp);

        res.status(200).json({ message: SUCCESS_MESSAGES.OTP_SENT });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// Resend OTP API
router.post("/api/resend-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: OTP_ERRORS.EMAIL_REQUIRED });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: AUTH_ERRORS.USER_NOT_FOUND });
        }

        // Check if already verified
        if (user.is_verified) {
            return res.status(400).json({ error: OTP_ERRORS.ACCOUNT_ALREADY_VERIFIED });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Update OTP details
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via email
        await run(email, process.env.SES_EMAIL, otp);

        res.status(200).json({ message: SUCCESS_MESSAGES.OTP_SENT });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// Verify OTP and Activate Account
router.post("/api/verify-otp", authMiddleware, async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: AUTH_ERRORS.USER_NOT_FOUND });
        }

        // Check if already verified
        if (user.is_verified) {
            return res.status(400).json({ error: OTP_ERRORS.ACCOUNT_ALREADY_VERIFIED });
        }

        // Check if OTP matches and is not expired
        if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ error:OTP_ERRORS.INVALID_OTP });
        }

        // Verify the account
        user.is_verified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: SUCCESS_MESSAGES.ACCOUNT_VERIFIED });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// Forgot Password API
router.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: AUTH_ERRORS.USER_NOT_FOUND });
        }

        // Generate OTP for password reset
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP to user model
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via email
        await run(email, process.env.SES_EMAIL, otp);

        res.status(200).json({ message: "Password reset OTP sent successfully" });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// Verify OTP and Reset Password
router.post("/api/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "Email, OTP, and new password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: AUTH_ERRORS.USER_NOT_FOUND });
        }

        // Check OTP validity
        if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ error: OTP_ERRORS.INVALID_OTP });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// signup api
router.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password, confirm_password, user_type } = req.body;

        if (!name || !email || !password || !confirm_password || !user_type) {
            return res.status(400).json({ error: "Please enter all required fields" });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ error: "Confirm password does not match password" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists. Please log in." });
        }

        const user = new User({
            name,
            email,
            password,
            user_type,
            is_verified: false,
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully. Please verify your account." });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// login api region
router.post("/api/login", async (req, res) => {
    try {
        const { email, password, user_type } = req.body;

        // Check for missing fields
        if (!email || !password || !user_type) {
            return res.status(400).json({ error: "Please enter all required fields" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Email does not exist. Please Sign Up" });
        }

        // Validate user type
        if (user.user_type !== user_type) {
            return res.status(400).json({ error: "Invalid user type" });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = await user.getJWT();

        // Store the token in Cookies
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
        });

        res.status(200).json({
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type,
                is_verified: user.is_verified,
            },
        });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});


// Logout Route
router.post("/api/logout", authMiddleware, async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            sameSite: "strict",
            expires: new Date(0),
        });

        res.status(200).json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
    } catch (err) {
        console.error("ERROR: " + err.message);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

module.exports = router;