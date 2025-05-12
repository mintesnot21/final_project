const { default: mongoose, mongo }= require("mongoose")
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
        require:[true, "email is required."]
    },
    password:{
        type:String,
        require:[true, "password is required."]
    },
    phoneNumber:{
        type:String,
        require:true
    },
    membership_date:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})


const userModel = mongoose.model("user",userSchema)

module.exports = { userModel }