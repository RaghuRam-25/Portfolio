const Project = require('../models/Project');
const User = require('../models/User');

const publishedProjectFilter = { isPublished: { $ne: false } };

const calculateExperienceLabel = (startDate, today = new Date()) => {
  if (!startDate) return '0 Months';

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime()) || start > today) return '0 Months';

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();

  if (today.getDate() < start.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years >= 1) {
    return `${years}+ ${years === 1 ? 'Year' : 'Years'}`;
  }

  const safeMonths = Math.max(months, 0);
  return `${safeMonths} ${safeMonths === 1 ? 'Month' : 'Months'}`;
};

const getStats = async () => {
  const profile = await User.findOne({ isPortfolioProfile: true, deletedAt: null }).sort({ createdAt: 1 });
  const fallbackUser = profile || await User.findOne({ role: 'admin', deletedAt: null }).sort({ createdAt: 1 });
  const experienceStartDate = fallbackUser?.accountCreatedAt || fallbackUser?.createdAt;

  const [projects, completedProjects] = await Promise.all([
    Project.countDocuments(publishedProjectFilter),
    Project.countDocuments({ ...publishedProjectFilter, isDelivered: true }),
  ]);

  const deliveryRate = projects > 0 ? Math.round((completedProjects / projects) * 100) : 0;

  return {
    experience: calculateExperienceLabel(experienceStartDate),
    projects,
    deliveryRate,
  };
};

module.exports = {
  calculateExperienceLabel,
  getStats,
  publishedProjectFilter,
};
