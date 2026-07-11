const Project = require('../models/Project');
const { deleteFile } = require('../utils/fileUpload'); // Assuming you have a fileUpload utility for deleting files
const path = require('path');

const toPublicUploadPath = (file) => {
    if (/^https?:\/\//i.test(file.path)) return file.path;
    return `uploads/${path.basename(file.path)}`;
};

/**
 * Converts relative or absolute file paths in a project object to absolute, web-accessible URLs.
 * @param {object} projectDoc - The Mongoose project document.
 * @param {object} req - The Express request object to determine the base URL.
 * @returns {object} A project object with absolute URLs for media.
 */
const resolveProjectMediaUrls = (projectDoc, req) => {
    const project = projectDoc.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const resolveUrl = (mediaPath) => {
        if (!mediaPath || mediaPath.startsWith('http')) {
            return mediaPath; // It's already an absolute URL or empty.
        }
        // Look for the 'uploads' folder marker to handle both absolute local paths and relative paths.
        const uploadMarker = 'uploads';
        const uploadIndex = mediaPath.replace(/\\/g, '/').lastIndexOf(uploadMarker);

        if (uploadIndex !== -1) {
            // Extract the path from 'uploads' onwards.
            const relativePath = mediaPath.substring(uploadIndex);
            return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
        }
        // Fallback for paths that don't contain 'uploads' but are relative.
        return `${baseUrl}/${mediaPath.replace(/\\/g, '/').replace(/^\//, '')}`;
    };

    project.thumbnail = resolveUrl(project.thumbnail);
    if (project.images && project.images.length > 0) {
        project.images = project.images.map(resolveUrl);
    }
    return project;
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
        const resolvedProjects = projects.map(p => resolveProjectMediaUrls(p, req));
        res.json({ success: true, data: resolvedProjects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, data: resolveProjectMediaUrls(project, req) });
    } catch (error) {
        console.error('Error fetching project by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
    try {
        const { title, description, category, techStack, githubUrl, liveUrl, isFeatured, isDelivered, order } = req.body;
        const thumbnail = req.files?.thumbnail?.[0] ? toPublicUploadPath(req.files.thumbnail[0]) : null;
        const galleryImages = (req.files?.images || []).map(toPublicUploadPath);

        let parsedTechStack = [];
        if (techStack) {
            try {
                parsedTechStack = JSON.parse(techStack);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid format for techStack. It should be a JSON array.' });
            }
        }

        const project = await Project.create({
            title,
            description,
            category,
            thumbnail,
            images: galleryImages,
            techStack: parsedTechStack,
            githubUrl,
            liveUrl,
            isFeatured: isFeatured === true || isFeatured === 'true',
            isDelivered: isDelivered === true || isDelivered === 'true',
            order,
        });

        res.status(201).json({ success: true, message: 'Project created successfully', data: resolveProjectMediaUrls(project, req) });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
    try {
        const { title, description, category, techStack, githubUrl, liveUrl, isFeatured, isDelivered, order, existingImages } = req.body;
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // If a new thumbnail is uploaded, delete the old one
        const thumbnail = req.files?.thumbnail?.[0] ? toPublicUploadPath(req.files.thumbnail[0]) : null;
        const galleryImages = (req.files?.images || []).map(toPublicUploadPath);

        if (thumbnail && project.thumbnail) {
            await deleteFile(project.thumbnail);
        }

        let retainedImages = project.images;
        if (existingImages) {
            try {
                retainedImages = JSON.parse(existingImages);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid format for existingImages. It should be a JSON array.' });
            }
        }

        const removedImages = project.images.filter(image => !retainedImages.includes(image));
        await Promise.all(removedImages.map(image => deleteFile(image)));

        let parsedTechStack = project.techStack;
        if (techStack) {
            try {
                parsedTechStack = JSON.parse(techStack);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid format for techStack. It should be a JSON array.' });
            }
        }

        // M8 fix: title/thumbnail required — শুধু নতুন মান থাকলে সেট করা হয়;
        // অপশনাল ফিল্ড (description, githubUrl, liveUrl) খালি স্ট্রিং দিয়ে ক্লিয়ার করা যায়।
        if (title) project.title = title;
        if (description !== undefined) project.description = description;
        if (category) project.category = category;
        if (thumbnail) project.thumbnail = thumbnail;
        project.images = [...retainedImages, ...galleryImages];
        project.techStack = parsedTechStack;
        if (githubUrl !== undefined) project.githubUrl = githubUrl;
        if (liveUrl !== undefined) project.liveUrl = liveUrl;
        project.isFeatured = isFeatured !== undefined ? isFeatured === true || isFeatured === 'true' : project.isFeatured;
        project.isDelivered = isDelivered !== undefined ? isDelivered === true || isDelivered === 'true' : project.isDelivered;
        project.order = order !== undefined ? order : project.order;

        const updatedProject = await project.save();
        res.json({ success: true, message: 'Project updated successfully', data: resolveProjectMediaUrls(updatedProject, req) });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.thumbnail) await deleteFile(project.thumbnail);
        if (project.images && project.images.length > 0) await Promise.all(project.images.map(img => deleteFile(img)));
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
};
