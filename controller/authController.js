const { userModel } = require("../model/userModel");
const { hashPassword } = require("../utils/hashPassword");
const { generateJwtToken } = require("../utils/jwtToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();




const login = async(req, res)=>{
    
    const{email, password} = req.body
    try {
        const user = await userModel.findOne({email})
        
        if(!user){
            res.status(404).json({
                type:"email",
                message:"user not found"
            })
            console.log("user not found")
            return
        }
        let token = generateJwtToken(user._id)
        const ispasswordCorrect = await bcrypt.compare(password, user.password)
        if(!ispasswordCorrect){
            res.status(400).json({
                success:false,
                type:'password',
                message:'Incorrect password'
            })
            return;
        }
        
        if(ispasswordCorrect && user){
            const token = await generateJwtToken(user._id)
            res.cookie("jwt", token)
            res.status(200).json({
                success:true,
                token,
                user,
            })
            
        }
        
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const checkUser = async(req,res, next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]
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
                console.log("error verifying user")
                return
            }
            console.log(user)
            let found = await userModel.findOne({_id:user.id})
            req.user = found
            next()
            console.log("something")
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const checkRole = (role)=>{
    return(req,res,next)=>{
        if(req.user.role !== role){
            req.status(403).json({
                message:"you are unauthorized to perform this action."
            })
            return
        }
        next()
    }
}


module.exports = {  login, checkUser, checkRole }