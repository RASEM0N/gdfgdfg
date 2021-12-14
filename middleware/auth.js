const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({
            success: false,
            msg: `No token, authorization denied`,
        });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded.user.toString());
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(401).json({
            success: false,
            msg: `Token is not valid`,
        });
    }
};
