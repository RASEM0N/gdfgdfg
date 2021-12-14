const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route           POST api/posts
// @description     Add post
// @access          Private
router.post(
    '/',
    [auth, body('text', 'Text is required').not().isEmpty()],
    async (req, res) => {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: error.array(),
            });
        }

        try {
            const user = await User.findOne({
                _id: req.user.id,
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    errors: [{ msg: 'Invalid id' }],
                });
            }

            const post = await Post.create({
                user: req.user.id,
                text: req.body.text,
                avatar: user.avatar,
                name: user.name,
            });

            await res.status(200).json({
                success: true,
                data: post,
            });
        } catch (e) {
            console.error(e.message);
            await res.status(500).json({
                success: false,
                msg: `Server error`,
            });
        }
    }
);

// @route           GET api/posts
// @description     GET all posts
// @access          Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find();

        await res.status(200).json({
            success: true,
            data: posts,
        });
    } catch (e) {
        console.error(e.message);
        await res.status(500).json({
            success: false,
            msg: `Server error`,
        });
    }
});

// @route           GET api/posts/:post_id
// @description     Get post by ID
// @access          Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(401).json({
                success: false,
                msg: 'Post not found',
            });
        }

        await res.status(200).json({
            success: true,
            data: post,
        });
    } catch (e) {
        console.log(e.message);

        if (e.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                msg: 'Post not found',
            });
        }

        await res.status(500).json({
            success: false,
            msg: `Server error`,
        });
    }
});

// @route           DELETE api/posts/:post_id
// @description     Delete a post
// @access          Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                msg: "Don't have permission to delete",
            });
        }

        await post.remove();

        await res.status(200).json({
            success: true,
            data: {},
        });
    } catch (e) {
        console.log(e.message);

        if (e.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                msg: 'Post not found',
            });
        }

        await res.status(500).json({
            success: false,
            msg: `Server error`,
        });
    }
});

// @route           PUT api/posts/like/:post_id
// @description     Like a post
// @access          Private
router.put('/like/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(401).json({
                success: false,
                msg: 'Post not found',
            });
        }
        // Check if the post has already been liked
        if (post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({
                success: false,
                msg: `Post already liked`,
            });
        }

        post.likes.unshift({
            user: req.user.id,
        });

        await post.save();

        await res.status(200).json({
            success: true,
            data: post,
        });
    } catch (e) {
        console.log(e.message);

        if (e.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                msg: 'Post not found',
            });
        }

        await res.status(500).json({
            success: false,
            msg: `Server error`,
        });
    }
});

// @route           PUT api/posts/unlike/:post_id
// @description     Unlike a post
// @access          Private
router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(401).json({
                success: false,
                msg: 'Post not found',
            });
        }
        // Check if the post has already been liked
        if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({
                success: false,
                msg: `Post has not yet been liked`,
            });
        }

        post.likes = post.likes.filter(({ user }) => {
            return user.toString() !== req.user.id;
        });

        await post.save();

        await res.status(200).json({
            success: true,
            data: post,
        });
    } catch (e) {
        console.log(e.message);

        if (e.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                msg: 'Post not found',
            });
        }

        await res.status(500).json({
            success: false,
            msg: `Server error`,
        });
    }
});

// @route           POST api/posts/comment/:post_id
// @description     Comment on a post
// @access          Private
router.post(
    '/comment/:post_id',
    [auth, body('text', 'Text is required').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: true,
                errors: errors.array(),
            });
        }

        try {
            const post = await Post.findById(req.params.post_id);
            const user = await User.findById(req.user.id);
            if (!post && !user) {
                return res.status(401).json({
                    success: false,
                    msg: 'Post or user not found',
                });
            }

            post.comments.unshift({
                user: req.user.id,
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
            });

            await post.save();

            await res.status(200).json({
                succcess: true,
                data: post,
            });
        } catch (e) {
            console.log(e.message);
            if (e.kind === 'ObjectId') {
                return res.status(404).json({
                    success: false,
                    msg: 'Post not found',
                });
            }
            await res.status(500).json({
                success: false,
                msg: `Server error`,
            });
        }
    }
);

// @route           DELETE api/posts/comment/:post_id/:comment_id
// @description     Delete comment
// @access          Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        const comment = post.comments.find(({ _id }) => {
            return _id.toString() === req.params.comment_id;
        });

        if (!comment) {
            return res.status(404).json({
                success: true,
                msg: 'Comment does not exist',
            });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                msg: 'User not authorized',
            });
        }

        post.comments = post.comments.filter(({ _id }) => {
            return _id.toString() !== req.params.comment_id;
        });

        await post.save();

        await res.status(200).json({
            succcess: true,
            data: post,
        });
    } catch (e) {
        console.log(e.message);
        if (e.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                msg: 'Post not found',
            });
        }
        await res.status(500).json({
            success: false,
            msg: `Server error`,
        });
    }
});
module.exports = router;
