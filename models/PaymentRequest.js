const mongoose = require("mongoose");

const PaymentRequest = new mongoose.Schema({

    requestId: String,

    bank: String,

    name: String,

    status: {
        type: String,
        default: "waiting"
    },

    token: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "PaymentRequest",
    PaymentRequest
);
