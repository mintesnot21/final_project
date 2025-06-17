// const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()~?"

// let str = ''

// for(let i = 0; i <= 15; i++){
//     const randIndex = Math.floor(Math.random() * char.length)
//     str += char[randIndex]
// }
// console.log(str)

let loanedDate = new Date();
let returnDate = new Date(loanedDate).setDate(r.getDate() + 8)
// returnDate.setDate(returnDate.getDate() + 8)

console.log("loaned date: ",loanedDate.toDateString())
console.log("return date: ",returnDate)