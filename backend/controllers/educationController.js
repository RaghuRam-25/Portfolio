const Education = require('../models/Education');

// @desc    Get all education history
// @route   GET /api/education
// @access  Public
const getEducation = async (req, res) => {
    try {
        const education = await Education.find({}).sort({ order: 1, startDate: -1 });
        res.json({ success: true, data: education });
    } catch (error) {
        console.error('Error fetching education:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new education entry
// @route   POST /api/education
// @access  Admin
const createEducation = async (req, res) => {
    try {
        const { institution, degree, fieldOfStudy, startDate, endDate, description, order } = req.body;
        const education = await Education.create({
            institution,
            degree,
            fieldOfStudy,
            startDate,
            endDate: endDate || null,
            description,
            order: order || 0
        });
        res.status(201).json({ success: true, message: 'Education entry created successfully', data: education });
    } catch (error) {
        console.error('Error creating education entry:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing education entry
// @route   PUT /api/education/:id
// @access  Admin
const updateEducation = async (req, res) => {
    try {
        const { institution, degree, fieldOfStudy, startDate, endDate, description, order } = req.body;
        let education = await Education.findById(req.params.id);

        if (!education) {
            return res.status(404).json({ success: false, message: 'Education entry not found' });
        }

        education.institution = institution ?? education.institution;
        education.degree = degree ?? education.degree;
        education.fieldOfStudy = fieldOfStudy ?? education.fieldOfStudy;
        education.startDate = startDate ?? education.startDate;
        education.endDate = endDate !== undefined ? (endDate || null) : education.endDate;
        education.description = description ?? education.description;
        education.order = order ?? education.order;

        const updatedEducation = await education.save();
        res.json({ success: true, message: 'Education entry updated successfully', data: updatedEducation });
    } catch (error) {
        console.error('Error updating education entry:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an education entry
// @route   DELETE /api/education/:id
// @access  Admin
const deleteEducation = async (req, res) => {
    try {
        const education = await Education.findByIdAndDelete(req.params.id);
        if (!education) {
            return res.status(404).json({ success: false, message: 'Education entry not found' });
        }
        res.json({ success: true, message: 'Education entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting education entry:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation,
};
