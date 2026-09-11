import type { Locale } from "./config";

/**
 * The admin panel's own strings.
 *
 * Kept apart from `content/` on purpose: that is marketing copy the SEO team
 * edits and the public reads, this is software chrome. Mixing them would put
 * "Move to trash" in the same file as the homepage headline.
 *
 * Arabic here is the same register as the site — Modern Standard Arabic as
 * Egyptian professionals read it — with the interface conventions people
 * already know from Arabic software: «حفظ» to save, «نشر» to publish,
 * «مسودة» for a draft.
 */

interface AdminStringsShape {
  dir: "ltr" | "rtl";
  brand: string;
  viewSite: string;
  signOut: string;
  signingOut: string;
  openMenu: string;
  closeMenu: string;
  newPost: string;
  newNews: string;
  sidebarNote: string;
  language: string;
  languageHint: string;
  switchToArabic: string;
  switchToEnglish: string;
  /** aria-label on the sidebar landmark. */
  sidebarLabel: string;
  nav: {
    dashboard: string;
    posts: string;
    news: string;
    careers: string;
    media: string;
    settings: string;
  };
  status: { published: string; draft: string };

  /** Words that recur on more than one screen. */
  common: {
    all: string;
    published: string;
    drafts: string;
    filterByStatus: string;
    untitled: string;
    edit: string;
    view: string;
    delete: string;
    remove: string;
    replace: string;
    add: string;
    cancel: string;
    save: string;
    saving: string;
    saved: string;
    done: string;
    choose: string;
    preview: string;
    settings: string;
    uncategorised: string;
    untagged: string;
    /** Joins a row's categories or tags. */
    listSeparator: string;
    tryOtherFilter: string;
    unsavedChanges: string;
    /** `{title}` */
    editNamed: string;
    /** `{title}` */
    viewNamed: string;
    /** `{title}` */
    deleteNamed: string;
  };

  dashboard: {
    title: string;
    intro: string;
    publishedBlogs: string;
    publishedNews: string;
    drafts: string;
    images: string;
    recentBlogs: string;
    recentNews: string;
    viewAll: string;
    noBlogs: string;
    writeFirst: string;
    noNews: string;
    addFirstNews: string;
  };

  posts: {
    title: string;
    intro: string;
    addNew: string;
    searchLabel: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    noMatchTitle: string;
    featured: string;
    /** `{title}` */
    confirmDelete: string;
    /** `{title}` */
    deleteFailed: string;
    untitledFallback: string;
  };


  /** Shared by the post and news editors, which are the same screen. */
  doc: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    link: string;
    clearFormatting: string;
    heading: string;
    list: string;
    quote: string;
    takeaways: string;
    image: string;
    shortcutHint: string;
    linkPrompt: string;
    quotePlaceholder: string;
    attributionPlaceholder: string;
    removeQuote: string;
    headingPlaceholder: string;
    writeArticle: string;
    takeawayPlaceholder: string;
    listItemPlaceholder: string;
    removeTakeaways: string;
    removeList: string;
    takeawaysHeading: string;
    altPlaceholder: string;
    captionPlaceholder: string;
    removeImage: string;
    compressing: string;
    uploading: string;
    fetching: string;
    uploadFailed: string;
  };

  login: {
    title: string;
    intro: string;
    password: string;
    passwordPlaceholder: string;
    signIn: string;
    signingIn: string;
    failed: string;
    /** `{env}` is rendered as code. */
    notConfigured: string;
    shareNote: string;
  };

  careers: {
    title: string;
    intro: string;
    untitledRole: string;
    noArabicYet: string;
    saveChanges: string;
    savedNotice: string;
    saveFailed: string;
    iconPanel: string;
    iconHelp: string;
    iconGroup: string;
    englishPanel: string;
    arabicPanel: string;
    fallbackNote: string;
    previewTitle: string;
    previewHelp: string;
    fieldTitle: string;
    fieldType: string;
    fieldDepartment: string;
    fieldLocation: string;
    fieldBlurb: string;
  };

  settings: {
    title: string;
    intro: string;
    blogGroup: string;
    blogHint: string;
    newsGroup: string;
    newsHint: string;
    categoriesTitle: string;
    categoriesIntro: string;
    newsTagsTitle: string;
    newsTagsIntro: string;
    newsTagsEmpty: string;
    newCategoryName: string;
    addFailed: string;
    renameFailed: string;
    deleteFailed: string;
    moveFailed: string;
    authorsTitle: string;
    authorsIntro: string;
    authorsEmpty: string;
    addAuthor: string;
    fullName: string;
    authorRole: string;
    photoUrl: string;
    chooseFromLibrary: string;
    addAuthorFailed: string;
    saveAuthorFailed: string;
    deleteAuthorFailed: string;
    /** `{name}` */
    confirmDeleteTitle: string;
    /** `{n}` — the plural form is chosen by the caller. */
    usedByPosts: string;
    usedByOnePost: string;
    usedByItems: string;
    usedByOneItem: string;
    /** `{n}` */
    orphanPosts: string;
    orphanOnePost: string;
    orphanItems: string;
    orphanOneItem: string;
    flagNoCategory: string;
    deleteAnyway: string;
    rename: string;
    /** `{name}` */
    renameNamed: string;
    /** `{name}` */
    deleteNamed: string;
    /** `{n}` */
    authorCreditedOn: string;
    authorCreditedOnOne: string;
    authorLosesBylineMany: string;
    authorLosesBylineOne: string;
    flagLosesByline: string;
  };

  picker: {
    /** `{name}` */
    removeNamed: string;
    /** `{name}` */
    primaryCategory: string;
    /** `{name}` */
    primaryTag: string;
    addAnother: string;
    searchOrCreate: string;
    noCategories: string;
    noTags: string;
    /** `{name}` */
    createNamed: string;
    createCategoryFailed: string;
    createTagFailed: string;
  };

  media: {
    title: string;
    intro: string;
    uploads: string;
    alreadyOnSite: string;
    siteNote: string;
    dragHere: string;
    chooseFiles: string;
    uploading: string;
    /** `{size}` */
    formats: string;
    loading: string;
    empty: string;
    loadFailed: string;
    /** `{name}` */
    uploadFailed: string;
    /** `{name}` */
    deleteFailed: string;
    /** `{name}` */
    confirmDelete: string;
    /** `{name}` */
    deleteNamed: string;
    library: string;
    closeLibrary: string;
    close: string;
    removeImage: string;
  };

  leaveGuard: {
    stayAria: string;
    title: string;
    body: string;
    stay: string;
    leave: string;
    saveAndLeave: string;
  };

  storage: {
    /** `{data}` and `{uploads}` are rendered as code. */
    localBody: string;
    warningTitle: string;
    /** `{token}` and `{path}` are rendered as code, `{steps}` in bold. */
    warningBody: string;
  };

  editor: {
    undo: string;
    redo: string;
    undoTitle: string;
    redoTitle: string;
    editTab: string;
    previewTab: string;
    saveDraft: string;
    publish: string;
    update: string;
    saveFailed: string;
    publishedNotice: string;
    draftSavedNotice: string;
    pickLanguageFirst: string;
    title: string;
    titlePlaceholder: string;
    permalink: string;
    slugPlaceholder: string;
    content: string;
    publishPanel: string;
    statusLabel: string;
    /** `{date}` */
    showsAs: string;
    permanentlyDelete: string;
    coverImage: string;
    setCoverImage: string;
    contentLanguage: string;
    contentLanguageHelp: string;
    pickLanguageWarning: string;
    categories: string;
    seo: string;
    metaTitle: string;
    metaDescription: string;
    /** `{n}` */
    charsUnder60: string;
    /** `{n}` */
    chars120to160: string;
  };

  postEditor: {
    previewNote: string;
    titleHelp: string;
    permalinkHelp: string;
    contentHelp: string;
    excerpt: string;
    excerptHelp: string;
    excerptPlaceholder: string;
    publishDate: string;
    featureThis: string;
    featureHelp: string;
    viewLive: string;
    confirmDelete: string;
    pickLanguageWarning: string;
    author: string;
    noByline: string;
    deletedAuthor: string;
    /** `{settings}` is replaced by a link to the Settings screen. */
    authorsManaged: string;
    metaTitleDefault: string;
    metaDescriptionDefault: string;
    readingTime: string;
    /** `{time}` */
    readingTimeHelp: string;
  };

  newsEditor: {
    previewNote: string;
    titleHelp: string;
    permalinkHelp: string;
    contentHelp: string;
    summary: string;
    summaryHelp: string;
    summaryPlaceholder: string;
    newsDate: string;
    /** `{date}` */
    showsAs: string;
    location: string;
    locationPlaceholder: string;
    locationHelp: string;
    viewLive: string;
    confirmDelete: string;
    pickLanguageWarning: string;
    metaTitleDefault: string;
    metaDescriptionDefault: string;
    /** `{settings}` is replaced by a link to the Settings screen. */
    tagsManaged: string;
  };

  news: {
    title: string;
    intro: string;
    addNew: string;
    searchLabel: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    noMatchTitle: string;
    /** `{title}` */
    confirmDelete: string;
    /** `{title}` */
    deleteFailed: string;
    untitledFallback: string;
  };
}

