const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Upload with metadata
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const fileData = {
      ...req.file,
      name,
      description,
    };
    console.log(fileData)
    // const newFile = new File(fileData);
    // await newFile.save();

    // res.json({ message: 'File uploaded with metadata', file: newFile });
    res.status(200).json({
      fileData
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
