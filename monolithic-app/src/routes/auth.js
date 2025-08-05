const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const InfluencerProfile = require("../models/influencer_profile");
const BrandProfile = require("../models/brand_profile");
const { run } = require("../utils/ses");
const {
    AUTH_ERRORS,
    USER_ERRORS,
    OTP_ERRORS,
    SERVER_ERRORS,
    SUCCESS_MESSAGES,
} = require('../config/const');
const router = express.Router();
// Utility function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/send-verification-otp:
 *   post:
 *     summary: Send verification OTP to user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: OTP sent
 *       400:
 *         description: Email required or already verified
 *       404:
 *         description: User not found
 */
router.post("/send-verification-otp", async (req, res) => {
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

        // Send email using SES
        await run(email, process.env.SES_EMAIL, otp);

        res.status(200).json({ message: SUCCESS_MESSAGES.OTP_SENT });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend verification OTP to user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: OTP resent
 *       400:
 *         description: Email required or already verified
 *       404:
 *         description: User not found
 */
router.post("/resend-otp", async (req, res) => {
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

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and activate account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Account verified
 *       400:
 *         description: Invalid OTP or already verified
 *       404:
 *         description: User not found
 */
router.post("/verify-otp", async (req, res) => {
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
            return res.status(400).json({ error: OTP_ERRORS.INVALID_OTP });
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

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *       400:
 *         description: Email required
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", async (req, res) => {
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

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or missing fields
 *       404:
 *         description: User not found
 */
router.post("/reset-password", async (req, res) => {
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

        // Assign new password (pre-save hook will hash it)
        user.password = newPassword;

        // Clear OTP fields
        user.otp = null;
        user.otpExpires = null;

        // Save user (pre-save will hash the password)
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("ERROR:", err);
        return res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirm_password
 *               - user_type
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               confirm_password:
 *                 type: string
 *                 example: password123
 *               user_type:
 *                 type: string
 *                 enum: [influencer, brand, admin]
 *     responses:
 *       201:
 *         description: User registered successfully. Please verify your account.
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Internal server error
 */
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, confirm_password, user_type } = req.body;
        // … your existing validation …

        const user = new User({ name, email, password, user_type });
        await user.save();
        console.log("User created:", user);

        // --- NEW: create a matching "empty" profile stub ---
        const [firstName, ...rest] = name.trim().split(/\s+/);
        const lastName = rest.join(' ');

        if (user_type === 'influencer') {
            await new InfluencerProfile({
                user_id: user.user_id,
                full_name: { first_name: firstName, last_name: lastName },
                address: {
                    street_address: 'N/A',
                    street_address_line2: '',
                    city: 'N/A',
                    state: 'N/A',
                    postal_code: '000000'
                },
                phone_number: '0000000000',
                email: email,
                primary_social_media: [],
                content_categories: [],
                preferred_content_types: [],
                languages: [],
                past_brand_collaborations: false,
                collaboration_preferences: [],
                minimum_budget: 0,
                availability: []
            }).save();

        }
        else if (user_type === 'brand') {
            const brandStub = new BrandProfile({
                // 1.
                user_id: user.user_id,

                // 2. – use the user’s full name or some placeholder
                company_name: name,

                // 3.
                industry: '',

                // 4–6.
                contact_person: {
                    name: name,       // from req.body.name
                    position: '',         // placeholder
                    email: email       // req.body.email
                },

                // 7.
                description: ''
            });

            // skip required‐field validation on this initial stub:
            await brandStub.save({ validateBeforeSave: false });

        }
        // (admins don’t have a separate profile model)

        return res
            .status(201)
            .json({ message: "User registered successfully. Please verify your account." });
    }
    catch (err) {
        console.error("ERROR: ", err);
        return res
            .status(500)
            .json({ error: SERVER_ERRORS.INTERNAL_ERROR || "Internal Server Error" });
    }
});



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - user_type
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               user_type:
 *                 type: string
 *                 enum: [influencer, brand, admin]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     user_type:
 *                       type: string
 *                     is_verified:
 *                       type: boolean
 *                     profile_completed:
 *                       type: boolean
 *       400:
 *         description: Invalid credentials or validation error
 */
router.post("/login", async (req, res) => {
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
        console.log("Password match:", isMatch);
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
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                user_type: user.user_type,
                is_verified: user.is_verified,
                profile_completed: user.profile_completed,
            },
        });
    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: SERVER_ERRORS.INTERNAL_ERROR });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (JWT clients just delete token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", async (req, res) => {
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