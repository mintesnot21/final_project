const mongoose = require("mongoose")
const bookSchema = new mongoose.Schema({

    title:{
        type:String,
        required:[true, "book title is required."]
    },
    author:{
        type:String,
        required:[true, "Author is required"]
    },
    file:{
        type:String,
    },
    coverImage:{
        type:String
    },
    isbn:{
        type:String
    },
    catagory:{
        type:String
    },
    total_copies:{
        type:Number,
        default:1
    },
    available_copies:{
        type:Number,
    },
    publisher:{
        type:String
    },
    status:{
        type:String,
        enum:["available","issued","damaged","lost"],
        default:"available"
    },
    publicationYear:{
        type:Date
    },
    description:{
        type:String
    },

},{timestamps:true})

const bookModel = mongoose.model("books",bookSchema)
module.exports = { bookModel }