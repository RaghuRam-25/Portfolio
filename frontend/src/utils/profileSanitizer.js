const asText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const asBoolean = (value, fallback = false) => {
  return typeof value === 'boolean' ? value : fallback;
};

const sanitizeCopy = (copy) => ({
  eyebrow: asText(copy?.eyebrow),
  title: asText(copy?.title),
  subtitle: asText(copy?.subtitle),
  emptyState: asText(copy?.emptyState),
});

const sanitizeVideo = (video, index) => ({
  title: asText(video?.title),
  description: asText(video?.description),
  videoUrl: asText(video?.videoUrl),
  videoType: video?.videoType === 'upload' ? 'upload' : 'embed',
  thumbnailUrl: asText(video?.thumbnailUrl),
  posterImageUrl: asText(video?.posterImageUrl),
  tag: asText(video?.tag),
  autoplay: asBoolean(video?.autoplay),
  loop: asBoolean(video?.loop),
  muted: asBoolean(video?.muted, true),
  controls: video?.controls === undefined ? true : asBoolean(video?.controls, true),
  order: asNumber(video?.order, index),
});

export const sanitizeProfile = (profile) => {
  if (!profile || typeof profile !== 'object') return {};

  return {
    ...profile,
    name: asText(profile.name, 'Portfolio'),
    title: asText(profile.title),
    bio: asText(profile.bio),
    avatarUrl: asText(profile.avatarUrl),
    careerStartDate: asText(profile.careerStartDate),
    stats: Array.isArray(profile.stats)
      ? profile.stats.map((stat) => ({
        value: asText(stat?.value),
        label: asText(stat?.label),
      }))
      : [],
    heroSection: {
      ...profile.heroSection,
      headline: asText(profile.heroSection?.headline),
      description: asText(profile.heroSection?.description),
      heroImageUrl: asText(profile.heroSection?.heroImageUrl),
      resumeUrl: asText(profile.heroSection?.resumeUrl),
      ctaText: asText(profile.heroSection?.ctaText),
      ctaUrl: asText(profile.heroSection?.ctaUrl),
      availability: {
        isAvailable: asBoolean(profile.heroSection?.availability?.isAvailable),
        badgeText: asText(profile.heroSection?.availability?.badgeText),
      },
    },
    aboutSection: sanitizeCopy(profile.aboutSection),
    projectSection: sanitizeCopy(profile.projectSection),
    videoSection: sanitizeCopy(profile.videoSection),
    certificateSection: sanitizeCopy(profile.certificateSection),
    educationSection: sanitizeCopy(profile.educationSection),
    testimonialSection: sanitizeCopy(profile.testimonialSection),
    estimatorSection: sanitizeCopy(profile.estimatorSection),
    contactInfo: {
      ...profile.contactInfo,
      heading: asText(profile.contactInfo?.heading),
      subtitle: asText(profile.contactInfo?.subtitle),
      formTitle: asText(profile.contactInfo?.formTitle),
      socialHeading: asText(profile.contactInfo?.socialHeading),
      email: asText(profile.contactInfo?.email),
      phone: asText(profile.contactInfo?.phone),
      location: asText(profile.contactInfo?.location),
    },
    videos: Array.isArray(profile.videos)
      ? profile.videos.filter((video) => video && typeof video === 'object').map(sanitizeVideo)
      : [],
  };
};
