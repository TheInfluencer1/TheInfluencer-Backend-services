"use strict";

const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AWS = require("aws-sdk");
const router = express.Router();
const {authMiddleware }= require('../utils/auth_utils');
const  {
    AUTH_ERRORS,
    USER_ERRORS,
    OTP_ERRORS,
    SERVER_ERRORS,
    SUCCESS_MESSAGES,
} = require('../../../../config/const');


// Configure AWS SES
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION, 
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

// Utility function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send Verification OTP via Amazon SES
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
            return res.status(400).json({ error: OTP_ERRORS.ACCOUNT_ALREADY_VERIFIED});
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); 

        // Save OTP to user model
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Prepare SES email parameters
        const params = {
            Source: process.env.SES_EMAIL, 
            Destination: { ToAddresses: [email] },
            Message: {
                Subject: { Data: "Your Verification OTP" },
                Body: {
                    Text: {
                        Data: `Your verification OTP is: ${otp}. This OTP will expire in 5 minutes.`,
                    },
                },
            },
        };

        // Send email using SES
        await ses.sendEmail(params).promise();

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

// Signup Route
router.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password, confirm_password, user_type } = req.body;

        // Check for missing fields
        if (!name || !email || !password || !confirm_password || !user_type) {
            return res.status(400).json({ error: "Please enter all required fields" });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ error: "Confirm password does not match password" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists. Please log in." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user instance
        const user = new User({
            name,
            email,
            password: hashedPassword,
            user_type,
            // Default false until verified
            is_verified: false, 
        });

        // Save user to database
        await user.save();

        res.status(201).json({ message: "User registered successfully. Please verify your account." });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

// Login Route with Verification Check
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

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { _id: user._id, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

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