const { userModel } = require("../model/userModel")
const { CustomError } = require("../utils/customErrorHandler")
const { hashPassword } = require("../utils/hashPassword")

const createUser = async(req,res, next)=>{
    const { firstname,lastname,email,password,phoneNumber } = req.body
    try {
        const hashedPassword = await hashPassword(password)
        const User = new userModel({
            firstname,
            lastname,
            email,
            password:hashedPassword,
            phoneNumber
        })

        let user = await User.save();

        if(!user){
            res.status(400).json({
                message:"unable to create user."
            })
            return
        }

        res.status(201).json({
            success:true,
            user
        })

    } catch (error) {
      let Error = new CustomError(error.message,error.status)
      next(Error)
    }
}
const getAllUser = async(req, res)=>{
    try {
        const allUser = await userModel.find();
        res.status(200).json({
            success:true,
            allUser
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const getUserById = async(req, res)=>{
    try {
        const user = await userModel.findById(req.params.id)
        if(!user){
            res.status(404).json({
                message:"User not found."
            })
            return;
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(200).json({
            error:error.message
        })
    }
}

const updateUser = async(req,res)=>{
    try {
        const user = await userModel.findById(req.params.id);
        if(!user){
            res.status(404).json({
                message:"user not found"
            })
            return
        }
        const updatedUser = await user.updateOne(req.body)
        res.status(200).json({
            success:true,
            updateUser
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const deleteUser = async(req,res,next)=>{
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if(!user){
            res.status(404).json({
                message:"user not found."
            })
            return
        }
        res.status(401).json({
            success:true,
            user
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}


module.exports = { getAllUser, getUserById, createUser, updateUser, deleteUser }