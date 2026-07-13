const path = require('path');
const Certificate = require('../models/Certificate');
const { deleteFile } = require('../utils/fileUpload');

// H6 fix: Cloudinary URL হলে অপরিবর্তিত রাখা হয়; নয়তো আপেক্ষিক web path (uploads/<file>)
// সংরক্ষণ করা হয় — অ্যাবসোলিউট ফাইলসিস্টেম পাথ নয় (ভাঙা ইমেজ + path disclosure প্রতিরোধ)।
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

const resolveCertificateUrls = (doc, req) => {
    const obj = doc.toObject();
    obj.certificateImage = resolveUrl(obj.certificateImage, req);
    return obj;
};
// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.find({}).sort({ issueDate: -1, order: 1 });
        res.json({ success: true, data: certificates.map(c => resolveCertificateUrls(c, req)) });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new certificate
// @route   POST /api/certificates
// @access  Admin
const createCertificate = async (req, res, next) => {
    try {
        const { name, organization, issueDate, credentialLink, order, certificateImageUrl } = req.body;

        // Prioritize file upload over URL
        const finalCertificateImage = req.file ? toPublicUploadPath(req.file) : (certificateImageUrl || null);

        if (!finalCertificateImage) {
            return res.status(400).json({ success: false, message: 'Certificate image or URL is required.' });
        }
        const certificate = await Certificate.create({ name, organization, issueDate, credentialLink, certificateImage: finalCertificateImage, order });
        res.status(201).json({ success: true, message: 'Certificate created successfully', data: resolveCertificateUrls(certificate, req) });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing certificate
// @route   PUT /api/certificates/:id
// @access  Admin
const updateCertificate = async (req, res, next) => {
    try {
        const { name, organization, issueDate, credentialLink, order, certificateImageUrl } = req.body;
        let certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        const newImageFile = req.file;
        if (newImageFile) {
            // If a new file is uploaded, delete the old one if it's a local file
            if (certificate.certificateImage && !certificate.certificateImage.startsWith('http')) {
                await deleteFile(certificate.certificateImage);
            }
            certificate.certificateImage = toPublicUploadPath(newImageFile);
        } else if (certificateImageUrl !== undefined) {
            // If a URL is provided and it's different, delete the old local file
            if (certificate.certificateImage && certificate.certificateImage !== certificateImageUrl && !certificate.certificateImage.startsWith('http')) {
                await deleteFile(certificate.certificateImage);
            }
            certificate.certificateImage = certificateImageUrl;
        }

        certificate.name = name ?? certificate.name;
        certificate.organization = organization ?? certificate.organization;
        certificate.issueDate = issueDate ?? certificate.issueDate;
        certificate.credentialLink = credentialLink ?? certificate.credentialLink;
        certificate.order = order ?? certificate.order;

        const updatedCertificate = await certificate.save();
        res.json({ success: true, message: 'Certificate updated successfully', data: resolveCertificateUrls(updatedCertificate, req) });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Admin
const deleteCertificate = async (req, res, next) => {
    try {
        const certificate = await Certificate.findByIdAndDelete(req.params.id);
        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }
        if (certificate.certificateImage && !certificate.certificateImage.startsWith('http')) {
            await deleteFile(certificate.certificateImage);
        }
        res.json({ success: true, message: 'Certificate deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCertificates, createCertificate, updateCertificate, deleteCertificate };
