const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const PostSchema = require("./Post").PostSchema;
const TransactionSchema = require("./Transaction").TransactionSchema;

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    avatar: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        minlength: 4,
        required: true
    },
    sell: [PostSchema],
    purchase: [PostSchema],
    transaction: [TransactionSchema],
    shortlist: [PostSchema]
});

UserSchema.statics.findByEmailPassword = function(username, password) {
    const User = this;
    return User.findOne({username: username}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (error, result) => {
                if (result) {
                    resolve(user);
                } else {
                    console.log("sdajkksa");
                    reject();
                }
            })
        })
    });
};

UserSchema.pre("save", function(next) {
    const user = this;

    if (user.isModified("password")) {
        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(user.password, salt, (error, hash) =>{
                user.password = hash;
                next();
            })
        });
    } else {
        next();
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = { User, UserSchema };