const en: AdminStringsShape = {
  dir: "ltr",
  brand: "TribuCare Blog",
  viewSite: "View site",
  signOut: "Sign out",
  signingOut: "Signing out…",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  newPost: "New blog",
  newNews: "Add event or news",
  sidebarNote:
    "Blogs go live on tribucare.com/blog, events & news on tribucare.com/events.",
  language: "Language",
  languageHint:
    "Changes the admin panel only. The website's own language is chosen by each visitor.",
  switchToArabic: "العربية",
  switchToEnglish: "English",
  sidebarLabel: "Admin",

  nav: {
    dashboard: "Dashboard",
    posts: "Blogs",
    news: "Events & News",
    careers: "Careers",
    media: "Media",
    settings: "Settings",
  },

  status: { published: "Published", draft: "Draft" },

  common: {
    all: "All",
    published: "Published",
    drafts: "Drafts",
    filterByStatus: "Filter by status",
    untitled: "(untitled)",
    edit: "Edit",
    view: "View",
    delete: "Delete",
    remove: "Remove",
    replace: "Replace",
    add: "Add",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    done: "Done",
    choose: "Choose",
    preview: "Preview",
    settings: "Settings",
    uncategorised: "Uncategorised",
    untagged: "Untagged",
    listSeparator: ", ",
    tryOtherFilter: "Try a different status or search term.",
    unsavedChanges: "Unsaved changes",
    editNamed: "Edit {title}",
    viewNamed: "View {title}",
    deleteNamed: "Delete {title}",
  },

  dashboard: {
    title: "Dashboard",
    intro:
      "Blogs appear on the TribuCare blog; news appears on the news page.",
    publishedBlogs: "Published blogs",
    publishedNews: "Published news",
    drafts: "Drafts",
    images: "Images",
    recentBlogs: "Recent blogs",
    recentNews: "Recent news",
    viewAll: "View all",
    noBlogs: "No blogs yet.",
    writeFirst: "Write the first one",
    noNews: "No news yet.",
    addFirstNews: "Add the first one",
  },

  posts: {
    title: "Posts",
    intro: "Create, edit and publish TribuCare articles.",
    addNew: "Add new post",
    searchLabel: "Search posts",
    searchPlaceholder: "Search posts…",
    emptyTitle: "No posts yet",
    emptyBody: "Write your first article to get started.",
    noMatchTitle: "No posts match this filter",
    featured: "Featured",
    confirmDelete:
      "Delete “{title}”? This removes it from the website immediately and cannot be undone.",
    deleteFailed: "Could not delete “{title}”. Try again.",
    untitledFallback: "this untitled post",
  },

  doc: {
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    link: "Link",
    clearFormatting: "Clear formatting",
    heading: "Heading",
    list: "List",
    quote: "Quote",
    takeaways: "Key takeaways",
    image: "Image",
    shortcutHint: "## heading · - list · 1. numbered · > quote",
    linkPrompt: "Link to… (leave empty to remove the link)",
    quotePlaceholder: "The quote itself, without quotation marks…",
    attributionPlaceholder:
      "Attribution (defaults to “TribuCare Clinical Editorial”)",
    removeQuote: "Remove quote",
    headingPlaceholder: "Section heading",
    writeArticle: "Write the article…",
    takeawayPlaceholder: "A single takeaway",
    listItemPlaceholder: "List item",
    removeTakeaways: "Remove key takeaways",
    removeList: "Remove list",
    takeawaysHeading: "Key takeaways",
    altPlaceholder:
      "Alt text — describe the image for screen readers and search",
    captionPlaceholder: "Caption (optional)",
    removeImage: "Remove image",
    compressing: "Compressing…",
    uploading: "Uploading…",
    fetching: "Fetching…",
    uploadFailed: "Could not upload the image.",
  },

  login: {
    title: "Blog admin",
    intro: "Enter the team password to manage TribuCare articles.",
    password: "Password",
    passwordPlaceholder: "••••••••••",
    signIn: "Sign in",
    signingIn: "Signing in…",
    failed: "Could not sign in. Check your connection.",
    notConfigured:
      "No admin password has been set yet. Add an {env} environment variable in Vercel and redeploy, then sign in here.",
    shareNote:
      "Share this link with your SEO team — they sign in with the same password.",
  },

  careers: {
    title: "Careers",
    intro:
      "The role cards in the careers section of the homepage. Each card is edited in English and Arabic together.",
    untitledRole: "Untitled role",
    noArabicYet: "لم تُضَف الترجمة العربية بعد",
    saveChanges: "Save changes",
    savedNotice: "Saved — the homepage is updated.",
    saveFailed: "Could not save. Check your connection.",
    iconPanel: "Icon",
    iconHelp:
      "Pick the icon that fits the role. It sits in the disc at the top of the card, and is the same in both languages.",
    iconGroup: "Role icon",
    englishPanel: "English",
    arabicPanel: "العربية — Arabic",
    fallbackNote:
      "Leave a field empty and the Arabic site shows the English text for it, so a partly translated role still renders a complete card.",
    previewTitle: "Preview",
    previewHelp: "The real card, exactly as the homepage draws it.",
    fieldTitle: "Title",
    fieldType: "Employment type",
    fieldDepartment: "Department",
    fieldLocation: "Location",
    fieldBlurb: "Short description",
  },

  settings: {
    title: "Settings",
    intro:
      "The lists each section draws from, grouped by the section they belong to. The two category lists are entirely separate — adding one to Events & News never adds it to the blog, and the reverse. Authors belong to the blog: an Events & News item carries no byline.",
    blogGroup: "Blog",
    blogHint: "Lists behind tribucare.org/blog.",
    newsGroup: "Events & News",
    newsHint: "Lists behind tribucare.org/events.",
    categoriesTitle: "Blog categories",
    categoriesIntro:
      "These are the filter tabs on the blog. Renaming one updates every post that uses it.",
    newsTagsTitle: "Events & News categories",
    newsTagsIntro:
      "The filter tabs on the Events & News page. Renaming one updates every item that uses it.",
    newsTagsEmpty:
      "No news tags yet. Add one below, or create tags as you write from the editor.",
    newCategoryName: "New category name",
    addFailed: "Could not add that category.",
    renameFailed: "Could not rename that category.",
    deleteFailed: "Could not delete that category.",
    moveFailed: "Could not move that category.",
    authorsTitle: "Authors",
    authorsIntro:
      "Bylines are managed here, not on each post. Correcting a name or photo updates every post that author wrote.",
    authorsEmpty: "No authors yet.",
    addAuthor: "Add author",
    fullName: "Full name",
    authorRole: "Role, e.g. Medical Advisory Lead",
    photoUrl: "Photo URL (optional)",
    chooseFromLibrary: "Choose from the media library",
    addAuthorFailed: "Could not add that author.",
    saveAuthorFailed: "Could not save that author.",
    deleteAuthorFailed: "Could not delete that author.",
    confirmDeleteTitle: "Delete “{name}”?",
    usedByPosts:
      "It is used by {n} posts. Deleting removes it from them — the posts themselves are not deleted.",
    usedByOnePost:
      "It is used by 1 post. Deleting removes it from that post — the post itself is not deleted.",
    usedByItems:
      "It is used by {n} news items. Deleting removes it from them — the items themselves are not deleted.",
    usedByOneItem:
      "It is used by 1 news item. Deleting removes it from that item — the item itself is not deleted.",
    orphanPosts:
      "{n} posts will be left with no category at all — marked below. They still appear under “All Articles”, but under no filter tab.",
    orphanOnePost:
      "1 post will be left with no category at all — marked below. It still appears under “All Articles”, but under no filter tab.",
    orphanItems:
      "{n} items will be left with no category at all — marked below. They still appear under “All News”, but under no filter tab.",
    orphanOneItem:
      "1 item will be left with no category at all — marked below. It still appears under “All News”, but under no filter tab.",
    flagNoCategory: "will have no category",
    deleteAnyway: "Delete anyway",
    rename: "Rename",
    renameNamed: "Rename {name}",
    deleteNamed: "Delete {name}",
    authorCreditedOn:
      "They are credited on {n} posts. The posts are not deleted.",
    authorCreditedOnOne:
      "They are credited on 1 post. The post is not deleted.",
    authorLosesBylineMany:
      "These posts will be left with no byline — the author name, role and photo stop showing on the article and its cards. Assign a new author afterwards to restore them.",
    authorLosesBylineOne:
      "This post will be left with no byline — the author name, role and photo stop showing on the article and its cards. Assign a new author afterwards to restore them.",
    flagLosesByline: "loses its byline",
  },

  picker: {
    removeNamed: "Remove {name}",
    primaryCategory:
      "{name} is the primary category — it is the one shown on the article card. Remove and re-add to change the order.",
    primaryTag:
      "{name} is the primary tag — it is the one shown on the news card. Remove and re-add to change the order.",
    addAnother: "Add another category…",
    searchOrCreate: "Search or create…",
    noCategories: "No categories yet.",
    noTags: "No tags yet.",
    createNamed: "Create “{name}”",
    createCategoryFailed: "Could not create that category.",
    createTagFailed: "Could not create that tag.",
  },

  media: {
    title: "Media",
    intro: "Images available to every post. Upload here, or from inside the editor.",
    uploads: "Uploads",
    alreadyOnSite: "Already on the site",
    siteNote:
      "Artwork the current articles already use. Pick it for a new post; it ships with the site, so it cannot be deleted here.",
    dragHere: "Drag images here, or",
    chooseFiles: "Choose files",
    uploading: "Uploading…",
    formats: "JPG, PNG, WebP, AVIF or GIF · up to {size} each",
    loading: "Loading…",
    empty: "No images yet. Upload one above.",
    loadFailed: "Could not load the media library.",
    uploadFailed: "Could not upload {name}.",
    deleteFailed: "Could not delete {name}.",
    confirmDelete:
      "Delete {name}? Any post still using it will show a broken image.",
    deleteNamed: "Delete {name}",
    library: "Media library",
    closeLibrary: "Close media library",
    close: "Close",
    removeImage: "Remove image",
  },

  leaveGuard: {
    stayAria: "Stay on this page",
    title: "Unsaved changes",
    body: "You have changes that have not been saved. Save them before you go, or leave and lose them.",
    stay: "Stay",
    leave: "Leave without saving",
    saveAndLeave: "Save and leave",
  },

  storage: {
    localBody:
      "Running locally — posts are saved to {data} and images to {uploads}. Nothing extra to set up.",
    warningTitle: "Connect a Blob store before writing.",
    warningBody:
      "This deployment has no {token}, so anything saved here will be lost on the next deploy. In your Vercel project open {steps}, connect it to this project, then redeploy.",
  },

  editor: {
    undo: "Undo",
    redo: "Redo",
    undoTitle: "Undo (⌘Z / Ctrl+Z)",
    redoTitle: "Redo (⇧⌘Z / Ctrl+Y)",
    editTab: "Edit",
    previewTab: "Preview",
    saveDraft: "Save draft",
    publish: "Publish",
    update: "Update",
    saveFailed: "Could not save. Check your connection.",
    publishedNotice: "Published — it is live now.",
    draftSavedNotice: "Draft saved.",
    pickLanguageFirst: "Pick a language under Content language first.",
    title: "Title",
    titlePlaceholder: "Add title",
    permalink: "Permalink",
    slugPlaceholder: "url-slug",
    content: "Content",
    publishPanel: "Publish",
    statusLabel: "Status",
    showsAs: "Shows as {date}",
    permanentlyDelete: "Permanently delete",
    coverImage: "Cover image",
    setCoverImage: "Set cover image",
    contentLanguage: "Content language",
    contentLanguageHelp:
      "Which language site this appears on. Choosing a language does not translate it — it decides where it is listed.",
    pickLanguageWarning: "Pick a language.",
    categories: "Categories",
    seo: "SEO",
    metaTitle: "Meta title",
    metaDescription: "Meta description",
    charsUnder60: "{n} characters · aim for under 60",
    chars120to160: "{n} characters · aim for 120–160",
  },

  postEditor: {
    previewNote: "Preview — exactly how this article will render on the site.",
    titleHelp:
      "The article headline — shown on the card, the /blogs index and the browser tab.",
    permalinkHelp:
      "The article’s web address. Follows the title until you edit it here.",
    contentHelp:
      "Write the article straight through. Enter starts a new paragraph, and you can paste an image in where you want it.",
    excerpt: "Excerpt",
    excerptHelp:
      "Shown on the article card, the /blogs index, and as the search and social description.",
    excerptPlaceholder: "A two-line summary of the article…",
    publishDate: "Publish date",
    featureThis: "Feature this post",
    featureHelp:
      "Pins it to the top of /blog. Only one post can be featured — this replaces any current one.",
    viewLive: "View live post",
    confirmDelete:
      "Delete this post? It disappears from the website immediately and cannot be undone.",
    pickLanguageWarning:
      "Pick a language — the post cannot be saved while it would appear nowhere.",
    author: "Author",
    noByline: "No byline",
    deletedAuthor: "(deleted author — pick a replacement)",
    authorsManaged:
      "Authors are managed once in {settings}, so correcting a name or photo updates every post they wrote.",
    metaTitleDefault: "Defaults to the post title",
    metaDescriptionDefault: "Defaults to the excerpt",
    readingTime: "Reading time",
    readingTimeHelp: "Left blank it is calculated from the content — {time}.",
  },

  newsEditor: {
    previewNote:
      "Preview — exactly how this news item will render on the site.",
    titleHelp:
      "The announcement headline — shown on the card, the /news index and the browser tab.",
    permalinkHelp:
      "The item’s web address. Follows the title until you edit it here.",
    contentHelp:
      "Write the item straight through. Enter starts a new paragraph, and you can paste an image in where you want it.",
    summary: "Summary",
    summaryHelp:
      "Shown on the news card, the /news index, and as the search and social description.",
    summaryPlaceholder: "A two-line summary of the news…",
    newsDate: "News date",
    showsAs: "Shows as {date}. This is what the news page sorts on.",
    location: "Location",
    locationPlaceholder: "Cairo, Egypt",
    locationHelp:
      "Shown on the card beside the date. Leave empty for an announcement that has no venue.",
    viewLive: "View live item",
    confirmDelete:
      "Delete this item? It disappears from the website immediately and cannot be undone.",
    pickLanguageWarning:
      "Pick a language — the item cannot be saved while it would appear nowhere.",
    metaTitleDefault: "Defaults to the news title",
    metaDescriptionDefault: "Defaults to the summary",
    tagsManaged:
      "News categories are their own list, managed in {settings}. They are separate from the blog’s categories and only affect the news page.",
  },

  news: {
    title: "Events & News",
    intro:
      "Congresses, training days, launches and company updates — one list. An event and a news item are the same thing here; they all appear on the Events & News page.",
    addNew: "Add event or news",
    searchLabel: "Search news",
    searchPlaceholder: "Search events & news…",
    emptyTitle: "Nothing here yet",
    emptyBody: "Add your first event or announcement to get started.",
    noMatchTitle: "Nothing matches this filter",
    confirmDelete:
      "Delete “{title}”? This removes it from the website immediately and cannot be undone.",
    deleteFailed: "Could not delete “{title}”. Try again.",
    untitledFallback: "this untitled news item",
  },
};

