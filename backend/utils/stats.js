const Project = require('../models/Project');
const User = require('../models/User');

const publishedProjectFilter = { isPublished: { $ne: false } };

const calculateExperienceLabel = (startDateStr, today = new Date()) => {
  if (!startDateStr) return "0 Days";

  const start = new Date(startDateStr);

  if (Number.isNaN(start.getTime()) || start > today) return "0 Days";

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  const days = today.getDate() - start.getDate();

  if (days < 0) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // One month or less: less than 7 days -> Days, otherwise Weeks
  if (years === 0 && months === 0) {
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
    }
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
  }

  if (years === 0) {
    return `${months} ${months === 1 ? 'Month' : 'Months'}`;
  }

  let expStr = `${years} ${years === 1 ? 'Year' : 'Years'}`;
  if (months > 0) {
    expStr += ` ${months} ${months === 1 ? 'Month' : 'Months'}`;
  }
  return expStr;
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
