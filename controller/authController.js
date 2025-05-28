const { userModel } = require("../model/userModel");
const { hashPassword } = require("../utils/hashPassword");
const { generateJwtToken } = require("../utils/jwtToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();




const login = async(req, res)=>{
    console.log("login route called");
    
    const{email, password} = req.body
    try {
        const user = await userModel.findOne({email})

        if(!user){
            res.status(404).json({
                type:"email",
                message:"user not found"
            })
            return
        }
        const ispasswordCorrect = await bcrypt.compare(password, user.password)

        if(!ispasswordCorrect){
            res.status(400).json({
                type:"password",
                message:"Incorrect password."
            })
            return;
        }
        
        let token = generateJwtToken(user._id)
        console.log(token)
        if(ispasswordCorrect && user){
            const token = await generateJwtToken(user._id)
            res.cookie("jwt", token)
            res.status(200).json({
                firstname:user.firstname,
                lastname:user.lastname,
                email:user.email,
                token
            })
            
        }
        
    } catch (error) {
        res.status(500).json({
            error
        })
    }
}

const checkUser = async(req,res, next)=>{
    try {
        // console.log(req.cookies)
        const token = req.cookies.jwt
        if(!token){
            res.status(400).json({
                message:"you are not logged in! please login."
            })
            return
        }
        jwt.verify(token, process.env.JWT_SECRET, async(err, user)=>{
            if(err){
                res.status(400).json({
                    message:"Something went Wrong! try again later"
                })
                return
            }
            let found = await userModel.findOne({_id:user.id})
            req.user = found
            next()
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const checkrole = async(role)=>{
    return(req,res,next)=>{
        
    }
}


module.exports = {  login, checkUser }