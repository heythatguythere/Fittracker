const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String
    },
    displayName: {
        type: String
    },
    image: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // --- Social Features ---
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequestsReceived: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequestsSent: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);