const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {AUTH_ERRORS} = require('../../../../config/const');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: AUTH_ERRORS.MISSING_TOKEN });
        }

        // Verify JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user
        const user = await User.findById(decoded._id).select("-password"); 
        if (!user) {
            return res.status(404).json({ error: AUTH_ERRORS.USER_NOT_FOUND });
        }
         // Attach user object to request
        req.user = user;
        next(); 
    } catch (err) {
        console.error("AUTH ERROR:", err);
        return res.status(403).json({ error: AUTH_ERRORS.INVALID_TOKEN });
    }
};

module.exports = { authMiddleware };
