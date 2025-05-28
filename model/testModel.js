const mongoose = require("mongoose")

const testSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true, "username is required"]
    },
    email:{
        type:String,
        required:[true,"email is required."],
        unique:true
    }
})

const testModel = mongoose.model("testModel", testSchema)
module.exports = { testModel }