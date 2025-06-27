const { bookModel } = require("../model/bookModel")
const { loanModel } = require("../model/loanModel")
const { reservationModel } = require("../model/reservationModel")
const fs = require("fs")
const { calculateFine } = require("../utils/calculateFee")
const { userModel } = require("../model/userModel")
const { ActivityLogModel } = require("../model/ActivityLogSchema")


const getHardCopyBooks = async(req, res)=>{
    try {
        const query = req.query
        const hardCopyBooks = await bookModel.aggregate([
            {$match:{isHardCopy:true}},
            {$group :{
                _id:"$category",
                books:{$push: "$$ROOT"}
            }},
            {$project:{
                _id:0,
                category:"$_id",
                books:1
            }}
        ])

        if(!hardCopyBooks){
            res.status(404).json({
                message:"there is no hard copy books."
            })
            return;
        }
        res.status(200).json({
            success:true,
            book:hardCopyBooks
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        console.log(error)
    }
}
const getAllbooks = async(req,res)=>{
    console.log("get all book route fired")

    try {
        const books = await bookModel.find({isHardCopy:false})
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
    const book = req.files['book']?.[0].originalname || '';
    const coverImage = req.files['coverImage']?.[0].originalname || '';
    try {
        let isHardCopy;
        if(req.body.type ==='hardcopy'){
            isHardCopy = true
        }
        const uploadedBook = new bookModel({
            ...req.body,
            book:book,
            coverImage:coverImage,
            isHardCopy,
            available_copies:req.body.total_copies
            })

         const saved = await uploadedBook.save();
         await ActivityLogModel.create({
            type:'book-added',
            bookId:saved._id,
            message: `Book ${ saved.title } was added.`
         })
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
        console.log("type: ",req.body.type)
        let isHardCopy;
        if(req.body.type ==='hardcopy'){
            isHardCopy = true
        }

        const bookfile = req.files['book']?.[0].originalname || '';
        const coverImage = req.files['coverImage']?.[0].originalname || '';
        const updatedBook = await bookModel.findByIdAndUpdate(req.params.id,
                                                        {
                                                        ...req.body,
                                                        book:bookfile,
                                                        coverImage:coverImage,
                                                        category:req.body.category,
                                                        isHardCopy:isHardCopy
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
        const loans = await loanModel.find({userId, returned:false})
        const book = await bookModel.findById(bookId)
        const reservations = await reservationModel.find();
        


        if(!book){
            res.status(404).json({
                message:"book not found."
            })
            return
        }
        if(book.available_copies <= 0){
            book.status = 'checkedout'
            await book.save();
        }

        let prevLoan = loans.findIndex(loan => loan.userId.includes(userId));
        let prevReservation = reservations.findIndex(res => res.userId.includes(userId));
        console.log(prevLoan)
        
        if(prevLoan == -1){
            if(book.available_copies > 0 && book.status == "available"){
               let loan = new loanModel({
                    bookId:bookId,
                    issueDate:new Date(),
                    dueDate:new Date(new Date().setDate(new Date().getDate() + 8))
                })
                loan.userId.push(userId)
                const loaned = await loan.save();

                new ActivityLogModel.create({
                    type:'book-borrowed',
                    bookId:bookId,
                    userId:userId,
                    message:`User borrowed ${book.title}`
                })

                res.status(200).json({
                    success:true,
                    message:"loan succeed. we will sent you four digit secret in you mobile.",
                    loaned
                })
                if(loaned){
                    book.available_copies--
                    await book.save()
                }
            }else{
                res.status(404).json({
                    message:"book is not availabe in our catalog. we will inform you when book is available."
                })
            }
        }
        else{
            res.status(400).json({
                message:"you must return loaned book in order to loan new one."
            })
        }
        if(prevReservation == -1){
          
            if(prevLoan == -1 ){
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

        }else{
            res.status(400).json({
                message:"you already have previous reservation."
            })
        }
        if(prevLoan == 0){
            res.status(400).json({
                message:"you must return loaned book in order to loan new one."
            })
        }


    } catch (error) {
        res.status(500).json({
            error
        })
        console.log(error)
    }
}

const updateLoan = async(req,res)=>{
    try {
        const updated = await loanModel.findByIdAndUpdate(req.params.id, req.body)
        if(!updated){
            res.status(400).json({
                message:"unable to update loan."
            })
            return
        }
        res.status(200).json({
            success:true,
            loan:updated
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

const returnBook = async(req,res)=>{
    try {
        const userId = req.user._id
        const{ bookId }= req.body
    let loans = await loanModel.findOne({userId, bookId, returned:false});

        if(!loans){
            console.log("there is no loan")
            res.status(400).json({
                message:"you are not loaned any book"
            })
        }
        else{
            const book = await bookModel.findOne({_id:bookId})
            if(book){
                console.log("total book: ",book.total_copies)
                console.log("available book: ",book.available_copies)

                //if available book less than total book
                    let returnAt = new Date(new Date().setDate(new Date().getDate() + 15));
                    console.log("default case")
                    
                    const upRtn = await loanModel.findOne({userId, bookId, returned:false})
                    let fee;
                    if(returnAt > upRtn.dueDate){
                        fee = calculateFine(upRtn.dueDate, returnAt)
                        const user = await loanModel.findOne({_id:userId})
                        user.fine = fee
                        await user.save();
                        
                    }
                    upRtn.status = 'returned'
                    upRtn.returned = true
                    upRtn.returnDate = returnAt
                    if(book.available_copies < book.total_copies){
                        book.available_copies++
                    }
                    await upRtn.save()
                    await book.save();
                        res.status(200).json({
                            message:"returned successfully.",
                            fee: fee > 0 ? fee : null
                        })

               
            }
        }

 } catch (error) {
    res.status(500).json({
        error:error.message
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
    returnBook,
    getHardCopyBooks,
    updateLoan
}