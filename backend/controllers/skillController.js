const Skill = require('../models/Skill');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find({}).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: skills });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Admin
const createSkill = async (req, res) => {
    try {
        const { name, description, category, level, years, order } = req.body;
        const skill = await Skill.create({ name, description, category, level, years, order });
        res.status(201).json({ success: true, message: 'Skill created successfully', data: skill });
    } catch (error) {
        console.error('Error creating skill:', error);
        if (error.code === 11000) { // Handle duplicate name error
            return res.status(400).json({ success: false, message: 'A skill with this name already exists.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing skill
// @route   PUT /api/skills/:id
// @access  Admin
const updateSkill = async (req, res) => {
    try {
        const { name, description, category, level, years, order } = req.body;
        let skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }

        skill.name = name ?? skill.name;
        skill.description = description ?? skill.description;
        skill.category = category ?? skill.category;
        skill.level = level ?? skill.level;
        skill.years = years ?? skill.years;
        skill.order = order ?? skill.order;

        const updatedSkill = await skill.save();
        res.json({ success: true, message: 'Skill updated successfully', data: updatedSkill });
    } catch (error) {
        console.error('Error updating skill:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A skill with this name already exists.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Admin
const deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }
        res.json({ success: true, message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };