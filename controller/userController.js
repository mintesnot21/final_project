const { ActivityLogModel } = require("../model/ActivityLogSchema")
const { bookModel } = require("../model/bookModel")
const { loanModel } = require("../model/loanModel")
const { userModel } = require("../model/userModel")
const { CustomError } = require("../utils/customErrorHandler")
const { hashPassword } = require("../utils/hashPassword")
const crypto = require('crypto');

const createUser = async(req,res, next)=>{
        const{email,password} = req.body
        console.log(req.body)
    let numbers = "1234567890"
    let str = ''
    
    for(let i = 0; i <= 3; i++){
        const randIndex = Math.floor(Math.random() * numbers.length)
        str += numbers[randIndex]
    }
    let ID = "HCPL-"+str
    try {
        const user = await userModel.findOne({email})
        if(user){
            res.status(400).json({
                error:"user with this email already exist."
            })
            return
        }
        const hashedPassword = await hashPassword(password)
        
        const User = await userModel.create({id:ID,...req.body, password:hashedPassword})

        let savedUser = await User.save();
        if(!savedUser){
            res.status(400).json({
                message:"unable to create user."
            })
            return
        }
        await ActivityLogModel.create({
            type:'user-registered',
            userId:savedUser._id,
            message:`${savedUser.firstname} ${ savedUser.lastname } registered`
        })

        res.status(201).json({
            success:true,
            savedUser
        })

    } catch (error) {
        console.log(error)
      let Error = new CustomError(error.message,error.status)
      next(Error)
    }
}
const getAllUser = async(req, res)=>{
    try {
        console.log("get all user request received")
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
    console.log("update user route fires")
    console.log(req.params.id)
    try {
        const user = await userModel.findById(req.params.id)

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
        console.log(error)
    }
}

const deleteUser = async(req,res)=>{
    console.log("delete user route called")
    try {
        const user = await userModel.findOne({ id: req.params.id });
        if(!user){
            res.status(404).json({
                message:"user not found."
            })
            return
        }
        await userModel.deleteOne({ id:user.id })
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


const Statistics = async(req,res)=>{
    const today = new Date();
    const ThreeDaysAgo = new Date().setDate(today.getDate() - 3)
    try {
       const [bookAdded, userAdded,totalBook, totalUser, pendingOrder , availableBooks,activeUser] =  Promise.all([
            bookModel.countDocuments({createdAt:{$gte:ThreeDaysAgo, $lte:today}}),
            userModel.countDocuments({createdAt:{$gte:ThreeDaysAgo, $lte:today}}),
            bookModel.countDocuments(),
            userModel.countDocuments(),
            loanModel.countDocuments({status:'pending'}),
            bookModel.countDocuments({status:'available'}),
            loanModel.countDocuments({dueDate:{$lt:new Date()}}),
            userModel.countDocuments({status:'active'})
        ])

        res.status(200).json({
            bookAddedLast3Days:bookAdded,
            userAddedLast3Days:userAdded,
            totalBook,
            totalUser,
            pendingOrder,
            availableBooks,
            activeUser
        })

    } catch (error) {
        res.status(500).json(
           { error:error.message}
        )
    }
}

const forgotPassword = async(req,res)=>{
    try {
        console.log("forgot password route fired")
        const { email } = req.body
        const user = await userModel.findOne({email})
        if(!email){
            res.status(400).json({
                message:"We could not find user with provided email."
            })
            return
        }

        const ResetToken = user.getUserInfo();
        await user.save({validateBeforeSave:false})

        const link = `http://localhost:5173/reset-password/${ResetToken}`

        // reset link email sent here
        res.status(200).json({
            link
        })

    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword = async(req,res)=>{
    try {

        const ResetToken = crypto.createHash("sha256").update(req.params.token).digest('hex')
        const resetUser =  await userModel.findOne({passwordResetToken:ResetToken, passwordResetTokenExpires:{$gt:Date.now()}})
        console.log("reset token: ",ResetToken)
        if(!resetUser){
            res.status(400).json({
                message:'token is invalid or has expired.'
            })
            return
        }
        resetUser.password = req.body.password
        resetUser.passwordResetToken = undefined
        resetUser.passwordResetTokenExpires = undefined

        await resetUser.save()
        res.status(200).json({
            message:"password updated successfully."
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:error.message
        })
    }
}


module.exports = { 
    getAllUser, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    Statistics,
    forgotPassword,
    resetPassword
}