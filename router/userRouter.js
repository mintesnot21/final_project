const userRouter = require("express").Router();
const { 
    createUser, 
    updateUser, 
    deleteUser, 
    getAllUser, 
    getUserById, 
    notifyUser 
} = require("../controller/userController")


userRouter.get("/users",getAllUser)
userRouter.get("/user/:id", getUserById)
userRouter.post("/createUser", createUser)
userRouter.patch("/updateUser/:id",updateUser)
userRouter.delete("/deleteUser/:id", deleteUser)
userRouter.post("/notify-user", notifyUser)

module.exports = { userRouter }