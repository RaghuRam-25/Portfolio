const multer = require('multer');
const path = require('path');
const fs = require('fs');

// আপলোড ডিরেক্টরি আছে কিনা তা নিশ্চিত করুন
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// স্টোরেজ কনফিগারেশন
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // ফাইলের নাম ইউনিক করার জন্য, যাতে একই নামের ফাইল কনফ্লিক্ট না করে
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ফাইল ফিল্টার (শুধুমাত্র ছবি আপলোড করার জন্য)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|svg|webp|ico|pdf|mp4|webm|mov|ogg/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf' || file.mimetype === 'image/x-icon';

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: Only image, video, icon, and PDF files are allowed!'));
};

// মাল্টার ইনস্ট্যান্স তৈরি এবং এক্সপোর্ট
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 100 }, // 5MB ফাইল সাইজ লিমিট
    fileFilter: fileFilter
});

module.exports = { upload };
