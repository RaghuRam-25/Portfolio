const fs = require('fs/promises');
const path = require('path');

const deleteFile = async (filePath) => {
    if (!filePath) return;

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
