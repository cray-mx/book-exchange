const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    isComplete: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    buyer: {
        type: String,
        required: false
    },
    handleByUser: {
        type: Boolean,
        required: false
    },
    //Label whether this payment is actually delievered
    // THis field is used in the checkout page
    isSubmitted: {
        type: Boolean,
        required: true
    },
    creditCardNumber: {
        type: String,
        required: false
    },
    isFailure: {
        type: Boolean,
        required: true
    }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = { Transaction, TransactionSchema };
