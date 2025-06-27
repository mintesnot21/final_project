const mongoose = require("mongoose")

const LogSchema = new mongoose.Schema({
    type:{
       type: String,
        enum:["user-registered", "book-added","book-borrowed", "book-returned","book-overdue"],
        require:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"books"
    },
    message:{
        type:String
    }
},{timestamps:true})

const ActivityLogModel = mongoose.model("Activity-Log", LogSchema)
module.exports = { ActivityLogModel }