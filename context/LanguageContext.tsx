'use client';
// context/LanguageContext.tsx
// সম্পূর্ণ অ্যাপ্লিকেশনের ভাষা টগল (English বা বাংলা) স্টেট, ট্রান্সলেশন ডিকশনারি ও অটো-লোকালাইজার

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

export const translations = {
  en: {
    // Navbar
    brandTitle: 'NextForm',
    brandSubtitle: 'Smart Form Generator',
    newFormBtn: 'New Form',
    dashboardBtn: 'Dashboard',
    signInBtn: 'Sign In',
    registerBtn: 'Get Started',
    logoutTooltip: 'Sign Out',

    // Landing Page
    heroBadge: 'Say Goodbye to Boring Forms',
    heroTitlePrefix: 'Create Beautiful &',
    heroTitleGradient: 'Smart Web Forms',
    heroDescription:
      'Design modern, customizable forms with vibrant themes, image & file uploads, and multi-column layouts. Fast raw MongoDB queries and one-click Excel export.',
    heroCtaDashboard: 'Go to Dashboard',
    heroCtaRegister: 'Get Started Free',
    heroCtaLogin: 'Sign In',
    badgeNoCode: 'No Coding Needed',
    badgeGoogleAuth: 'Google & Email Sign-In',
    badgeExcelExport: 'Direct Excel Export',
    badgeVercel: 'Vercel Ready',
    whyTitle: 'Why Choose NextForm?',
    whySubtitle: 'Much more stylish, flexible, and secure than standard Google Forms.',
    feature1Title: 'Customizable Themes & Layouts',
    feature1Desc: 'Customize accent colors, glassmorphism, backgrounds, and arrange multiple fields per row with drag-and-drop.',
    feature2Title: 'One-Click Excel Export',
    feature2Desc: 'Export all collected responses neatly formatted with question titles directly into Microsoft Excel (.xlsx).',
    feature3Title: 'Raw MongoDB & Maximum Security',
    feature3Desc: 'Bcrypt password hashing, XSS sanitization, rate limiting, and NoSQL injection defenses with raw MongoDB queries.',

    // Dashboard
    dashTitle: 'My Forms Dashboard',
    dashSubtitle: 'Welcome! Manage and create your forms from here.',
    createNewForm: 'Create New Form',
    creatingForm: 'Creating...',
    totalForms: 'Total Forms',
    totalResponses: 'Total Responses',
    excelSupported: 'Excel Export Enabled',
    realtime: '100% Realtime',
    createdForms: 'Created Forms',
    noFormsTitle: 'No Forms Created Yet',
    noFormsDesc: 'Click "Create New Form" above to build your first interactive form.',
    startNow: 'Start Now',
    editAction: 'Edit',
    responsesAction: 'Responses',
    exportExcelAction: 'Excel Export',
    copiedLink: 'Copied!',
    shareLink: 'Share Link',
    deleteConfirm: 'Are you sure you want to delete this form and all its responses?',
    untitledForm: 'Untitled Form',
    noDescription: 'No description provided',
    createdOn: 'Created on',
    responsesCount: 'Responses',

    // Form Builder
    builderMode: 'Form Editor',
    tabFields: 'Fields & Layout',
    tabTheme: 'Theme & Style',
    tabPreview: 'Live Preview',
    viewResponses: 'View Responses',
    shareBtn: 'Share',
    saveBtn: 'Save Changes',
    savingBtn: 'Saving...',
    savedMsg: 'Changes saved successfully!',
    saveErrorMsg: 'Failed to save changes.',
    formTitlePlaceholder: 'Form Title...',
    formDescPlaceholder: 'Form description and instructions...',
    fieldLabelPlaceholder: 'Question title...',
    fieldRequired: 'Required',
    deleteField: 'Delete',
    addOption: '+ Add Option',
    optionPlaceholder: 'Option',
    addQuestionTitle: 'Add New Question',
    fieldWidth: 'Field Width',
    widthFull: '100% (Full Row)',
    widthHalf: '50% (2 per Row)',
    widthThird: '33% (3 per Row)',
    fieldShortText: 'Short Answer',
    fieldParagraph: 'Paragraph',
    fieldNumber: 'Number',
    fieldEmail: 'Email',
    fieldRadio: 'Multiple Choice',
    fieldCheckbox: 'Checkboxes',
    fieldDropdown: 'Dropdown',
    fieldDate: 'Date',
    fieldImage: 'Image Upload',
    fieldFile: 'File Upload',
    dragToReorder: 'Drag to reorder',

    // Per-field Design & Upload Settings
    fieldCustomDesign: 'Field Style & Color',
    fieldCustomColor: 'Field Color',
    fieldCardStyleLabel: 'Card Style',
    styleDefault: 'Clean White',
    styleSubtle: 'Subtle Slate',
    styleHighlight: 'Tinted Glow',
    styleGlass: 'Glassmorphic',
    maxSizeLabel: 'Max Size:',
    sizeExceededError: 'File exceeds maximum allowed size of',
    uploadPromptImage: 'Click or drop image here (Cloudinary CDN)',
    uploadPromptFile: 'Click or drop document/file here',
    uploadingFile: 'Uploading to cloud...',
    fileUploaded: 'Uploaded successfully',
    removeFile: 'Remove',
    viewFile: 'View File',
    viewImage: 'View Image',

    // Theme Customizer
    themeTitle: 'Theme & Visual Styling',
    accentColor: 'Primary Accent Color',
    customHex: 'Custom Hex:',
    bgStyle: 'Background Style',
    bgMesh: 'Gradient Mesh',
    bgGradient: 'Soft Gradient',
    bgClean: 'Minimal White',
    bgWarm: 'Sunset Warm',
    bgDark: 'Sleek Dark',
    cardStyleLabel: 'Card Style',
    cardGlass: 'Glassmorphism',
    cardElevated: 'Elevated Shadow',
    cardBordered: 'Clean Bordered',
    bannerGradientLabel: 'Header Banner Gradient',
    submitButtonLabel: 'Submit Button Label',
    submitButtonPlaceholder: 'e.g. Submit, Register Now, Send Feedback',

    // Form Renderer & Public View
    progressLabel: 'Completion Progress',
    requiredNote: '* Marked questions are required',
    enterAnswer: 'Enter your answer...',
    selectOption: 'Select...',
    submitBtnDefault: 'Submit',
    submittingBtn: 'Submitting...',
    thankYouTitle: 'Thank You!',
    thankYouMessage: 'Your response has been successfully received and recorded.',
    submitAnother: 'Submit another response',
    previewBannerNote: 'Respondents will see your form like this:',
    livePreviewBadge: 'Live Canvas Preview',
    previewModeAlert: 'This is a preview mode. To submit real responses, open the public share link.',
    loadingForm: 'Loading form...',
    couldNotLoadForm: 'Could Not Load Form',
    formNotFoundOrClosed: 'Form not found or currently closed.',
    submissionFailed: 'Submission failed',
    networkError: 'Could not connect to server.',

    // Share Modal
    shareModalTitle: 'Share Form',
    shareModalSubtitle: 'Anyone with this link can fill out and submit responses.',
    copyLinkBtn: 'Copy Link',
    copiedLinkMsg: 'Link copied to clipboard!',
    openInNewTab: 'Open in new tab',
    shareViaWhatsApp: 'WhatsApp',
    shareViaMessenger: 'Messenger',
    shareViaEmail: 'Email',
    shareViaNative: 'More Apps',
    sharePromptTitle: 'Share on Social Media',

    // Responses Page
    responsesTitle: 'Responses Data',
    totalSubmissions: 'Total Submissions:',
    statusActive: 'Active & Accepting',
    statusLabel: 'Status',
    latestSubmission: 'Latest Submission',
    noSubmissionYet: 'None yet',
    searchPlaceholder: 'Search within responses...',
    noResponsesYet: 'No responses submitted yet',
    sharePrompt: 'Share the public link to start collecting submissions.',
    downloadExcel: 'Download Excel (.xlsx)',
    downloadPdf: 'Download PDF (.pdf)',
    generatingPdf: 'Generating PDF...',
    printPdf: 'Print / Save PDF',
    pdfSummaryReport: 'Form Responses Summary Report',
    pdfGeneratedOn: 'Generated on:',
    pdfTotalResponses: 'Total Responses Recorded:',
    colSubmittedAt: 'Submitted At',
    colDetails: 'Details',
    modalTitle: 'Single Respondent Details',
    modalSubmittedOn: 'Submitted on:',
    closeModal: 'Close',

    // Auth
    welcomeBack: 'Welcome Back!',
    loginSubtitle: 'Sign in to access your NextForm account',
    createAccount: 'Create New Account',
    registerSubtitle: 'Sign up to start creating your own forms',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. John Doe',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordMinNote: 'Password (min 6 characters)',
    orEmail: 'OR WITH EMAIL',
    signInSubmit: 'Sign In',
    registerSubmit: 'Create Account',
    googleSignIn: 'Sign in with Google',
    googleSignUp: 'Sign up with Google',
    checking: 'Checking...',
    completing: 'Creating account...',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signUpLink: 'Sign Up',
    signInLink: 'Sign In',

    // User Roles & Admin Controls
    roleBadgeAdmin: 'Admin',
    roleBadgeEditor: 'Editor',
    adminPanelLink: 'Admin Panel',
    roleSelectorTitle: 'User Role',
    roleSelectorDesc: 'Preview application with different permissions',
    switchToAdmin: 'Switch to Admin',
    switchToEditor: 'Switch to Editor',
    switchingRole: 'Switching...',
    roleSwitchedSuccess: 'Role switched successfully!',

    // Admin Portal & Control Center
    adminPortalTitle: 'Admin Control Center',
    adminPortalSubtitle: 'Manage users, grant roles, suspend accounts, and oversee all system forms.',
    tabUsers: 'User Management',
    tabForms: 'System Forms Oversight',
    statTotalUsers: 'Total Users',
    statAdmins: 'Admins',
    statEditors: 'Editors',
    statTotalForms: 'Total Forms',
    statTotalResponses: 'Total Responses',
    statActiveUsers: 'Active Users',
    statSuspendedUsers: 'Suspended',
    searchUsersPlaceholder: 'Search by name or email...',
    filterByRole: 'Filter Role',
    filterByStatus: 'Filter Status',
    allRoles: 'All Roles',
    allStatuses: 'All Statuses',
    activeStatus: 'Active',
    suspendedStatus: 'Suspended',
    colUser: 'User',
    colRole: 'Role',
    colStatus: 'Status',
    colFormsCreated: 'Forms Created',
    colJoinedDate: 'Joined',
    colActions: 'Actions',
    makeAdminAction: 'Make Admin',
    makeEditorAction: 'Make Editor',
    suspendAction: 'Suspend',
    activateAction: 'Activate',
    deleteUserAction: 'Delete User',
    deleteUserConfirm: 'Are you sure you want to permanently delete this user? All their forms and responses will be wiped!',
    addNewUserBtn: 'Add User',
    searchFormsPlaceholder: 'Search forms by title or creator...',
    colFormTitle: 'Form Title',
    colCreator: 'Creator',
    colFields: 'Fields',
    colSubmissions: 'Submissions',
    colCreatedAt: 'Created At',
    colManage: 'Manage',
    openFormAction: 'Open Form',
    editFormAction: 'Edit Form',
    viewResponsesAction: 'Responses',
    deleteFormAction: 'Delete Form',
    deleteFormAdminConfirm: 'Are you sure you want to delete this form as Administrator?',
    accessDeniedTitle: 'Access Restricted',
    accessDeniedDesc: 'This area is strictly reserved for Administrators. Switch your role to Admin using the Navbar to enter.',
    returnHomeBtn: 'Return to Home',
  },
  bn: {
    // Navbar
    brandTitle: 'NextForm',
    brandSubtitle: 'স্মার্ট ফর্ম জেনারেটর',
    newFormBtn: 'নতুন ফর্ম',
    dashboardBtn: 'ড্যাশবোর্ড',
    signInBtn: 'সাইন-ইন',
    registerBtn: 'অ্যাকাউন্ট খুলুন',
    logoutTooltip: 'লগআউট',

    // Landing Page
    heroBadge: 'সাধারণ ফর্মকে বলুন বিদায়',
    heroTitlePrefix: 'তৈরি করুন দৃষ্টিনন্দন ও',
    heroTitleGradient: 'স্মার্ট ওয়েব ফর্ম',
    heroDescription:
      'গুগল ফর্মের একঘেয়েমি দূর করে কাস্টম রঙ, ছবি ও ফাইল আপলোড এবং পাশাপাশি একাধিক ফিল্ড দিয়ে ফর্ম সাজান। দ্রুততম র মঙ্গোডিবি কুয়েরি এবং এক ক্লিকে এক্সেল এক্সপোর্ট।',
    heroCtaDashboard: 'ড্যাশবোর্ডে যান',
    heroCtaRegister: 'বিনামূল্যে শুরু করুন',
    heroCtaLogin: 'লগইন করুন',
    badgeNoCode: 'কোনো কোডিং প্রয়োজন নেই',
    badgeGoogleAuth: 'গুগল ও ইমেইল সাইন-ইন',
    badgeExcelExport: 'সরাসরি এক্সেল এক্সপোর্ট',
    badgeVercel: 'ভার্সেল উপযোগী',
    whyTitle: 'কেন NextForm বেছে নেবেন?',
    whySubtitle: 'সাধারণ গুগল ফর্মের চেয়ে অনেক বেশি আকর্ষণীয়, নমনীয় এবং সুরক্ষিত।',
    feature1Title: 'কাস্টমাইজেবল থিম ও লেআউট',
    feature1Desc: 'পছন্দমতো রঙের ব্র্যান্ডিং, গ্লাস-মরফিজম এবং ড্র্যাগ-অ্যান্ড-ড্রপ দিয়ে প্রতি সারিতে পাশাপাশি একাধিক ফিল্ড সাজান।',
    feature2Title: 'এক ক্লিকে এক্সেল এক্সপোর্ট',
    feature2Desc: 'সংগৃহীত প্রতিটি উত্তর স্বয়ংক্রিয়ভাবে প্রশ্নের নাম সহ কলামে সাজিয়ে সরাসরি Microsoft Excel (.xlsx) হিসেবে নামিয়ে নিন।',
    feature3Title: 'র মঙ্গোডিবি ও সর্বোচ্চ নিরাপত্তা',
    feature3Desc: 'Bcrypt পাসওয়ার্ড হ্যাশিং, XSS ইনপুট স্যানিটাইজেশন, রেট লিমিট এবং নোএসকিউএল ইনজেকশন মুক্ত ডেটাবেজ।',

    // Dashboard
    dashTitle: 'আমার ফর্ম ড্যাশবোর্ড',
    dashSubtitle: 'স্বাগতম! আপনার সকল ফর্ম এখান থেকে পরিচালনা করুন।',
    createNewForm: 'নতুন ফর্ম তৈরি করুন',
    creatingForm: 'তৈরি হচ্ছে...',
    totalForms: 'মোট ফর্ম',
    totalResponses: 'মোট উত্তর',
    excelSupported: 'এক্সেল এক্সপোর্ট সক্ষম',
    realtime: '১০০% রিয়েলটাইম',
    createdForms: 'তৈরিকৃত ফর্মসমূহ',
    noFormsTitle: 'এখনও কোনো ফর্ম তৈরি করা হয়নি',
    noFormsDesc: 'আপনার প্রথম ফর্ম তৈরি করতে উপরের "নতুন ফর্ম তৈরি করুন" বাটনে ক্লিক করুন।',
    startNow: 'এখনই শুরু করুন',
    editAction: 'এডিট',
    responsesAction: 'রেসপন্স',
    exportExcelAction: 'এক্সেল এক্সপোর্ট',
    copiedLink: 'কপি হয়েছে!',
    shareLink: 'লিংক কপি',
    deleteConfirm: 'আপনি কি নিশ্চিত যে এই ফর্ম এবং এর সমস্ত রেসপন্স মুছে ফেলতে চান?',
    untitledForm: 'শিরোনামহীন ফর্ম',
    noDescription: 'কোনো বিবরণ যোগ করা হয়নি',
    createdOn: 'তৈরির তারিখ',
    responsesCount: 'টি উত্তর',

    // Form Builder
    builderMode: 'ফর্ম এডিটর',
    tabFields: 'ফিল্ড ও লেআউট',
    tabTheme: 'থিম ও ডিজাইন',
    tabPreview: 'লাইভ প্রিভিউ',
    viewResponses: 'রেসপন্স দেখুন',
    shareBtn: 'শেয়ার',
    saveBtn: 'সেভ করুন',
    savingBtn: 'সেভ হচ্ছে...',
    savedMsg: 'সফলভাবে সেভ করা হয়েছে!',
    saveErrorMsg: 'সেভ করতে সমস্যা হয়েছে।',
    formTitlePlaceholder: 'ফর্মের শিরোনাম লিখুন...',
    formDescPlaceholder: 'ফর্মের উদ্দেশ্য বা নির্দেশিকা লিখুন...',
    fieldLabelPlaceholder: 'প্রশ্নের শিরোনাম লিখুন...',
    fieldRequired: 'বাধ্যতামূলক',
    deleteField: 'মুছে ফেলুন',
    addOption: '+ আরও অপশন',
    optionPlaceholder: 'বিকল্প',
    addQuestionTitle: 'নতুন প্রশ্ন যোগ করুন',
    fieldWidth: 'ফিল্ডের প্রস্থ',
    widthFull: '১০০% (পুরো সারি)',
    widthHalf: '৫০% (এক সারিতে ২টি)',
    widthThird: '৩৩% (এক সারিতে ৩টি)',
    fieldShortText: 'সংক্ষিপ্ত উত্তর',
    fieldParagraph: 'প্যারাগ্রাফ',
    fieldNumber: 'সংখ্যা',
    fieldEmail: 'ইমেইল',
    fieldRadio: 'মাল্টিপল চয়েস',
    fieldCheckbox: 'চেকবক্স',
    fieldDropdown: 'ড্রপডাউন',
    fieldDate: 'তারিখ',
    fieldImage: 'ছবি আপলোড',
    fieldFile: 'ফাইল আপলোড',
    dragToReorder: 'টেনে স্থানান্তর করুন',

    // Per-field Design & Upload Settings
    fieldCustomDesign: 'ফিল্ড স্টাইল ও ডিজাইন',
    fieldCustomColor: 'ফিল্ডের রঙ',
    fieldCardStyleLabel: 'কার্ড স্টাইল',
    styleDefault: 'হোয়াইট ক্লিন',
    styleSubtle: 'হালকা স্লেট',
    styleHighlight: 'কালার গ্লো',
    styleGlass: 'গ্লাস মরফিজম',
    maxSizeLabel: 'সর্বোচ্চ সাইজ:',
    sizeExceededError: 'ফাইলের আকার সর্বোচ্চ অনুমোদিত সীমা পার করেছে:',
    uploadPromptImage: 'ক্লিক করুন বা ছবি টেনে আনুন (Cloudinary CDN)',
    uploadPromptFile: 'ক্লিক করুন বা ফাইল/ডকুমেন্ট টেনে আনুন',
    uploadingFile: 'ক্লাউডে আপলোড হচ্ছে...',
    fileUploaded: 'সফলভাবে আপলোড হয়েছে',
    removeFile: 'মুছে ফেলুন',
    viewFile: 'ফাইল দেখুন',
    viewImage: 'ছবি দেখুন',

    // Theme Customizer
    themeTitle: 'থিম ও ভিজ্যুয়াল ডিজাইন',
    accentColor: 'মূল ব্র্যান্ড কালার',
    customHex: 'কাস্টম হেক্স কোড:',
    bgStyle: 'ব্যাকগ্রাউন্ড স্টাইল',
    bgMesh: 'গ্রেডিয়েন্ট মেশ',
    bgGradient: 'সফট গ্রেডিয়েন্ট',
    bgClean: 'মিনিম্যাল হোয়াইট',
    bgWarm: 'সানসেট ওয়ার্ম',
    bgDark: 'ডার্ক স্লীক',
    cardStyleLabel: 'ফর্ম কার্ড স্টাইল',
    cardGlass: 'গ্লাস মরফিজম',
    cardElevated: 'ফ্লোটিং শ্যাডো',
    cardBordered: 'ক্লিন বর্ডার',
    bannerGradientLabel: 'হেডার ব্যানার গ্রেডিয়েন্ট',
    submitButtonLabel: 'সাবমিট বাটন টেক্সট',
    submitButtonPlaceholder: 'যেমন: জমা দিন, নিবন্ধন করুন',

    // Form Renderer & Public View
    progressLabel: 'পূরণের অগ্রগতি',
    requiredNote: '* চিহ্নিত প্রশ্নগুলো পূরণ করা বাধ্যতামূলক',
    enterAnswer: 'আপনার উত্তর লিখুন...',
    selectOption: 'নির্বাচন করুন...',
    submitBtnDefault: 'জমা দিন',
    submittingBtn: 'জমা হচ্ছে...',
    thankYouTitle: 'ধন্যবাদ!',
    thankYouMessage: 'আপনার উত্তর সফলভাবে গ্রহণ ও সংরক্ষণ করা হয়েছে।',
    submitAnother: 'আরেকটি প্রতিক্রিয়া জমা দিন',
    previewBannerNote: 'উত্তরদাতারা আপনার ফর্মটি এভাবেই দেখতে পাবে:',
    livePreviewBadge: 'লাইভ ক্যানভাস প্রিভিউ',
    previewModeAlert: 'এটি একটি প্রিভিউ মোড। আসল সাবমিশনের জন্য পাবলিক লিংকটি ওপেন করুন।',
    loadingForm: 'ফর্ম প্রস্তুত হচ্ছে...',
    couldNotLoadForm: 'ফর্ম লোড করা সম্ভব হয়নি',
    formNotFoundOrClosed: 'ফর্মটি পাওয়া যায়নি অথবা বর্তমানে বন্ধ আছে।',
    submissionFailed: 'সাবমিট করতে সমস্যা হয়েছে',
    networkError: 'সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি।',

    // Share Modal
    shareModalTitle: 'ফর্মটি শেয়ার করুন',
    shareModalSubtitle: 'এই লিংকটি যাদের সাথে শেয়ার করবেন তারা ফর্মটি পূরণ করতে পারবে।',
    copyLinkBtn: 'লিংক কপি করুন',
    copiedLinkMsg: 'লিংক ক্লিপবোর্ডে কপি হয়েছে!',
    openInNewTab: 'নতুন ট্যাবে খুলুন',
    shareViaWhatsApp: 'WhatsApp',
    shareViaMessenger: 'Messenger',
    shareViaEmail: 'ইমেইল',
    shareViaNative: 'অন্যান্য মাধ্যম',
    sharePromptTitle: 'সোশ্যাল মিডিয়ায় শেয়ার করুন',

    // Responses Page
    responsesTitle: 'রেসপন্স ডেটা',
    totalSubmissions: 'মোট সংগৃহীত উত্তর:',
    statusActive: 'সক্রিয় ও উন্মুক্ত',
    statusLabel: 'অবস্থা',
    latestSubmission: 'সর্বশেষ উত্তর',
    noSubmissionYet: 'এখনও আসেনি',
    searchPlaceholder: 'উত্তরের মধ্যে অনুসন্ধান করুন...',
    noResponsesYet: 'এখনও কোনো রেসপন্স জমা পড়েনি',
    sharePrompt: 'পাবলিক লিংকটি শেয়ার করে উত্তর সংগ্রহ করা শুরু করুন।',
    downloadExcel: 'Excel (.xlsx) ডাউনলোড',
    downloadPdf: 'PDF (.pdf) ডাউনলোড',
    generatingPdf: 'পিডিএফ তৈরি হচ্ছে...',
    printPdf: 'প্রিন্ট / পিডিএফ',
    pdfSummaryReport: 'ফর্ম রেসপন্স সামারি রিপোর্ট',
    pdfGeneratedOn: 'তৈরির সময়:',
    pdfTotalResponses: 'মোট সংগৃহীত রেসপন্স:',
    colSubmittedAt: 'জমা দেওয়ার সময়',
    colDetails: 'বিস্তারিত',
    modalTitle: 'উত্তরদাতার একক বিবরণ',
    modalSubmittedOn: 'জমা পড়েছে:',
    closeModal: 'বন্ধ করুন',

    // Auth
    welcomeBack: 'স্বাগতম!',
    loginSubtitle: 'আপনার NextForm অ্যাকাউন্টে লগইন করুন',
    createAccount: 'নতুন অ্যাকাউন্ট খুলুন',
    registerSubtitle: 'নিজস্ব ফর্ম তৈরি করতে নিবন্ধন করুন',
    nameLabel: 'আপনার পূর্ণ নাম',
    namePlaceholder: 'যেমন: অনিক আহমেদ',
    emailLabel: 'ইমেইল ঠিকানা',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'পাসওয়ার্ড',
    passwordMinNote: 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)',
    orEmail: 'অথবা ইমেইল দিয়ে',
    signInSubmit: 'সাইন-ইন করুন',
    registerSubmit: 'অ্যাকাউন্ট নিশ্চিত করুন',
    googleSignIn: 'Google দিয়ে সাইন-ইন করুন',
    googleSignUp: 'Google দিয়ে অ্যাকাউন্ট খুলুন',
    checking: 'যাচাই করা হচ্ছে...',
    completing: 'নিবন্ধন সম্পন্ন হচ্ছে...',
    noAccount: 'অ্যাকাউন্ট নেই?',
    haveAccount: 'ইতিপূর্বে অ্যাকাউন্ট আছে?',
    signUpLink: 'নিবন্ধন করুন',
    signInLink: 'লগইন করুন',

    // User Roles & Admin Controls
    roleBadgeAdmin: 'অ্যাডমিন',
    roleBadgeEditor: 'এডিটর',
    adminPanelLink: 'অ্যাডমিন প্যানেল',
    roleSelectorTitle: 'ব্যবহারকারীর ভূমিকা',
    roleSelectorDesc: 'ভিন্ন পারমিশনে অ্যাপ্লিকেশন পরীক্ষা ও ব্যবহার করুন',
    switchToAdmin: 'অ্যাডমিন মোডে যান',
    switchToEditor: 'এডিটর মোডে যান',
    switchingRole: 'পরিবর্তন হচ্ছে...',
    roleSwitchedSuccess: 'ভূমিকা সফলভাবে পরিবর্তন করা হয়েছে!',

    // Admin Portal & Control Center
    adminPortalTitle: 'অ্যাডমিন কন্ট্রোল সেন্টার',
    adminPortalSubtitle: 'ব্যবহারকারী পরিচালনা, রোল নির্ধারণ, অ্যাকাউন্ট স্থগিত ও সমস্ত ফর্ম পর্যবেক্ষণ।',
    tabUsers: 'ব্যবহারকারী নিয়ন্ত্রণ',
    tabForms: 'সকল ফর্মের তদারকি',
    statTotalUsers: 'মোট ব্যবহারকারী',
    statAdmins: 'অ্যাডমিনগণ',
    statEditors: 'এডিটরগণ',
    statTotalForms: 'মোট ফর্ম',
    statTotalResponses: 'মোট উত্তর',
    statActiveUsers: 'সক্রিয় ব্যবহারকারী',
    statSuspendedUsers: 'স্থগিত অ্যাকাউন্ট',
    searchUsersPlaceholder: 'নাম বা ইমেইল দিয়ে খুঁজুন...',
    filterByRole: 'রোল ফিল্টার',
    filterByStatus: 'স্ট্যাটাস ফিল্টার',
    allRoles: 'সকল রোল',
    allStatuses: 'সকল স্ট্যাটাস',
    activeStatus: 'সক্রিয়',
    suspendedStatus: 'স্থগিত',
    colUser: 'ব্যবহারকারী',
    colRole: 'রোল',
    colStatus: 'স্ট্যাটাস',
    colFormsCreated: 'তৈরি ফর্ম',
    colJoinedDate: 'যোগদান',
    colActions: 'অ্যাকশন',
    makeAdminAction: 'অ্যাডমিন করুন',
    makeEditorAction: 'এডিটর করুন',
    suspendAction: 'স্থগিত করুন',
    activateAction: 'সক্রিয় করুন',
    deleteUserAction: 'মুছে ফেলুন',
    deleteUserConfirm: 'আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে মুছে ফেলতে চান? তার সমস্ত ফর্ম ও উত্তর স্থায়ীভাবে ডিলিট হয়ে যাবে!',
    addNewUserBtn: 'নতুন ব্যবহারকারী',
    searchFormsPlaceholder: 'শিরোনাম বা ক্রিয়েটর দিয়ে খুঁজুন...',
    colFormTitle: 'ফর্মের নাম',
    colCreator: 'তৈরি করেছেন',
    colFields: 'ফিল্ড',
    colSubmissions: 'প্রাপ্ত উত্তর',
    colCreatedAt: 'তৈরির তারিখ',
    colManage: 'ব্যবস্থাপনা',
    openFormAction: 'ফর্ম ওপেন',
    editFormAction: 'এডিট করুন',
    viewResponsesAction: 'রেসপন্স',
    deleteFormAction: 'ডিলিট করুন',
    deleteFormAdminConfirm: 'অ্যাডমিন হিসেবে আপনি কি নিশ্চিতভাবে এই ফর্মটি সম্পূর্ণ মুছে ফেলতে চান?',
    accessDeniedTitle: 'প্রবেশাধিকার সংরক্ষিত',
    accessDeniedDesc: 'এই অংশটি শুধুমাত্র অ্যাডমিনদের জন্য। প্রবেশ করতে নেভবার থেকে আপনার রোল অ্যাডমিনে পরিবর্তন করুন।',
    returnHomeBtn: 'হোমে ফিরে যান',
  },
};

