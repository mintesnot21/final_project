const { bookModel } = require("../model/bookModel")
const { loanModel } = require("../model/loanModel")
const { reservationModel } = require("../model/reservationModel")
const getAllbooks = async(req,res)=>{
    try {
        const books = await bookModel.find()
        res.status(200).json({
            success:true,
            books
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const getBookById = async(req,res)=>{
    try {
        const book = await bookModel.findById(req.params.id)
        if(!book){
            res.status(404).json({
                message:"book not found."
            })
            return
        }
        res.status(200).json({
            success:true,
            book
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const uploadBook = async(req,res)=>{
    console.log("upload book route fired")
    const { 
            title,
            author,
            isbn,
            catagory,
            total_copies,
            available_copies,
            publisher,
            status,
            publicationYear,
            description
         } = req.body;
    const fileData = {
      ...req.file,
      title,
      author,
    //   isbn,
    //   catagory,
    //   total_copies,
    //   available_copies,
    //   publisher,
    //   status,
    //   publicationYear,
    //   description
    };
    console.log(req.file)


    // try {
    //     const newBook = new bookModel({
    //         title:title,
    //         author:fileData.author,
    //         file:fileData.originalname,
    //         coverImage:fileData.image
    //     })

    //     const book = await newBook.save();
    //     res.status(201).json({
    //         success:true,
    //         newBook
    //     })
    // } catch (error) {
    //     res.status(500).json({
    //         error:error.message
    //     })
    //     console.log(error.message)
    // }
}

const updateBook = async(req, res)=>{
    const bookId = req.params.id
    try {
        const book = await bookModel.findByIdAndUpdate({_id:bookId},req.body)

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const deleteBook = async(req,res)=>{
    const bookId = req.params.id
    try {
        
    } catch (error) {
        
    }
}

const loanBook = async(req,res)=>{
    const userId = req.user._id
    const bookId = req.params.id
    
    try { 
        const loans = await loanModel.find()
        const book = await bookModel.findById(bookId)
        
        if(!book){
            res.status(404).json({
                message:"book not found."
            })
            return
        }
        let prevReserve = loans.map(loan => {
             let loaned = loan.userId.includes(userId)
             return loaned
        });
        console.log(prevReserve);
        

        if(book.available_copies <= 0){
            if(!prevReserve[0]){
                let reservation = new reservationModel({
                    userId:userId,
                    bookId:book,
                    reservationDate:Date.now(),
                    status:"pending"
                })
                
                await reservation.save();
                res.status(200).json({
                    message:"there is no copy in our catalog, we will inform you when book is available."
                })
                return

            }
            res.status(403).json({
                message:"you already have previous reservation."
            })

        }
        if(book.available_copies > 0 && book.status == "available"  ){
           let loan = new loanModel({
                userId:userId,
                bookId:bookId,
                dueDate:"2025-05-22",
                returnDate:"2025-05-22"
            })

            const loaned = await loan.save();
            res.status(200).json({
                success:true,
                loaned
            })

            if(loaned){
                book.available_copies--
                await book.save()
            }
        }
        
    } catch (error) {
        res.status(500).json({
            error
        })
    }
}

const reserveBook = async(req,res)=>{}


module.exports = {
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook,
    deleteBook,
    loanBook,
    reserveBook
}