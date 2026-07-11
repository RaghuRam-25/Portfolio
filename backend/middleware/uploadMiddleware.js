const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const cloudinary = require('cloudinary').v2;

// আপলোড ডিরেক্টরি আছে কিনা তা নিশ্চিত করুন
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// স্টোরেজ কনফিগারেশন
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
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

// মাল্টার ইনস্ট্যান্স তৈরি
const multerInstance = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 100 }, // 100MB ফাইল সাইজ লিমিট
    fileFilter: fileFilter
});

// Cloudinary Configuration
let isCloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    isCloudinaryConfigured = true;
    console.log('Cloudinary successfully configured for uploads.');
} else {
    console.log('Cloudinary credentials missing. Falling back to local storage.');
}

const uploadToCloudinary = async (file) => {
    if (!isCloudinaryConfigured) return;
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'portfolio',
            resource_type: 'auto'
        });
        // Delete local temporary file
        try {
            await fsPromises.unlink(file.path);
        } catch (err) {
            console.warn('Failed to delete temp file after Cloudinary upload:', err.message);
        }
        // Replace file path with Cloudinary URL
        file.path = result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
    }
};

const handleCloudinaryUpload = async (req, res, next) => {
    if (!isCloudinaryConfigured) {
        return next();
    }
    try {
        if (req.file) {
            await uploadToCloudinary(req.file);
        }
        if (req.files) {
            if (Array.isArray(req.files)) {
                for (const file of req.files) {
                    await uploadToCloudinary(file);
                }
            } else {
                for (const key of Object.keys(req.files)) {
                    for (const file of req.files[key]) {
                        await uploadToCloudinary(file);
                    }
                }
            }
        }
        next();
    } catch (err) {
        next(err);
    }
};

// Wrap multer methods to execute multer followed by Cloudinary upload transparently
const upload = {
    single: (fieldName) => [multerInstance.single(fieldName), handleCloudinaryUpload],
    array: (fieldName, maxCount) => [multerInstance.array(fieldName, maxCount), handleCloudinaryUpload],
    fields: (fieldsArray) => [multerInstance.fields(fieldsArray), handleCloudinaryUpload],
};

module.exports = { upload };
