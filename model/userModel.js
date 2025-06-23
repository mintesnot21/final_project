const { default: mongoose, mongo }= require("mongoose")
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
    fine:{
        type:Number,
        default:0
    }
},{timestamps:true})


const userModel = mongoose.model("user",userSchema)

module.exports = { userModel }