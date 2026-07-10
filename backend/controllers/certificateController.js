const Certificate = require('../models/Certificate');
const { deleteFile } = require('../utils/fileUpload');

const toPublicUploadPath = (file) => file.path.replace(/\\/g, '/');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({}).sort({ issueDate: -1, order: 1 });
        res.json({ success: true, data: certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new certificate
// @route   POST /api/certificates
// @access  Admin
const createCertificate = async (req, res) => {
    try {
        const { name, organization, issueDate, credentialLink, order } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Certificate image is required.' });
        }
        const certificateImage = toPublicUploadPath(req.file);

        const certificate = await Certificate.create({ name, organization, issueDate, credentialLink, certificateImage, order });
        res.status(201).json({ success: true, message: 'Certificate created successfully', data: certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing certificate
// @route   PUT /api/certificates/:id
// @access  Admin
const updateCertificate = async (req, res) => {
    try {
        const { name, organization, issueDate, credentialLink, order } = req.body;
        let certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        if (req.file && certificate.certificateImage) {
            await deleteFile(certificate.certificateImage);
        }

        certificate.name = name ?? certificate.name;
        certificate.organization = organization ?? certificate.organization;
        certificate.issueDate = issueDate ?? certificate.issueDate;
        certificate.credentialLink = credentialLink ?? certificate.credentialLink;
        certificate.order = order ?? certificate.order;
        certificate.certificateImage = req.file ? toPublicUploadPath(req.file) : certificate.certificateImage;

        const updatedCertificate = await certificate.save();
        res.json({ success: true, message: 'Certificate updated successfully', data: updatedCertificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Admin
const deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndDelete(req.params.id);
        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }
        if (certificate.certificateImage) {
            await deleteFile(certificate.certificateImage);
        }
        res.json({ success: true, message: 'Certificate deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getCertificates, createCertificate, updateCertificate, deleteCertificate };
