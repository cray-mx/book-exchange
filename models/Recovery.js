const mongoose = require("mongoose");

const RecoverySchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    code: {
        type: String,
        required: true
    }
});

const Recovery = mongoose.model("Recovery", RecoverySchema);

module.exports = { Recovery };
