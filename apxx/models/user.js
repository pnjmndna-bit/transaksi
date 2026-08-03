const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    name: String,

    username: {
        type: String,
        unique: true
    },

    password: String,

    banks: {
        type: Array,
        default: []
    },

    transactions: {
        type: Array,
        default: []
    },

    categories: {
        type: Object,
        default: {
            income: [],
            expense: []
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
