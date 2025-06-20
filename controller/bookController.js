const { bookModel } = require("../model/bookModel")
const { loanModel } = require("../model/loanModel")
const { reservationModel } = require("../model/reservationModel")
const fs = require("fs")



const getAllbooks = async(req,res)=>{
    console.log("get all book route fired")

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
    const book = req.files['book']?.[0].originalname || '';
    const coverImage = req.files['coverImage']?.[0].originalname || '';
    try {
        const uploadedBook = new bookModel({
            ...req.body,
            book:book,
            coverImage:coverImage
            })

            const saved = await uploadedBook.save();
            console.log("uploaded book: ",saved)
        res.status(200).json({
            book:saved
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        console.log(error.message)
    }
  
}

const updateBook = async(req, res)=>{
    
    try {
        const bookfile = req.files['book']?.[0].originalname || '';
        const coverImage = req.files['coverImage']?.[0].originalname || '';
        const updatedBook = await bookModel.findByIdAndUpdate(req.params.id,
                                                        {
                                                        ...req.body,
                                                        book:bookfile,
                                                        coverImage:coverImage
                                                        })
            res.status(200).json({message:"book updated successfully." })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        console.log(error)
    }
}

const deleteBook = async(req,res)=>{
    const bookId = req.params.id
    console.log("delete book route fired")
    try {
        if(!bookId){
            res.status(404).json({
                error:"book not found."
            })
            return
        }
        await bookModel.findByIdAndDelete(bookId)
        res.status(204).json({
            message:"successfully deleted the book"
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const loanBook = async(req,res)=>{
    console.log("loan book route fires")
    const userId = req.user._id
    const bookId = req.params.id

    
    try { 
        const loans = await loanModel.find()
        const book = await bookModel.findById(bookId)
        const reservations = await reservationModel.find();
        


        if(!book){
            res.status(404).json({
                message:"book not found."
            })
            return
        }

        let prevLoan = loans.map(loan => {
             let loaned = loan.userId?.includes(userId)
             return loaned
        });

        let prevReservation = reservations?.forEach(user =>{
            let reserved = user.userId.incldes(userId)
            return reserved
        })

        if(!prevReservation){
            if(book.available_copies <= 0){
                res.status(403).json({
                    message:"there is no copy in our catalog, we will inform you when book is available."
                })
                return;
            }

            if(!prevLoan[0] ){
                let reservation = new reservationModel({
                    userId:userId,
                    bookId:book,
                    reservationDate:Date.now(),
                    status:"pending"
                })
                
                await reservation.save();
                res.status(200).json({
                })
                return

            }
            res.status(403).json({
                message:"you must return loaned book in order to loan new one."
            })

        }
        if(prevLoan[0]){
            res.status(400).json({
                message:"you must return loaned book in order to loan new one."
            })
        }

        if(!prevLoan[prevLoan.length - 1]){
            if(book.available_copies > 0 && book.status == "available"){
               let loan = new loanModel({
                    userId:userId,
                    bookId:bookId,
                    dueDate:new Date(),
                    returnDate:new Date(new Date().setDate(new Date().getDate() + 8))
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
            }else{
                res.status(400).json({
                    message:"book is not availabe in our catalog."
                })
            }
        }
        else{
            res.status(400).json({
                message:"you must return loaned book in order to loan new one."
            })
        }

    } catch (error) {
        res.status(500).json({
            error
        })
    }
}

const returnBook = async(req,res)=>{
    const{ userId, bookId }= req.body
 try {
    let loans = await loanModel.find();

    let hasLoan = loans.findIndex(loan => loan.userId.includes(userId));

   console.log(hasLoan)
   if(hasLoan !== -1 ){
    const loanerId = loans.map(loan =>{
        return loan.userId.filter(id => id == userId)
    })
    const book = await bookModel.findById(bookId)
    console.log(loanerId)
    // let filtered = loanerId.filter(lId  => lId != userId )

    // const userInLoan = await loanModel.findOneAndUpdate({userId:userId}, {userId:filtered})
    // if(book.available_copies <= book.total_copies){
    //     book.available_copies++;
    // }
    // await book.save()
    
    // res.status(200).json({
    //     message:"returned successfully."
    // })
    return;
   }
 } catch (error) {
    res.status(500).json({
        error:error.message
    })
 }
 console.log("userId", userId, "bookId", bookId)
}


const reserveBook = async(req,res)=>{}



module.exports = {
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook,
    deleteBook,
    loanBook,
    returnBook
}