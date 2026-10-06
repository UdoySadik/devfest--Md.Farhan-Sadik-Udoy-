/**
 * Internationalization (i18n) Module (Phase 5 Full Implementation)
 * Comprehensive English and Bengali (Bangla) translation dictionaries,
 * locale formatting, and language switching helpers.
 */

import { getState, updateState } from './state.js';

export const translations = {
  en: {
    // Brand & Header
    appTitle: 'Tender Document Package Builder',
    appSubtitle: 'AI DevFest 2026 Competition',

    // Section Titles
    step1Title: 'Load Requirements',
    step2Title: 'Upload PDF Files',
    step3Title: 'Document Requirements & Matching',
    step4Title: 'Generate Package',
    tenderInfoTitle: 'Tender Information',

    // Upload Zones
    jsonUploadPrompt: 'Choose requirements.json or drag & drop',
    pdfUploadPrompt: 'Choose PDF files or drag & drop (max 30 files, 50 MB)',
    uploadDragOver: 'Drop files here to upload',

    // Tender Information Fields
    tenderId: 'Tender ID',
    tenderTitle: 'Tender Title',
    procuringEntity: 'Procuring Entity',
    bidder: 'Bidder Name',
    deadline: 'Submission Deadline',
    tenderStatus: 'Tender Status',

    // Requirements Table Columns & Labels
    order: 'Order',
    docTitle: 'Document Name',
    type: 'Type',
    mandatory: 'Mandatory',
    optional: 'Optional',
    matchedFile: 'Matched File',
    expiryDate: 'Expiry Date',
    status: 'Status',
    actions: 'Actions',
    selectFilePlaceholder: 'Select file to match...',
    noFileMatched: 'None',
    expiryCheck: 'Expiry Check',
    matchFileFirst: 'Match file first',
    yes: 'Yes',
    no: 'No',

    // Document Statuses
    statusMissing: 'Missing',
    statusExpiryNeeded: 'Expiry date needed',
    statusExpired: 'Expired',
    statusNotProvided: 'Not provided',
    statusOk: 'OK',

    // Action Buttons
    btnGenerate: 'Generate Package',
    btnDownload: 'Download Package',
    btnGenerating: 'Generating Package...',
    btnRemove: 'Remove',
    btnUnmatch: 'Unmatch',
    btnClearAll: 'Clear All',

    // Generation & Blocking Reasons
    cannotGenerate: 'Cannot Generate Package',
    issuesRequireAttention: 'issue(s) require attention',
    readyToGenerate: 'All Requirements Satisfied',
    readyToGenerateDesc: 'All mandatory documents matched and all expiry dates are valid. Ready to generate package.',
    generatingCover: 'Generating English cover page...',
    generatingMerge: 'Merging matched documents in order...',
    generatingFooters: 'Stamping footers on all pages...',
    generatingComplete: 'Package generated successfully!',

    // Duplicate Detection
    duplicate: 'Duplicate',
    duplicateDetected: 'Duplicate file content detected.',
    duplicateMatch: 'This file has identical content to another matched file and cannot be matched separately.',
    identicalContentTo: 'Identical content to',

    // Empty States & Placeholders
    tenderInfoPlaceholder: 'No tender requirements loaded yet. Please upload a requirements.json file above.',
    filesPlaceholder: 'No PDF files uploaded yet. Add files via drag & drop or the button above.',
    requirementsPlaceholder: 'Load requirements.json to view document specifications and matching table.',
    generatePlaceholder: 'Complete all mandatory requirements and resolve any blocking issues to generate the submission package.',

    // Notifications & Messages
    notPdf: 'Only valid PDF files are accepted.',
    tooManyFiles: 'Maximum 30 files allowed. Additional files were rejected.',
    tooLarge: 'Total file size exceeds 50 MB limit.',
    invalidJson: 'The uploaded file is not a valid requirements.json specification.',
    packageSuccess: 'Submission package generated successfully!',
    packageError: 'An error occurred while generating the PDF package.',
    fileRemoved: 'File removed successfully.',

    // Footer
    footerText: 'Tender Document Package Builder — AI DevFest 2026'
  },

  bn: {
    // Brand & Header
    appTitle: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
    appSubtitle: 'এআই দেবফেস্ট ২০২৬ প্রতিযোগিতা',

    // Section Titles
    step1Title: 'প্রয়োজনীয়তা লোড করুন',
    step2Title: 'পিডিএফ ফাইল আপলোড করুন',
    step3Title: 'ডকুমেন্টের প্রয়োজনীয়তা ও ম্যাপিং',
    step4Title: 'প্যাকেজ প্রস্তুত করুন',
    tenderInfoTitle: 'টেন্ডারের তথ্যাবলী',

    // Upload Zones
    jsonUploadPrompt: 'requirements.json নির্বাচন করুন বা ড্র্যাগ ও ড্রপ করুন',
    pdfUploadPrompt: 'পিডিএফ ফাইল নির্বাচন করুন বা ড্র্যাগ ও ড্রপ করুন (সর্বোচ্চ ৩০টি ফাইল, ৫০ মেগাবাইট)',
    uploadDragOver: 'আপলোড করতে ফাইল এখানে ছেড়ে দিন',

    // Tender Information Fields
    tenderId: 'টেন্ডার আইডি',
    tenderTitle: 'টেন্ডারের শিরোনাম',
    procuringEntity: 'সংগ্রহকারী প্রতিষ্ঠান',
    bidder: 'দরদাতার নাম',
    deadline: 'জমা দেওয়ার শেষ তারিখ',
    tenderStatus: 'টেন্ডারের অবস্থা',

    // Requirements Table Columns & Labels
    order: 'ক্রম',
    docTitle: 'ডকুমেন্টের নাম',
    type: 'ধরণ',
    mandatory: 'বাধ্যতামূলক',
    optional: 'ঐচ্ছিক',
    matchedFile: 'সংযুক্ত ফাইল',
    expiryDate: 'মেয়াদ উত্তীর্ণের তারিখ',
    status: 'অবস্থা',
    actions: 'পদক্ষেপ',
    selectFilePlaceholder: 'ম্যাচ করার জন্য ফাইল বেছে নিন...',
    noFileMatched: 'কোনোটি নয়',
    expiryCheck: 'মেয়াদ যাচাই',
    matchFileFirst: 'আগে ফাইল যুক্ত করুন',
    yes: 'হ্যাঁ',
    no: 'না',

    // Document Statuses
    statusMissing: 'অনুপস্থিত',
    statusExpiryNeeded: 'মেয়াদ উত্তীর্ণের তারিখ প্রয়োজন',
    statusExpired: 'মেয়াদ উত্তীর্ণ',
    statusNotProvided: 'প্রদান করা হয়নি',
    statusOk: 'সঠিক',

    // Action Buttons
    btnGenerate: 'প্যাকেজ তৈরি করুন',
    btnDownload: 'প্যাকেজ ডাউনলোড করুন',
    btnGenerating: 'প্যাকেজ তৈরি হচ্ছে...',
    btnRemove: 'মুছুন',
    btnUnmatch: 'সংযোগ বিচ্ছিন্ন',
    btnClearAll: 'সব পরিষ্কার করুন',

    // Generation & Blocking Reasons
    cannotGenerate: 'প্যাকেজ তৈরি করা যাচ্ছে না',
    issuesRequireAttention: 'টি সমস্যা সমাধান প্রয়োজন',
    readyToGenerate: 'সকল প্রয়োজনীয়তা সম্পন্ন হয়েছে',
    readyToGenerateDesc: 'সকল বাধ্যতামূলক ডকুমেন্ট সংযুক্ত এবং মেয়াদের তারিখ সঠিক রয়েছে। প্যাকেজ তৈরির জন্য প্রস্তুত।',
    generatingCover: 'কভার পেজ তৈরি হচ্ছে...',
    generatingMerge: 'ডকুমেন্টগুলো ক্রমানুসারে যুক্ত করা হচ্ছে...',
    generatingFooters: 'প্রতিটি পৃষ্ঠায় ফুটার যুক্ত করা হচ্ছে...',
    generatingComplete: 'প্যাকেজ সফলভাবে প্রস্তুত হয়েছে!',

    // Duplicate Detection
    duplicate: 'অনুরূপ (ডুপ্লিকেট)',
    duplicateDetected: 'অনুরূপ বিষয়বস্তুর ডুপ্লিকেট ফাইল শনাক্ত হয়েছে।',
    duplicateMatch: 'এই ফাইলটি ইতিমধ্যে সংযুক্ত অন্য একটি ফাইলের হুবহু অনুরূপ এবং আলাদাভাবে যুক্ত করা যাবে না।',
    identicalContentTo: 'হুবহু একই বিষয়বস্তু রয়েছে',

    // Empty States & Placeholders
    tenderInfoPlaceholder: 'কোন টেন্ডার প্রয়োজনীয়তা এখনো লোড করা হয়নি। অনুগ্রহ করে উপরে একটি requirements.json ফাইল আপলোড করুন।',
    filesPlaceholder: 'এখনও কোনও পিডিএফ ফাইল আপলোড করা হয়নি। ফাইল নির্বাচন করুন অথবা ড্র্যাগ করে আনুন।',
    requirementsPlaceholder: 'ডকুমেন্ট স্পেসিফিকেশন এবং ম্যাপিং টেবিল দেখতে requirements.json লোড করুন।',
    generatePlaceholder: 'সাবমিশন প্যাকেজ তৈরি করতে সমস্ত বাধ্যতামূলক ডকুমেন্ট প্রদান করুন এবং ত্রুটি সমাধান করুন।',

    // Notifications & Messages
    notPdf: 'শুধুমাত্র বৈধ পিডিএফ ফাইল গ্রহণযোগ্য।',
    tooManyFiles: 'সর্বোচ্চ ৩০টি ফাইল অনুমোদিত। অতিরিক্ত ফাইল বাতিল করা হয়েছে।',
    tooLarge: 'ফাইলের মোট আকার ৫০ মেগাবাইটের সীমা অতিক্রম করেছে।',
    invalidJson: 'আপলোডকৃত ফাইলটি সঠিক requirements.json ফরম্যাটে নেই।',
    packageSuccess: 'সাবমিশন প্যাকেজ সফলভাবে তৈরি হয়েছে!',
    packageError: 'পিডিএফ প্যাকেজ তৈরির সময় একটি ত্রুটি ঘটেছে।',
    fileRemoved: 'ফাইল সফলভাবে মুছে ফেলা হয়েছে।',

    // Footer
    footerText: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার — এআই দেবফেস্ট ২০২৬'
  }
};

/**
 * Translate a key according to the current application language.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  const lang = getState().language || 'en';
  const dict = translations[lang] || translations.en;
  return dict[key] !== undefined ? dict[key] : (translations.en[key] || key);
}

/**
 * Return requirement title based on current language.
 * Always falls back to title_en if title_bn is missing.
 * @param {{ title_en?: string, title_bn?: string }} requirement
 * @returns {string}
 */
export function getDocTitle(requirement) {
  if (!requirement) return '';
  const lang = getState().language || 'en';
  if (lang === 'bn' && requirement.title_bn) {
    return requirement.title_bn;
  }
  return requirement.title_en || '';
}

/**
 * Switch the application language and trigger state updates.
 * @param {'en' | 'bn'} lang
 */
export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'bn') return;
  updateState({ language: lang });
}

/**
 * Get current application language code.
 * @returns {'en' | 'bn'}
 */
export function getLanguage() {
  return getState().language || 'en';
}
