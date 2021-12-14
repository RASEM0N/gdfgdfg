const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { body, validationResult } = require('express-validator');

// @route           GET api/auth
// @description     Get me user
// @access          Private
router.route('/me').get(auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        await res.status(200).json({
            success: true,
            data: user,
        });
    } catch (e) {
        console.error(e);
        await res.status(400).json({
            success: false,
            msg: `${e.message}`,
        });
    }
});

// @route           POST api/auth
// @description     Authenticate user & get token
// @access          Public
router
    .route('/')
    .post(
        [
            body('email', 'Please include a valid email').isEmail(),
            body('password', 'Password is required').exists(),
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;

            try {
                let user = await User.findOne({ email: email }).select(
                    `+password`
                );
                if (!user) {
                    return res.status(400).json({
                        errors: [
                            {
                                msg: `Invalid Credentials`,
                            },
                        ],
                    });
                }
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return res.status(400).json({
                        errors: [
                            {
                                msg: `Invalid Credentials`,
                            },
                        ],
                    });
                }

                const payload = {
                    user: {
                        id: user.id,
                    },
                };

                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE,
                    },
                    (error, token) => {
                        if (error) throw err;
                        res.json({
                            success: true,
                            token: token,
                        });
                    }
                );
            } catch (e) {
                console.error(e);
                res.status(500).send(`Server error`);
            }
        }
    );

module.exports = router;