const ar: AdminStringsShape = {
  dir: "rtl",
  brand: "مدونة تريبوكير",
  viewSite: "عرض الموقع",
  signOut: "تسجيل الخروج",
  signingOut: "جارٍ تسجيل الخروج…",
  openMenu: "فتح القائمة",
  closeMenu: "إغلاق القائمة",
  newPost: "مقال جديد",
  newNews: "إضافة فعالية أو خبر",
  sidebarNote:
    "المقالات تظهر على tribucare.com/blog، والفعاليات والأخبار على tribucare.com/events.",
  language: "اللغة",
  languageHint:
    "يغيّر لوحة التحكم فقط. لغة الموقع نفسه يختارها كل زائر على حدة.",
  switchToArabic: "العربية",
  switchToEnglish: "English",
  sidebarLabel: "لوحة التحكم",

  nav: {
    dashboard: "لوحة المعلومات",
    posts: "المقالات",
    news: "الفعاليات والأخبار",
    careers: "الوظائف",
    media: "الوسائط",
    settings: "الإعدادات",
  },

  status: { published: "منشور", draft: "مسودة" },

  common: {
    all: "الكل",
    published: "المنشور",
    drafts: "المسودات",
    filterByStatus: "تصفية حسب الحالة",
    untitled: "(بلا عنوان)",
    edit: "تحرير",
    view: "عرض",
    delete: "حذف",
    remove: "إزالة",
    replace: "استبدال",
    add: "إضافة",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    saved: "تم الحفظ",
    done: "تم",
    choose: "اختيار",
    preview: "معاينة",
    settings: "الإعدادات",
    uncategorised: "بلا تصنيف",
    untagged: "بلا وسم",
    listSeparator: "، ",
    tryOtherFilter: "جرّب حالة أخرى أو كلمة بحث مختلفة.",
    unsavedChanges: "تغييرات غير محفوظة",
    editNamed: "تحرير {title}",
    viewNamed: "عرض {title}",
    deleteNamed: "حذف {title}",
  },

  dashboard: {
    title: "لوحة المعلومات",
    intro:
      "المقالات تظهر في مدونة تريبوكير، والأخبار تظهر في صفحة الأخبار.",
    publishedBlogs: "مقالات منشورة",
    publishedNews: "أخبار منشورة",
    drafts: "مسودات",
    images: "صور",
    recentBlogs: "أحدث المقالات",
    recentNews: "أحدث الأخبار",
    viewAll: "عرض الكل",
    noBlogs: "لا توجد مقالات بعد.",
    writeFirst: "اكتب أول مقال",
    noNews: "لا توجد أخبار بعد.",
    addFirstNews: "أضف أول خبر",
  },

  posts: {
    title: "المقالات",
    intro: "أنشئ مقالات تريبوكير وحرّرها وانشرها.",
    addNew: "إضافة مقال جديد",
    searchLabel: "البحث في المقالات",
    searchPlaceholder: "ابحث في المقالات…",
    emptyTitle: "لا توجد مقالات بعد",
    emptyBody: "اكتب أول مقال للبدء.",
    noMatchTitle: "لا توجد مقالات مطابقة لهذه التصفية",
    featured: "مميّز",
    confirmDelete:
      "هل تريد حذف «{title}»؟ سيختفي من الموقع فورًا ولا يمكن التراجع عن ذلك.",
    deleteFailed: "تعذّر حذف «{title}». حاول مرة أخرى.",
    untitledFallback: "هذا المقال بلا عنوان",
  },

  doc: {
    bold: "عريض",
    italic: "مائل",
    underline: "تحته خط",
    strikethrough: "يتوسطه خط",
    link: "رابط",
    clearFormatting: "إزالة التنسيق",
    heading: "عنوان فرعي",
    list: "قائمة",
    quote: "اقتباس",
    takeaways: "أبرز النقاط",
    image: "صورة",
    shortcutHint: "## عنوان · - قائمة · 1. مرقّمة · > اقتباس",
    linkPrompt: "الرابط… (اتركه فارغًا لإزالة الرابط)",
    quotePlaceholder: "نص الاقتباس نفسه، دون علامات تنصيص…",
    attributionPlaceholder: "المصدر (الافتراضي «TribuCare Clinical Editorial»)",
    removeQuote: "إزالة الاقتباس",
    headingPlaceholder: "عنوان القسم",
    writeArticle: "اكتب المقال…",
    takeawayPlaceholder: "نقطة واحدة",
    listItemPlaceholder: "عنصر في القائمة",
    removeTakeaways: "إزالة أبرز النقاط",
    removeList: "إزالة القائمة",
    takeawaysHeading: "أبرز النقاط",
    altPlaceholder: "النص البديل — صِف الصورة لقارئات الشاشة ومحركات البحث",
    captionPlaceholder: "تعليق الصورة (اختياري)",
    removeImage: "إزالة الصورة",
    compressing: "جارٍ الضغط…",
    uploading: "جارٍ الرفع…",
    fetching: "جارٍ الجلب…",
    uploadFailed: "تعذّر رفع الصورة.",
  },

  login: {
    title: "لوحة تحكم المدونة",
    intro: "أدخل كلمة مرور الفريق لإدارة مقالات تريبوكير.",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••••",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول…",
    failed: "تعذّر تسجيل الدخول. تحقّق من اتصالك.",
    notConfigured:
      "لم تُضبط كلمة مرور للوحة التحكم بعد. أضف متغيّر البيئة {env} في Vercel وأعد النشر، ثم سجّل الدخول من هنا.",
    shareNote:
      "شارك هذا الرابط مع فريق تحسين محركات البحث — يسجّلون الدخول بكلمة المرور نفسها.",
  },

  careers: {
    title: "الوظائف",
    intro:
      "بطاقات الوظائف في قسم الوظائف بالصفحة الرئيسية. تُحرَّر كل بطاقة بالعربية والإنجليزية معًا.",
    untitledRole: "وظيفة بلا عنوان",
    noArabicYet: "لم تُضَف الترجمة العربية بعد",
    saveChanges: "حفظ التغييرات",
    savedNotice: "تم الحفظ — وحُدّثت الصفحة الرئيسية.",
    saveFailed: "تعذّر الحفظ. تحقّق من اتصالك.",
    iconPanel: "الأيقونة",
    iconHelp:
      "اختر الأيقونة المناسبة للوظيفة. تظهر داخل الدائرة أعلى البطاقة، وهي نفسها في اللغتين.",
    iconGroup: "أيقونة الوظيفة",
    englishPanel: "English — الإنجليزية",
    arabicPanel: "العربية",
    fallbackNote:
      "إذا تركت حقلًا فارغًا يعرض الموقع العربي نصّه الإنجليزي، فتظل البطاقة مكتملة حتى لو تُرجمت جزئيًا.",
    previewTitle: "معاينة",
    previewHelp: "البطاقة الحقيقية، تمامًا كما ترسمها الصفحة الرئيسية.",
    fieldTitle: "المسمّى الوظيفي",
    fieldType: "نوع التوظيف",
    fieldDepartment: "القسم",
    fieldLocation: "المكان",
    fieldBlurb: "وصف مختصر",
  },

  settings: {
    title: "الإعدادات",
    intro:
      "القوائم التي يعتمد عليها كل قسم، مرتّبة بحسب القسم الذي تخصّه. قائمتا التصنيفات منفصلتان تمامًا — فإضافة تصنيف إلى الفعاليات والأخبار لا تضيفه إلى المدونة، والعكس. أما الكتّاب فيخصّون المدونة وحدها: خبر الفعاليات لا يحمل اسم كاتب.",
    blogGroup: "المدونة",
    blogHint: "القوائم التي تقف خلف tribucare.org/blog.",
    newsGroup: "الفعاليات والأخبار",
    newsHint: "القوائم التي تقف خلف tribucare.org/events.",
    categoriesTitle: "تصنيفات المدونة",
    categoriesIntro:
      "هذه هي تبويبات التصفية في المدونة. تغيير اسم أي منها يحدّث كل مقال يستخدمه.",
    newsTagsTitle: "تصنيفات الفعاليات والأخبار",
    newsTagsIntro:
      "تبويبات التصفية في صفحة الفعاليات والأخبار. تغيير اسم أي منها يحدّث كل عنصر يستخدمه.",
    newsTagsEmpty:
      "لا توجد وسوم أخبار بعد. أضف واحدًا من الأسفل، أو أنشئ الوسوم أثناء الكتابة من المحرّر.",
    newCategoryName: "اسم التصنيف الجديد",
    addFailed: "تعذّرت إضافة هذا التصنيف.",
    renameFailed: "تعذّر تغيير اسم هذا التصنيف.",
    deleteFailed: "تعذّر حذف هذا التصنيف.",
    moveFailed: "تعذّر نقل هذا التصنيف.",
    authorsTitle: "الكتّاب",
    authorsIntro:
      "تُدار أسماء الكتّاب من هنا، لا من كل مقال على حدة. تصحيح الاسم أو الصورة يحدّث كل مقال كتبه صاحبه.",
    authorsEmpty: "لا يوجد كتّاب بعد.",
    addAuthor: "إضافة كاتب",
    fullName: "الاسم الكامل",
    authorRole: "المسمّى الوظيفي، مثل: مسؤول الاستشارات الطبية",
    photoUrl: "رابط الصورة (اختياري)",
    chooseFromLibrary: "اختر من مكتبة الوسائط",
    addAuthorFailed: "تعذّرت إضافة هذا الكاتب.",
    saveAuthorFailed: "تعذّر حفظ بيانات هذا الكاتب.",
    deleteAuthorFailed: "تعذّر حذف هذا الكاتب.",
    confirmDeleteTitle: "هل تريد حذف «{name}»؟",
    usedByPosts:
      "يستخدمه {n} من المقالات. الحذف يزيله منها — أما المقالات نفسها فلا تُحذف.",
    usedByOnePost:
      "يستخدمه مقال واحد. الحذف يزيله من ذلك المقال — أما المقال نفسه فلا يُحذف.",
    usedByItems:
      "يستخدمه {n} من الأخبار. الحذف يزيله منها — أما الأخبار نفسها فلا تُحذف.",
    usedByOneItem:
      "يستخدمه خبر واحد. الحذف يزيله من ذلك الخبر — أما الخبر نفسه فلا يُحذف.",
    orphanPosts:
      "سيبقى {n} من المقالات بلا أي تصنيف — وهي المؤشَّر عليها أدناه. ستظل تظهر ضمن «كل المقالات»، لكن دون أي تبويب تصفية.",
    orphanOnePost:
      "سيبقى مقال واحد بلا أي تصنيف — وهو المؤشَّر عليه أدناه. سيظل يظهر ضمن «كل المقالات»، لكن دون أي تبويب تصفية.",
    orphanItems:
      "سيبقى {n} من الأخبار بلا أي تصنيف — وهي المؤشَّر عليها أدناه. ستظل تظهر ضمن «كل الأخبار»، لكن دون أي تبويب تصفية.",
    orphanOneItem:
      "سيبقى خبر واحد بلا أي تصنيف — وهو المؤشَّر عليه أدناه. سيظل يظهر ضمن «كل الأخبار»، لكن دون أي تبويب تصفية.",
    flagNoCategory: "سيصبح بلا تصنيف",
    deleteAnyway: "الحذف على أي حال",
    rename: "إعادة تسمية",
    renameNamed: "إعادة تسمية {name}",
    deleteNamed: "حذف {name}",
    authorCreditedOn: "منسوب إليه {n} من المقالات. والمقالات نفسها لا تُحذف.",
    authorCreditedOnOne: "منسوب إليه مقال واحد. والمقال نفسه لا يُحذف.",
    authorLosesBylineMany:
      "ستبقى هذه المقالات بلا اسم كاتب — فلن يظهر اسم الكاتب ولا مسمّاه ولا صورته على المقال ولا على بطاقاته. عيّن كاتبًا جديدًا لاحقًا لاستعادتها.",
    authorLosesBylineOne:
      "سيبقى هذا المقال بلا اسم كاتب — فلن يظهر اسم الكاتب ولا مسمّاه ولا صورته على المقال ولا على بطاقاته. عيّن كاتبًا جديدًا لاحقًا لاستعادتها.",
    flagLosesByline: "يفقد اسم كاتبه",
  },

  picker: {
    removeNamed: "إزالة {name}",
    primaryTag:
      "{name} هو الوسم الأساسي — وهو الذي يظهر على بطاقة الخبر. أزِله وأعِد إضافته لتغيير الترتيب.",
    primaryCategory:
      "{name} هو التصنيف الأساسي — وهو الذي يظهر على بطاقة المقال. أزِله وأعِد إضافته لتغيير الترتيب.",
    addAnother: "أضف تصنيفًا آخر…",
    searchOrCreate: "ابحث أو أنشئ…",
    noCategories: "لا توجد تصنيفات بعد.",
    noTags: "لا توجد وسوم بعد.",
    createNamed: "إنشاء «{name}»",
    createCategoryFailed: "تعذّر إنشاء هذا التصنيف.",
    createTagFailed: "تعذّر إنشاء هذا الوسم.",
  },

  media: {
    title: "الوسائط",
    intro: "الصور المتاحة لكل المقالات. ارفعها من هنا أو من داخل المحرّر.",
    uploads: "المرفوعات",
    alreadyOnSite: "موجودة على الموقع",
    siteNote:
      "الصور التي تستخدمها المقالات الحالية. يمكنك اختيارها لمقال جديد؛ وهي تُشحن مع الموقع فلا يمكن حذفها من هنا.",
    dragHere: "اسحب الصور إلى هنا، أو",
    chooseFiles: "اختر ملفات",
    uploading: "جارٍ الرفع…",
    formats: "JPG أو PNG أو WebP أو AVIF أو GIF · بحد أقصى {size} للملف",
    loading: "جارٍ التحميل…",
    empty: "لا توجد صور بعد. ارفع صورة من الأعلى.",
    loadFailed: "تعذّر تحميل مكتبة الوسائط.",
    uploadFailed: "تعذّر رفع {name}.",
    deleteFailed: "تعذّر حذف {name}.",
    confirmDelete:
      "هل تريد حذف {name}؟ أي مقال ما زال يستخدمها ستظهر فيه صورة معطوبة.",
    deleteNamed: "حذف {name}",
    library: "مكتبة الوسائط",
    closeLibrary: "إغلاق مكتبة الوسائط",
    close: "إغلاق",
    removeImage: "إزالة الصورة",
  },

  leaveGuard: {
    stayAria: "البقاء في هذه الصفحة",
    title: "تغييرات غير محفوظة",
    body: "لديك تغييرات لم تُحفظ بعد. احفظها قبل المغادرة، أو غادر وستفقدها.",
    stay: "البقاء",
    leave: "المغادرة دون حفظ",
    saveAndLeave: "الحفظ ثم المغادرة",
  },

  storage: {
    localBody:
      "تعمل محليًا — تُحفظ المقالات في {data} والصور في {uploads}. لا حاجة لأي إعداد إضافي.",
    warningTitle: "اربط مساحة تخزين Blob قبل الكتابة.",
    warningBody:
      "لا يحتوي هذا النشر على {token}، لذا سيُفقد كل ما يُحفظ هنا عند النشر التالي. من مشروعك على Vercel افتح {steps}، واربطه بهذا المشروع، ثم أعد النشر.",
  },

  editor: {
    undo: "تراجع",
    redo: "إعادة",
    undoTitle: "تراجع (⌘Z / Ctrl+Z)",
    redoTitle: "إعادة (⇧⌘Z / Ctrl+Y)",
    editTab: "تحرير",
    previewTab: "معاينة",
    saveDraft: "حفظ كمسودة",
    publish: "نشر",
    update: "تحديث",
    saveFailed: "تعذّر الحفظ. تحقّق من اتصالك.",
    publishedNotice: "تم النشر — أصبح متاحًا الآن.",
    draftSavedNotice: "تم حفظ المسودة.",
    pickLanguageFirst: "اختر لغة من «لغة المحتوى» أولًا.",
    title: "العنوان",
    titlePlaceholder: "أضف عنوانًا",
    permalink: "الرابط الدائم",
    slugPlaceholder: "url-slug",
    content: "المحتوى",
    publishPanel: "النشر",
    statusLabel: "الحالة",
    showsAs: "يظهر بصيغة {date}",
    permanentlyDelete: "حذف نهائي",
    coverImage: "صورة الغلاف",
    setCoverImage: "تعيين صورة الغلاف",
    contentLanguage: "لغة المحتوى",
    contentLanguageHelp:
      "الموقع الذي سيظهر عليه هذا المحتوى بحسب لغته. اختيار اللغة لا يترجم المحتوى، بل يحدّد مكان إدراجه.",
    pickLanguageWarning: "اختر لغة.",
    categories: "التصنيفات",
    seo: "تحسين محركات البحث",
    metaTitle: "عنوان الميتا",
    metaDescription: "وصف الميتا",
    charsUnder60: "{n} حرفًا · يُفضّل أقل من 60",
    chars120to160: "{n} حرفًا · يُفضّل بين 120 و160",
  },

  postEditor: {
    previewNote: "معاينة — هكذا سيظهر هذا المقال على الموقع تمامًا.",
    titleHelp:
      "عنوان المقال — يظهر على البطاقة، وفي صفحة المقالات، وفي تبويب المتصفح.",
    permalinkHelp: "عنوان المقال على الويب. يتبع العنوان حتى تعدّله هنا.",
    contentHelp:
      "اكتب المقال متصلًا. زر Enter يبدأ فقرة جديدة، ويمكنك لصق صورة في الموضع الذي تريده.",
    excerpt: "المقتطف",
    excerptHelp:
      "يظهر على بطاقة المقال، وفي صفحة المقالات، وكوصف في نتائج البحث ومنصات التواصل.",
    excerptPlaceholder: "ملخّص من سطرين للمقال…",
    publishDate: "تاريخ النشر",
    featureThis: "تمييز هذا المقال",
    featureHelp:
      "يثبّته في أعلى صفحة المدونة. يمكن تمييز مقال واحد فقط — وهذا يحلّ محل أي مقال مميّز حاليًا.",
    viewLive: "عرض المقال المنشور",
    confirmDelete:
      "هل تريد حذف هذا المقال؟ سيختفي من الموقع فورًا ولا يمكن التراجع عن ذلك.",
    pickLanguageWarning: "اختر لغة — لا يمكن حفظ المقال وهو لا يظهر في أي مكان.",
    author: "الكاتب",
    noByline: "بدون كاتب",
    deletedAuthor: "(كاتب محذوف — اختر بديلًا)",
    authorsManaged:
      "يُدار الكتّاب مرة واحدة في {settings}، لذا تصحيح الاسم أو الصورة يحدّث كل مقال كتبوه.",
    metaTitleDefault: "يأخذ عنوان المقال تلقائيًا",
    metaDescriptionDefault: "يأخذ المقتطف تلقائيًا",
    readingTime: "مدة القراءة",
    readingTimeHelp: "إذا تُرك فارغًا تُحتسب من المحتوى — {time}.",
  },

  newsEditor: {
    previewNote: "معاينة — هكذا سيظهر هذا الخبر على الموقع تمامًا.",
    titleHelp:
      "عنوان الخبر — يظهر على البطاقة، وفي صفحة الأخبار، وفي تبويب المتصفح.",
    permalinkHelp: "عنوان الخبر على الويب. يتبع العنوان حتى تعدّله هنا.",
    contentHelp:
      "اكتب الخبر متصلًا. زر Enter يبدأ فقرة جديدة، ويمكنك لصق صورة في الموضع الذي تريده.",
    summary: "الملخّص",
    summaryHelp:
      "يظهر على بطاقة الخبر، وفي صفحة الأخبار، وكوصف في نتائج البحث ومنصات التواصل.",
    summaryPlaceholder: "ملخّص من سطرين للخبر…",
    newsDate: "تاريخ الخبر",
    showsAs: "يظهر بصيغة {date}. وهذا ما ترتّب عليه صفحة الأخبار.",
    location: "المكان",
    locationPlaceholder: "القاهرة، مصر",
    locationHelp:
      "يظهر على البطاقة بجوار التاريخ. اتركه فارغًا للإعلانات التي لا مكان لها.",
    viewLive: "عرض الخبر المنشور",
    confirmDelete:
      "هل تريد حذف هذا الخبر؟ سيختفي من الموقع فورًا ولا يمكن التراجع عن ذلك.",
    pickLanguageWarning: "اختر لغة — لا يمكن حفظ الخبر وهو لا يظهر في أي مكان.",
    metaTitleDefault: "يأخذ عنوان الخبر تلقائيًا",
    metaDescriptionDefault: "يأخذ الملخّص تلقائيًا",
    tagsManaged:
      "تصنيفات الأخبار قائمة مستقلة تُدار في {settings}. وهي منفصلة عن تصنيفات المدونة ولا تؤثّر إلا على صفحة الأخبار.",
  },

  news: {
    title: "الفعاليات والأخبار",
    intro:
      "المؤتمرات وأيام التدريب وإطلاق المنتجات وأخبار الشركة — في قائمة واحدة. الفعالية والخبر شيء واحد هنا، وكلاهما يظهر في صفحة الفعاليات والأخبار.",
    addNew: "إضافة فعالية أو خبر",
    searchLabel: "البحث في الأخبار",
    searchPlaceholder: "ابحث في الفعاليات والأخبار…",
    emptyTitle: "لا يوجد شيء هنا بعد",
    emptyBody: "أضف أول فعالية أو إعلان للبدء.",
    noMatchTitle: "لا يوجد ما يطابق هذه التصفية",
    confirmDelete:
      "هل تريد حذف «{title}»؟ سيختفي من الموقع فورًا ولا يمكن التراجع عن ذلك.",
    deleteFailed: "تعذّر حذف «{title}». حاول مرة أخرى.",
    untitledFallback: "هذا الخبر بلا عنوان",
  },
};

export type AdminStrings = AdminStringsShape;

export function adminStrings(locale: Locale): AdminStrings {
  return locale === "ar" ? ar : en;
}
