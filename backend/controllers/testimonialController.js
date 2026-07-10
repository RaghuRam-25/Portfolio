const Testimonial = require('../models/Testimonial');
const { deleteFile } = require('../utils/fileUpload');

const toPublicUploadPath = (file) => file.path.replace(/\\/g, '/');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({}).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Admin
const createTestimonial = async (req, res) => {
    try {
        const { clientName, company, review, rating, order } = req.body;
        const clientImage = req.file ? toPublicUploadPath(req.file) : null;

        const testimonial = await Testimonial.create({ clientName, company, review, rating, clientImage, order });
        res.status(201).json({ success: true, message: 'Testimonial created successfully', data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing testimonial
// @route   PUT /api/testimonials/:id
// @access  Admin
const updateTestimonial = async (req, res) => {
    try {
        const { clientName, company, review, rating, order } = req.body;
        let testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        if (req.file && testimonial.clientImage) {
            await deleteFile(testimonial.clientImage);
        }

        testimonial.clientName = clientName ?? testimonial.clientName;
        testimonial.company = company ?? testimonial.company;
        testimonial.review = review ?? testimonial.review;
        testimonial.rating = rating ?? testimonial.rating;
        testimonial.order = order ?? testimonial.order;
        testimonial.clientImage = req.file ? toPublicUploadPath(req.file) : testimonial.clientImage;

        const updatedTestimonial = await testimonial.save();
        res.json({ success: true, message: 'Testimonial updated successfully', data: updatedTestimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        if (testimonial.clientImage) {
            await deleteFile(testimonial.clientImage);
        }
        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
