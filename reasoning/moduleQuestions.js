export const OPENERS = {
  website:
    "Do you already have a website, and what do you most want it to do for your practice?",

  scheduling:
    "How are patients booking with you today — and what's frustrating about it?",

  ehr:
    "How many providers will use your records system, and do you bill insurance or run cash-pay?",

  forms:
    "What do you need to collect from patients before a visit, and how are you doing it now?",

  telehealth:
    "How often will you see patients over video, and what's your budget for it?",

  followUpCare:
    "How do you want to stay in touch with patients between visits?",
};

export const openerFor = (module) =>
  OPENERS[module] || `Tell me about your needs for ${module}`;