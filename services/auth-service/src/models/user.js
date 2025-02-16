const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { UserRoles } = require('../types/login_type'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
    user_id: { type: Number, unique: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, enum: Object.values(UserRoles), required: true }, 
    is_verified: {type : Boolean, default: false},
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null }, 
    
}, {timestamps: true});

// Apply auto-increment to `user_id`
UserSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(2);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Get JWT
UserSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.COOKIE_EXPIRES
    });
    return token;
};

module.exports = mongoose.model('User', UserSchema);
