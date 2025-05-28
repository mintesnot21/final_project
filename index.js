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



require("dotenv").config()
const port = process.env.PORT || 5000


const app = express();
connect("mongodb://localhost:27017/library")


app.use(cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true,               // Allow cookies / auth
}))

app.use(express.static("./uploads"))
app.use(express.json())
app.use(cookieParser())
app.use(logger("common"))



app.use("/api/auth",router)
app.use("/api", bookRouter)
app.use("/api", userRouter)

// app.use(errorController)


app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})