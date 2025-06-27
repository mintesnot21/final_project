const { checkUser } = require("../controller/authController")
const { 
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook, 
    deleteBook ,
    loanBook,
    reserveBook,
    returnBook,
    getHardCopyBooks,
    updateLoan
} = require("../controller/bookController")
const { upload } = require("../fileUploads")

const bookRouter = require("express").Router()

bookRouter.post("/book/loan/update/:id", updateLoan)
bookRouter.post("/book/order/:id",checkUser, loanBook)
bookRouter.get('/books/hardCopy',checkUser, getHardCopyBooks)
bookRouter.get("/books",checkUser, getAllbooks)
bookRouter.get("/book/:id",checkUser, getBookById)

bookRouter.post("/book",checkUser, upload.fields([
    { name: 'book', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]), uploadBook)

bookRouter.patch("/book/:id",checkUser,
    upload.fields([
        { name: 'book', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ])
    ,updateBook)
bookRouter.delete("/book/delete/:id",checkUser, deleteBook)
bookRouter.post("/book/return",checkUser, returnBook)
module.exports = { bookRouter }