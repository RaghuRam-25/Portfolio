// ============================================================
// অভিজ্ঞতা (Experience) হিসাব — start date থেকে elapsed সময়ের ভিত্তিতে
// স্বয়ংক্রিয়ভাবে Days / Weeks / Months / Years দেখায়।
//   < 7 দিন      → Days
//   7–30 দিন     → Weeks
//   1–11 মাস     → Months
//   >= 1 বছর     → Years (+ Months)
// Hero ও About উভয় সেকশন একই লজিক ব্যবহার করে, তাই কোনো হার্ডকোডেড মান নেই।
// ============================================================
export const calculateExperience = (startDateStr) => {
  if (!startDateStr) return "0 Days";

  const start = new Date(startDateStr);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || start > now) return "0 Days";

  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  const days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // এক মাসের কম হলে: ৭ দিনের কম → Days, নয়তো Weeks
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
