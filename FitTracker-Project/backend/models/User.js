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
        // Not required because users can sign in with Google
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
    // --- THIS IS THE CRITICAL ADDITION ---
    role: {
        type: String,
        enum: ['user', 'admin'], // Ensures the role can only be one of these two values
        default: 'user'         // Automatically sets all new users to the 'user' role
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{ // incoming requests (users who requested me)
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentFriendRequests: [{ // outgoing requests (users I requested)
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { 
    timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

module.exports = mongoose.model('User', UserSchema);