const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: [true, 'Please use an unique email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please use a valid email',
        ],
    },
    password: {
        type: String,
        require: [true, 'Please add a password'],
        minlenght: 6,
        select: false,
    },
    avatar: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('user', UserSchema);
