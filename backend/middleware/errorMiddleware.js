const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // সার্ভার লগে এরর দেখাবে
    res.status(err.statusCode || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
    });
};
module.exports = errorHandler;