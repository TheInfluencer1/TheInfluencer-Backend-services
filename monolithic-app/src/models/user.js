const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Counter = require('./counter');
const { UserRoles } = require('../types/login_type');

const UserSchema = new mongoose.Schema({
    user_id: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, enum: Object.values(UserRoles), required: true },
    is_verified: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    profile_completed: { type: Boolean, default: false },
    last_login: { type: Date, default: Date.now },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
}, { timestamps: true });

// Manual auto-increment logic
UserSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'user_id' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.user_id = counter.seq;
        }

        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        next();
    } catch (err) {
        next(err);
    }
});

// Compare passwords
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Generate JWT
UserSchema.methods.getJWT = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.COOKIE_EXPIRES || '7d' }
    );
};

module.exports = mongoose.model('User', UserSchema);
