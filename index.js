const express = require("express")
const cookieParser = require("cookie-parser");
const cors = require("cors")
const logger = require("morgan")

const{ connect } = require("./db_connection/db");
const { router } = require("./router/authRouter")
const { bookRouter } = require("./router/bookRouter");
const { userRouter } = require("./router/userRouter");
const { testModel } = require("./model/testModel");
const errorController = require("./controller/errorController");
const { upload } = require("./fileUploads");
const { calculateFine } = require("./utils/calculateFee");



require("dotenv").config()
const port = process.env.PORT || 5000


const app = express();
connect("mongodb://localhost:27017/library")


app.use(cors({
    methods:["GET", "POST", "PATCH", "DELETE", "PUT"],
    origin: 'http://localhost:5173', // frontend origin
    credentials: true,               // Allow cookies / auth
}))

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static("./uploads"))
app.use(cookieParser())
app.use(logger("common"))



app.use("/api/auth",router)
app.use("/api", bookRouter)
app.use("/api", userRouter)


// app.use(errorController)
app.get("/setCookie", (req,res)=>{
    res.cookie("jwt", '')
    res.send("setted")
})

app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})

// const Statistics = async(req,res)=>{
//     const today = new Date();
//     const ThreeDaysAgo = new Date().setDate(today.getDate() - 3)
//     try {
//        const [bookAdded, userAdded,totalBook, totalUser, pendingOrder , availableBooks,activeUser] =  Promise.all([
//             bookModel.countDocuments({createdAt:{$gte:ThreeDaysAgo, $lte:today}}),
//             userModel.countDocuments({createdAt:{$gte:ThreeDaysAgo, $lte:today}}),
//             bookModel.countDocuments(),
//             userModel.countDocuments(),
//             loanModel.countDocuments({status:'pending'}),
//             bookModel.countDocuments({status:'available'}),
//             loanModel.countDocuments({dueDate:{$lt:new Date()}}),
//             userModel.countDocuments({status:'active'})
//         ])

//         res.status(200).json({
//             bookAddedLast3Days:bookAdded,
//             userAddedLast3Days:userAdded,
//             totalBook,
//             totalUser,
//             pendingOrder,
//             availableBooks,
//             activeUser
//         })

//     } catch (error) {
//         res.status(500).json(
//            { error:error.message}
//         )
//     }
// }