const { default: mongoose, mongo }= require("mongoose")
const validator = require("validator")
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        require:[true, "user name is required."]
    },
    lastname:{
        type:String,
        require:[true, "user name is required."]
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
    profile_picture:{

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
    membership_date:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})


const userModel = mongoose.model("user",userSchema)

module.exports = { userModel }