const { default: mongoose, mongo }= require("mongoose")
const crypto = require("crypto")
const validator = require("validator")
const userSchema = new mongoose.Schema({
    id:{
        type:String
    },
    firstname:{
        type:String,
        require
    },
    lastname:{
        type:String,
        require
    },
    username:{
        type:String,
        require
    },
    email:{
        type:String,
        require:[true, "email is required."],
        validate:[validator.isEmail, "please insert proper email"],
        unique:true
    },
    password:{
        type:String,
        require:[true, "password is required."]
    },
    role:{
        type:String,
        enum:["admin", "librarian","member"],
        default:"member"
    },
    status:{
        type:String,
        enum:["active", "inactive", "pending"],
        default:"active"
    },
    phoneNumber:{
        type:String,
        require:true,
        validate:{
            validator:function(value){
                validator.isMobilePhone(value, "any", {strictMode:true})
            }
        }
    },
    membershipDate:{
        type:Date,
        default:Date.now
    },
    passwordResetToken:{
        type:String
    },
    passwordResetTokenExpires:{
        type:Date
    }
},{timestamps:true})

  userSchema.methods.getUserInfo = function() {
    
    let resetToken = crypto.randomBytes(32).toString("hex")
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex")
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 60 * 1000

    console.log("plain ", resetToken)
    console.log("encrypted: ",this.passwordResetToken)
    return resetToken

  };


const userModel = mongoose.model("user",userSchema)

module.exports = { userModel }