const userRouter = require("express").Router();
const { checkUser, checkRole } = require("../controller/authController");
const { 
    createUser, 
    updateUser, 
    deleteUser, 
    getAllUser, 
    getUserById, 
    Statistics,
    forgotPassword,
    resetPassword,
} = require("../controller/userController")


userRouter.get("/users",getAllUser)
userRouter.get("/user/:id", getUserById)
userRouter.post("/createUser", createUser)
userRouter.patch("/updateUser/:id",checkUser,checkRole('admin'), updateUser)
userRouter.delete("/deleteUser/:id",checkUser,checkRole('admin'),deleteUser)
userRouter.get("/dashboard", Statistics)
userRouter.post("/forgot-password", forgotPassword)
userRouter.patch('/reset-password/:token', resetPassword)

module.exports = { userRouter }