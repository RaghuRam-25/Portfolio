const fs = require('fs');
const path = require('path');

const deleteFile = async (filePath) => {
    if (!filePath) return;

    // ডাটাবেসে সেভ করা রিলেটিভ পাথ থেকে অ্যাবসোলিউট পাথ তৈরি করা
    const absolutePath = path.join(__dirname, '..', filePath);

    try {
        await fs.promises.unlink(absolutePath);
    } catch (error) {
        // যদি ফাইলটি আগে থেকেই না থাকে, তাহলে এরর দেখানোর প্রয়োজন নেই
        if (error.code !== 'ENOENT') {
            console.error(`Error deleting file ${absolutePath}:`, error);
        }
    }
};

module.exports = { deleteFile };