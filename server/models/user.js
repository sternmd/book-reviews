const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_I = 10;
const config = require('./../config/config').get(process.env.NODE_ENV);

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        maxlength: 100
    },
    lastname: {
        type: String,
        maxlength: 100
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    }
})

userSchema.pre('save', function(next) {
    let user = this;

    if (user.isModified('password')){
        bcrypt.genSalt(SALT_I, (err,salt) => {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, (err,hash) => {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err,isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    var token = jwt.sign(user._id.toHextString(), config.SECRET); // create token

    user.token = token;
    user.save(function(){
        if(err) return cb(err);
        cb(null, user);
    })
}

// find user by token
userSchema.statics.findByToken = function(token, cb) {
    const user = this;

    // verify if user is correct
    jwt.verify(token, config.SECRET, function(err,decode){
        user.findOne({"id": decode, "token": token}, function(err,user){
            if (err) return cb(err);
            cb(null, user) // return all user info
        })
    })
}

userSchema.methods.deleteToken = function(token,cb){
    var user = this;

    user.update({$unset: {token:1}}, (err,user) =>{
        if(err) return cb(err)
        cb(null,user)
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }