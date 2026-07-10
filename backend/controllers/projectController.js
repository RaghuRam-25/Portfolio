const Project = require('../models/Project');
const { deleteFile } = require('../utils/fileUpload'); // Assuming you have a fileUpload utility for deleting files

const toPublicUploadPath = (file) => file.path.replace(/\\/g, '/');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: projects });
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
        res.json({ success: true, data: project });
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

        const project = await Project.create({
            title,
            description,
            category,
            thumbnail,
            images: galleryImages,
            techStack: techStack ? JSON.parse(techStack) : [],
            githubUrl,
            liveUrl,
            isFeatured: isFeatured === true || isFeatured === 'true',
            isDelivered: isDelivered === true || isDelivered === 'true',
            order,
        });

        res.status(201).json({ success: true, message: 'Project created successfully', data: project });
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

        const retainedImages = existingImages ? JSON.parse(existingImages) : project.images;
        const removedImages = project.images.filter(image => !retainedImages.includes(image));
        await Promise.all(removedImages.map(image => deleteFile(image)));

        project.title = title || project.title;
        project.description = description || project.description;
        project.category = category || project.category;
        project.thumbnail = thumbnail || project.thumbnail;
        project.images = [...retainedImages, ...galleryImages];
        project.techStack = techStack ? JSON.parse(techStack) : project.techStack;
        project.githubUrl = githubUrl || project.githubUrl;
        project.liveUrl = liveUrl || project.liveUrl;
        project.isFeatured = isFeatured !== undefined ? isFeatured === true || isFeatured === 'true' : project.isFeatured;
        project.isDelivered = isDelivered !== undefined ? isDelivered === true || isDelivered === 'true' : project.isDelivered;
        project.order = order !== undefined ? order : project.order;

        const updatedProject = await project.save();
        res.json({ success: true, message: 'Project updated successfully', data: updatedProject });
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
