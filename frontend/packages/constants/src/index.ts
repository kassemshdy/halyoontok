import type { ContentCategory, Language, Dialect, AgeBand } from "@halyoontok/shared-types";

export const CATEGORIES: { value: ContentCategory; label: string; labelAr: string }[] = [
  { value: "humor", label: "Humor", labelAr: "مرح" },
  { value: "sports", label: "Sports", labelAr: "رياضة" },
  { value: "science", label: "Science", labelAr: "علوم" },
  { value: "english_learning", label: "English Learning", labelAr: "تعلم الإنجليزية" },
  { value: "arabic_literacy", label: "Arabic Literacy", labelAr: "اللغة العربية" },
  { value: "culture", label: "Culture", labelAr: "ثقافة" },
  { value: "safe_trends", label: "Safe Trends", labelAr: "ترندات آمنة" },
  { value: "character_stories", label: "Character Stories", labelAr: "قصص شخصيات" },
];

export const LANGUAGES: { value: Language; label: string; labelAr: string }[] = [
  { value: "ar", label: "Arabic", labelAr: "العربية" },
  { value: "en", label: "English", labelAr: "الإنجليزية" },
];

export const DIALECTS: { value: Dialect; label: string; labelAr: string }[] = [
  { value: "msa", label: "Modern Standard Arabic", labelAr: "الفصحى" },
  { value: "lebanese", label: "Lebanese", labelAr: "لبناني" },
  { value: "iraqi", label: "Iraqi", labelAr: "عراقي" },
  { value: "none", label: "None", labelAr: "لا يوجد" },
];

export const AGE_BANDS: { value: AgeBand; label: string; range: string }[] = [
  { value: "under_8", label: "Under 8", range: "< 8" },
  { value: "8_12", label: "Ages 8-12", range: "8-12" },
  { value: "13_15", label: "Ages 13-15", range: "13-15" },
];

export const COUNTRIES = [
  { code: "LB", label: "Lebanon", labelAr: "لبنان" },
  { code: "IQ", label: "Iraq", labelAr: "العراق" },
  { code: "SA", label: "Saudi Arabia", labelAr: "السعودية" },
  { code: "AE", label: "UAE", labelAr: "الإمارات" },
  { code: "JO", label: "Jordan", labelAr: "الأردن" },
  { code: "EG", label: "Egypt", labelAr: "مصر" },
];

export const FEED_CONFIG = {
  DEFAULT_BATCH_SIZE: 20,
  EDUCATION_INJECTION_INTERVAL: 4, // inject 1 educational video every N videos
  MAX_CONSECUTIVE_SAME_CATEGORY: 2,
};
