const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Upload two separate files (NOT as an array)
app.post(
  '/upload',
  upload.fields([
    { name: 'book', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  (req, res) => {
 
    console.log(req.files); // { profilePic: [...], resume: [...] }
     const book = req.files['book']?.[0];
     const coverImage = req.files['coverImage']?.[0];
    // if (!profilePic || !resume) {
    //   return res.status(400).json({ error: 'Both files are required' });
    // }
    console.log("book",book)
    console.log("coverImage", coverImage)
  }
);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
