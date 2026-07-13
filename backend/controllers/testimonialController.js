const path = require('path');
const Testimonial = require('../models/Testimonial');
const { deleteFile } = require('../utils/fileUpload');

// H6 fix: Cloudinary URL হলে অপরিবর্তিত; নয়তো আপেক্ষিক uploads/<file> path
const toPublicUploadPath = (file) => {
    if (/^https?:\/\//i.test(file.path)) return file.path;
    return `uploads/${path.basename(file.path)}`;
};

const resolveUrl = (path, req) => {
    if (!path || path.startsWith('http')) return path;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const normalizedPath = path.replace(/\\/g, '/');
    return `${baseUrl}/${normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath}`;
};

const resolveTestimonialUrls = (doc, req) => {
    const obj = doc.toObject();
    obj.clientImage = resolveUrl(obj.clientImage, req);
    return obj;
};
// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({}).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: testimonials.map(t => resolveTestimonialUrls(t, req)) });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Admin
const createTestimonial = async (req, res, next) => {
    try {
        const { clientName, company, review, rating, order, clientImageUrl } = req.body;
        // Prioritize file upload over URL
        const finalClientImage = req.file ? toPublicUploadPath(req.file) : (clientImageUrl || null);

        const testimonial = await Testimonial.create({ clientName, company, review, rating, clientImage: finalClientImage, order });
        res.status(201).json({ success: true, message: 'Testimonial created successfully', data: resolveTestimonialUrls(testimonial, req) });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing testimonial
// @route   PUT /api/testimonials/:id
// @access  Admin
const updateTestimonial = async (req, res, next) => {
    try {
        const { clientName, company, review, rating, order, clientImageUrl } = req.body;
        let testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        const newImageFile = req.file;
        if (newImageFile) {
            // If a new file is uploaded, delete the old one if it's a local file
            if (testimonial.clientImage && !testimonial.clientImage.startsWith('http')) {
                await deleteFile(testimonial.clientImage);
            }
            testimonial.clientImage = toPublicUploadPath(newImageFile);
        } else if (clientImageUrl !== undefined) {
            // If a URL is provided and it's different, delete the old local file
            if (testimonial.clientImage && testimonial.clientImage !== clientImageUrl && !testimonial.clientImage.startsWith('http')) {
                await deleteFile(testimonial.clientImage);
            }
            testimonial.clientImage = clientImageUrl;
        }

        testimonial.clientName = clientName ?? testimonial.clientName;
        testimonial.company = company ?? testimonial.company;
        testimonial.review = review ?? testimonial.review;
        testimonial.rating = rating ?? testimonial.rating;
        testimonial.order = order ?? testimonial.order;

        const updatedTestimonial = await testimonial.save();
        res.json({ success: true, message: 'Testimonial updated successfully', data: resolveTestimonialUrls(updatedTestimonial, req) });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
const deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        if (testimonial.clientImage && !testimonial.clientImage.startsWith('http')) {
            await deleteFile(testimonial.clientImage);
        }
        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
