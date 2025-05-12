const express = require("express")
const{ connect } = require("./db_connection/db");
const { userModel } = require("./model/userModel");

require("dotenv").config()
const port = process.env.PORT || 5000

const app = express();
connect("mongodb://localhost:27017/library")

app.post("/signup",async(req,res) =>{
    try {
        let User = await userModel.create({
            firstname:"abebe",
            lastname:"kebede",
            email:"abebe@gmail.com",
            password:"123456",
            phoneNumber:"+251983254295"
        })

        if(!newUser){
            res.status(400).json({
                message:"unable to create user."
            })
            return
        }
        res.status(201).json({
            success:true,
            User
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
})





app.listen(port, (arg)=>{
    console.log(`server running on port ${port}`)
})