/**
 * ডেটাবেজে সংরক্ষিত ডিফল্ট ফর্মের শিরোনাম, বিবরণ ও ফিল্ড টেক্সট বর্তমান ভাষা অনুযায়ী কনভার্ট করার হেল্পার
 */
export function localizeFormText(text: string | undefined, lang: Language): string {
  if (!text) return '';
  const trimmed = text.trim();

  const map: Record<string, { en: string; bn: string }> = {
    'নতুন ফর্ম (Untitled Form)': { en: 'Untitled Form', bn: 'নতুন ফর্ম' },
    'নতুন ফর্ম': { en: 'Untitled Form', bn: 'নতুন ফর্ম' },
    'শিরোনামহীন নতুন ফর্ম': { en: 'New Untitled Form', bn: 'শিরোনামহীন নতুন ফর্ম' },
    'শিরোনামহীন ফর্ম': { en: 'Untitled Form', bn: 'শিরোনামহীন ফর্ম' },
    'নতুন আকর্ষণীয় ফর্ম': { en: 'New Interactive Form', bn: 'নতুন আকর্ষণীয় ফর্ম' },
    'New Interactive Form': { en: 'New Interactive Form', bn: 'নতুন আকর্ষণীয় ফর্ম' },
    'Untitled Form': { en: 'Untitled Form', bn: 'শিরোনামহীন ফর্ম' },
    'এই ফর্মটিতে আপনার মতামত ও তথ্য প্রদান করুন।': {
      en: 'Please provide your valuable feedback and information through this form.',
      bn: 'এই ফর্মটিতে আপনার মতামত ও তথ্য প্রদান করুন।',
    },
    'এই ফর্মটির মাধ্যমে আপনার মতামত বা প্রয়োজনীয় তথ্য জমা দিন।': {
      en: 'Please submit your feedback or necessary information through this form.',
      bn: 'এই ফর্মটির মাধ্যমে আপনার মতামত বা প্রয়োজনীয় তথ্য জমা দিন।',
    },
    'Please provide your valuable feedback and information through this form.': {
      en: 'Please provide your valuable feedback and information through this form.',
      bn: 'এই ফর্মটিতে আপনার মতামত ও তথ্য প্রদান করুন।',
    },
    'আপনার পূর্ণ নাম': { en: 'Full Name', bn: 'আপনার পূর্ণ নাম' },
    'Full Name': { en: 'Full Name', bn: 'আপনার পূর্ণ নাম' },
    'আপনার ইমেইল ঠিকানা': { en: 'Email Address', bn: 'আপনার ইমেইল ঠিকানা' },
    'Email Address': { en: 'Email Address', bn: 'আপনার ইমেইল ঠিকানা' },
    'এখানে আপনার নাম লিখুন...': { en: 'Enter your name...', bn: 'এখানে আপনার নাম লিখুন...' },
    'Enter your name...': { en: 'Enter your name...', bn: 'এখানে আপনার নাম লিখুন...' },
    'বিকল্প ১': { en: 'Option 1', bn: 'বিকল্প ১' },
    'বিকল্প ২': { en: 'Option 2', bn: 'বিকল্প ২' },
    'বিকল্প ৩': { en: 'Option 3', bn: 'বিকল্প ৩' },
    'বিকল্প ৪': { en: 'Option 4', bn: 'বিকল্প ৪' },
    'অপশন ১': { en: 'Option 1', bn: 'অপশন ১' },
    'অপশন ২': { en: 'Option 2', bn: 'অপশন ২' },
    'অপশন ৩': { en: 'Option 3', bn: 'অপশন ৩' },
    'অপশন ৪': { en: 'Option 4', bn: 'অপশন ৪' },
    'Option 1': { en: 'Option 1', bn: 'বিকল্প ১' },
    'Option 2': { en: 'Option 2', bn: 'বিকল্প ২' },
    'Option 3': { en: 'Option 3', bn: 'বিকল্প ৩' },
    'Option 4': { en: 'Option 4', bn: 'বিকল্প ৪' },
    'জমা দিন': { en: 'Submit', bn: 'জমা দিন' },
    'জমা দিন (Submit)': { en: 'Submit', bn: 'জমা দিন' },
    'Submit': { en: 'Submit', bn: 'জমা দিন' },
  };

  const found = map[trimmed];
  if (found) {
    return found[lang];
  }

  // নতুন প্রশ্ন (type) প্যাটার্ন
  const questionPattern = /^নতুন প্রশ্ন \((.+)\)$/;
  const match = trimmed.match(questionPattern);
  if (match && lang === 'en') {
    return `New Question (${match[1]})`;
  }
  const enQuestionPattern = /^New Question \((.+)\)$/;
  const enMatch = trimmed.match(enQuestionPattern);
  if (enMatch && lang === 'bn') {
    return `নতুন প্রশ্ন (${enMatch[1]})`;
  }

  return text;
}

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key as string,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('nextform_language') as Language | null;
    if (saved === 'en' || saved === 'bn') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('nextform_language', newLang);
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'bn' : 'en';
    setLang(next);
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[lang][key] || translations['en'][key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
