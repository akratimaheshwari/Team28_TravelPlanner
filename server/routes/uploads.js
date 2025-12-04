const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');


const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage });


router.post('/ticket/:tripId', verifyToken, upload.single('file'), uploadController.uploadTicket);


module.exports = router;