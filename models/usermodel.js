const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: [true, 'This email already exixts'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default:'user'
    },
    password: {
        type: String,
        required: [true, 'Please a provide a password'],
        minlength: 8,
        select:false
    },
    passwordconfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            }, 
            message:'password is not same'
        }
        
    },
    passwordChangedAt: Date,
    PasswordResetToken: String,
    passwordResetExpries: Date,
active: {type:Boolean,default:true,select:false/*this feild controls the view of the current property in the database if this is false then it will not be shown in the database*/ }

    
});



userschema.pre('save', async function (next) {
    //password modify aana mattu tha inta function run aagum
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 14);
    this.passwordconfirm = undefined;
    next();
})
userschema.pre('save', function (next) {
    if (!this.isModified('password')||this.isNew) return next();
    this.passwordChangedAt = Date.now() + 10 *60 *1000;
    next();
})
//we use querymiddleware for making all the inactive users to be not shown in the output for the admin

userschema.pre(/^find/, function (next) {
    //this points to the current query
    this.find({ active: { $ne: false } })
    next();
    //this middleware will run on all query which starts with find,so we use regular expression 
 })
userschema.methods.correctPassword = async function (candidatepassword, userpassword) {
    return await bcrypt.compare(candidatepassword, userpassword);
}
//to check whether the user has changed the password or not
userschema.methods.changedpasswordafter = function (jwttimestamp) {
    if (this.passwordChangedAt) {
        const changedtimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10)
        return jwttimestamp<changedtimestamp
    }
    return false;
}

userschema.methods.createPasswordResetToken = function () {
    const reseToken = crypto.randomBytes(32).toString('hex');
    this.PasswordResetToken = crypto.createHash('sha256').update(reseToken).digest('hex');
    console.log({ reseToken },this.PasswordResetToken);
    this.passwordResetExpries = Date.now() + 10 * 60 * 1000;
    return reseToken;
    
}
const user = mongoose.model('user', userschema);
module.exports = user;