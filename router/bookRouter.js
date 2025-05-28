const { checkUser } = require("../controller/authController")
const { 
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook, 
    deleteBook ,
    loanBook,
    reserveBook
} = require("../controller/bookController")
const { upload } = require("../fileUploads")

const bookRouter = require("express").Router()


bookRouter.get("/book/reserve/:id", reserveBook)
bookRouter.get("/book/order/:id",checkUser, loanBook)
bookRouter.get("/books",getAllbooks)
bookRouter.get("/book/:id",getBookById)
bookRouter.post("/book",upload.single("file"), uploadBook)
bookRouter.patch("/book/:id",updateBook)
bookRouter.delete("/book/:id",deleteBook)


module.exports = { bookRouter }