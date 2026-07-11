const fs = require('fs/promises');
const path = require('path');

let cloudinary = null;
try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
} catch {
    // cloudinary not available
}

const deleteFile = async (filePath) => {
    if (!filePath) return;

    // If it's a Cloudinary URL, delete from Cloudinary
    if (/^https?:\/\//i.test(filePath) && filePath.includes('cloudinary.com')) {
        try {
            if (cloudinary) {
                // Extract public_id from URL: folder/filename (without extension)
                const matches = filePath.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
                if (matches && matches[1]) {
                    await cloudinary.uploader.destroy(matches[1]);
                }
            }
        } catch (error) {
            console.warn('Failed to delete Cloudinary file:', error.message);
        }
        return;
    }

    // Local file deletion
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const absolutePath = path.resolve(__dirname, '..', normalizedPath);
    const uploadsRoot = path.resolve(__dirname, '..', 'uploads');

    if (!absolutePath.startsWith(uploadsRoot)) return;

    try {
        await fs.unlink(absolutePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn(`Failed to delete uploaded file: ${normalizedPath}`, error.message);
        }
    }
};

module.exports = { deleteFile };
