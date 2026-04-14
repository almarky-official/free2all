export const siteConfig = {
  name: "Free2All",
  shortName: "F2A",
  tagline: "Free video downloader, audio converter, and online utility tools.",
  description:
    "Free2All is a fast online toolkit for downloading videos, converting audio, saving thumbnails, and handling everyday file tasks in one clean workspace.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://free2all.example"),
  locale: "en_US",
  keywords: [
    "free video downloader",
    "video downloader online",
    "audio converter",
    "mp3 converter free",
    "thumbnail downloader",
    "download video online",
    "image compressor",
    "pdf merger",
    "password generator",
    "word counter online"
  ],
  navigation: [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    { href: "/about", label: "About Us" }
  ],
  footerNavigation: [
    { href: "/tools/video-downloader", label: "Video Downloader" },
    { href: "/tools/audio-converter", label: "Audio Converter" },
    { href: "/tools/thumbnail-downloader", label: "Thumbnail Downloader" },
    { href: "/tools", label: "All Tools" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/about", label: "About Us" }
  ],
  socialProof: [
    { label: "Free tools", value: "7" },
    { label: "Popular workflows", value: "Media + Utility" },
    { label: "Paywalls", value: "0" }
  ]
};

export function buildSiteUrl(pathname = "/") {
  return new URL(pathname, siteConfig.url).toString();
}

export const tools = [
  {
    slug: "video-downloader",
    title: "Video Downloader",
    shortTitle: "Video",
    description: "Download video files from supported pages with a quick MP4 workflow.",
    longDescription:
      "Use the Free2All video downloader to paste a supported media page, preview the result, and export MP4 or audio from one focused screen.",
    cta: "Open Downloader",
    eyebrow: "Media",
    icon: "download",
    category: "Media",
    trending: true,
    heroBadge: "Popular for fast MP4 downloads",
    supported: ["Video pages", "Embedded players", "Short clips", "Direct media links"],
    tags: ["MP4", "720p", "1080p", "Audio"],
    seoTitle: "Free Video Downloader Online",
    seoDescription:
      "Download videos online with Free2All. Paste a supported link, preview the result, choose MP4 or audio, and save the file in a clean browser workflow.",
    seoKeywords: ["free video downloader", "download videos online", "mp4 downloader", "save video link"],
    benefits: [
      "Preview title, duration, and thumbnail before you download.",
      "Switch between MP4 video and audio output from the same result card.",
      "Track real download progress with live status and completion feedback."
    ],
    steps: [
      "Paste a supported video page into the input field.",
      "Open the result to review the title, thumbnail, and available download options.",
      "Choose MP4 or Audio and let Free2All prepare the file for download."
    ],
    faq: [
      {
        question: "What does the Free2All video downloader do?",
        answer:
          "It accepts a supported media page, extracts the available result, and prepares downloadable video or audio files in a simple browser flow."
      },
      {
        question: "Can I choose different video qualities?",
        answer:
          "Yes. When the source provides multiple qualities, Free2All surfaces practical MP4 options such as best quality or a lower resolution export."
      },
      {
        question: "Why do some links still fail?",
        answer:
          "Some websites use DRM, login walls, geo restrictions, or network protections that can block automated extraction from the current environment."
      }
    ]
  },
  {
    slug: "thumbnail-downloader",
    title: "Thumbnail Downloader",
    shortTitle: "Thumbnail",
    description: "Preview and save a thumbnail image from a supported video page.",
    longDescription:
      "Use the Free2All thumbnail downloader to paste a supported media page, fetch the preview image, and save the thumbnail in one lightweight step.",
    cta: "Get Thumbnail",
    eyebrow: "Media",
    icon: "image",
    category: "Media",
    trending: true,
    heroBadge: "Fast preview image saving",
    supported: ["Video pages", "Embedded players", "Preview images", "Direct media links"],
    tags: ["Thumbnail", "Preview", "Poster"],
    seoTitle: "Thumbnail Downloader Online",
    seoDescription:
      "Download thumbnails from supported video pages with Free2All. Paste a link, preview the image, and save the thumbnail quickly.",
    seoKeywords: ["thumbnail downloader", "video thumbnail downloader", "save video thumbnail"],
    benefits: [
      "Fetch preview artwork from supported media pages without extra steps.",
      "Review the thumbnail before saving it.",
      "Use a focused workflow built for quick poster and preview downloads."
    ],
    steps: [
      "Paste a supported video page into the thumbnail tool.",
      "Wait for the preview image and media details to load.",
      "Download the thumbnail image directly from the result panel."
    ],
    faq: [
      {
        question: "What can I use the thumbnail downloader for?",
        answer:
          "It is useful for saving preview images from supported video pages for reference, planning, design, or content workflows."
      },
      {
        question: "Do I need to download the full video first?",
        answer: "No. The thumbnail workflow is separate, so you can fetch the preview image without saving the full media file."
      },
      {
        question: "Will every page have a thumbnail?",
        answer:
          "Most supported media pages expose preview images, but some sites may hide them or block access depending on their setup."
      }
    ]
  },
  {
    slug: "audio-converter",
    title: "Audio Converter",
    shortTitle: "Audio",
    description: "Convert supported media pages into downloadable audio output.",
    longDescription:
      "Use the Free2All audio converter to turn supported media pages into downloadable audio, with a simple flow designed for quick listening exports.",
    cta: "Convert to Audio",
    eyebrow: "Media",
    icon: "music",
    category: "Media",
    trending: true,
    heroBadge: "Built for quick audio exports",
    supported: ["Video pages", "Music clips", "Embedded players", "Direct media links"],
    tags: ["Audio", "MP3", "Listening"],
    seoTitle: "Free Audio Converter Online",
    seoDescription:
      "Convert supported video pages into downloadable audio with Free2All. Paste a link, preview the source, and export audio in a clean browser workflow.",
    seoKeywords: ["audio converter", "mp3 converter free", "convert video to audio"],
    benefits: [
      "Turn supported media pages into easy audio downloads.",
      "Use the same extraction flow as the video tool with a simpler audio-first path.",
      "Track preparation progress before the final file is saved."
    ],
    steps: [
      "Paste a supported media page into the audio converter.",
      "Review the detected source details in the result area.",
      "Choose the Audio option and wait for the file to finish preparing."
    ],
    faq: [
      {
        question: "What is the difference between the video downloader and audio converter?",
        answer:
          "The audio converter focuses on extracting downloadable audio from a supported media page, while the video downloader offers both video and audio choices."
      },
      {
        question: "Can I use the audio tool for music clips or podcast-style pages?",
        answer:
          "Yes, as long as the source page is supported by the extraction flow and does not block automated access."
      },
      {
        question: "Why can audio preparation take time?",
        answer:
          "The tool may need to download and process the source stream before the final audio file is ready for the browser."
      }
    ]
  },
  {
    slug: "image-compressor",
    title: "Image Compressor",
    shortTitle: "Compress",
    description: "Reduce image size online with a quick preview and export flow.",
    longDescription:
      "Use the Free2All image compressor to upload a picture, adjust the quality, preview the difference, and save a lighter file online.",
    cta: "Compress Images",
    eyebrow: "Utility",
    icon: "scan-search",
    category: "Utilities",
    trending: false,
    heroBadge: "Fast image size reduction",
    supported: ["JPG", "PNG", "WebP"],
    tags: ["Compress", "Optimize", "Preview"],
    seoTitle: "Free Image Compressor Online",
    seoDescription:
      "Compress images online with Free2All. Upload a file, preview the result, and save a smaller image without leaving the browser workflow.",
    seoKeywords: ["image compressor", "compress image online", "reduce image size"],
    benefits: [
      "See a cleaner preview before you export the optimized file.",
      "Reduce image size for uploads, messages, and faster page performance.",
      "Use a simple browser flow without extra clutter."
    ],
    steps: [
      "Upload an image file from your device.",
      "Adjust compression settings and preview the changes.",
      "Export the smaller image once the result looks right."
    ],
    faq: [
      {
        question: "Why use an online image compressor?",
        answer:
          "It helps reduce image size for sharing, uploads, and page speed while keeping the process simple and fast."
      },
      {
        question: "Will compression affect quality?",
        answer:
          "Yes, compression usually trades file size against image detail, which is why previewing the result before export is useful."
      },
      {
        question: "Which image formats are supported?",
        answer: "The current workflow is designed for common web image formats such as JPG, PNG, and WebP."
      }
    ]
  },
  {
    slug: "pdf-merger",
    title: "PDF Merger",
    shortTitle: "PDF",
    description: "Combine multiple PDF files into one clean download.",
    longDescription:
      "Use the Free2All PDF merger to upload multiple PDF files, combine them in one workflow, and export a single merged document.",
    cta: "Merge PDFs",
    eyebrow: "Utility",
    icon: "file-stack",
    category: "Utilities",
    trending: false,
    heroBadge: "Quick multi-file merge flow",
    supported: ["PDF"],
    tags: ["PDF", "Merge", "Export"],
    seoTitle: "Free PDF Merger Online",
    seoDescription:
      "Merge PDF files online with Free2All. Upload your documents, combine them in one clean workflow, and download a single PDF.",
    seoKeywords: ["pdf merger", "merge pdf online", "combine pdf files"],
    benefits: [
      "Combine multiple documents into a single file quickly.",
      "Keep the workflow focused on one task without extra distractions.",
      "Download one final PDF after the merge completes."
    ],
    steps: [
      "Upload the PDF files you want to combine.",
      "Start the merge process from the tool interface.",
      "Download the final merged PDF when the output is ready."
    ],
    faq: [
      {
        question: "What is a PDF merger used for?",
        answer:
          "It combines multiple PDF files into one document, which is useful for reports, forms, applications, and shared document bundles."
      },
      {
        question: "Can I merge more than two files?",
        answer: "Yes. The workflow is designed for combining multiple PDF files into a single output file."
      },
      {
        question: "Do I need separate software installed?",
        answer: "No. The Free2All PDF merger is built as a browser-first workflow with server-side processing when needed."
      }
    ]
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    shortTitle: "Password",
    description: "Create strong passwords with fast controls and quick copy.",
    longDescription:
      "Use the Free2All password generator to create stronger passwords instantly, adjust the rules you want, and copy the result with less friction.",
    cta: "Generate Passwords",
    eyebrow: "Utility",
    icon: "key-round",
    category: "Utilities",
    trending: false,
    heroBadge: "Instant secure password creation",
    supported: ["Browser"],
    tags: ["Password", "Secure", "Copy"],
    seoTitle: "Password Generator Online",
    seoDescription:
      "Generate secure passwords instantly with Free2All. Adjust the rules you need and create stronger passwords in a simple browser workflow.",
    seoKeywords: ["password generator", "strong password generator", "create secure password"],
    benefits: [
      "Create stronger passwords without guessing combinations manually.",
      "Adjust rules for length and character types before copying the result.",
      "Use a lightweight browser utility for quick security tasks."
    ],
    steps: [
      "Open the password generator and adjust the strength settings.",
      "Create a new password that matches your selected rules.",
      "Copy the generated password and store it safely."
    ],
    faq: [
      {
        question: "Why use a password generator?",
        answer:
          "It helps create stronger, less predictable passwords than short or reused combinations typed by hand."
      },
      {
        question: "Can I customize the password rules?",
        answer: "Yes. The tool is designed to let you adjust the output before generating and copying a password."
      },
      {
        question: "Should I reuse generated passwords?",
        answer: "No. A stronger security habit is to use unique passwords for different services and store them safely."
      }
    ]
  },
  {
    slug: "word-counter",
    title: "Word Counter",
    shortTitle: "Counter",
    description: "Count words, characters, and writing length instantly online.",
    longDescription:
      "Use the Free2All word counter to measure word count, character count, and reading length instantly while you type or paste text.",
    cta: "Count Words",
    eyebrow: "Utility",
    icon: "pen-square",
    category: "Utilities",
    trending: true,
    heroBadge: "Useful for writers and students",
    supported: ["Browser"],
    tags: ["Words", "Characters", "Writing"],
    seoTitle: "Word Counter Online",
    seoDescription:
      "Count words and characters online with Free2All. Paste text, check writing length instantly, and review basic metrics in one clean interface.",
    seoKeywords: ["word counter online", "character counter", "count words"],
    benefits: [
      "Track writing length instantly while editing or pasting text.",
      "Check word and character totals in one clear view.",
      "Use a fast browser tool for essays, captions, and content drafts."
    ],
    steps: [
      "Paste text into the editor or start typing directly.",
      "Review the live count metrics as you write.",
      "Use the totals to adjust your writing for the target length."
    ],
    faq: [
      {
        question: "Who is the word counter useful for?",
        answer: "It is useful for students, writers, marketers, editors, and anyone who needs quick writing metrics."
      },
      {
        question: "Does the word counter update live?",
        answer: "Yes. The tool is designed to update the text metrics as you type or paste content."
      },
      {
        question: "What metrics does it help with?",
        answer: "The main focus is fast word count, character count, and related writing-length checks."
      }
    ]
  }
];

export const trendingTools = tools.filter((tool) => tool.trending);

export const homeHighlights = [
  {
    title: "Start with the main search intent",
    description:
      "Free2All is built around the workflows users look for most often, including a free video downloader, audio converter, and thumbnail saver."
  },
  {
    title: "Keep the workflow clear",
    description:
      "Each tool focuses on one job so users can paste a link or upload a file and move quickly without getting lost in clutter."
  },
  {
    title: "Expand beyond media tools",
    description:
      "Alongside download tools, Free2All also includes practical utilities for PDF files, image size reduction, passwords, and writing tasks."
  }
];

export const homeFaqs = [
  {
    question: "What is Free2All?",
    answer:
      "Free2All is an online toolkit that combines a free video downloader, audio converter, thumbnail downloader, and several everyday utility tools in one place."
  },
  {
    question: "Which tools are most popular on Free2All?",
    answer:
      "The most used workflows are the video downloader, audio converter, thumbnail downloader, word counter, and file utility tools."
  },
  {
    question: "Can Free2All handle more than media downloads?",
    answer:
      "Yes. The platform also includes utilities for merging PDF files, compressing images, generating passwords, and checking writing length."
  },
  {
    question: "Why would some supported links still fail?",
    answer:
      "A page can still fail if the source website blocks automation, requires login, uses DRM, or applies geo restrictions from the current network."
  }
];

export const aboutSections = [
  {
    title: "Website Purpose",
    description:
      "Free2All is built for people who want quick access to useful browser tools without clutter, confusing flows, or distracting pages."
  },
  {
    title: "Features",
    description:
      "The platform combines media downloads, audio conversion, thumbnail saving, and practical utilities inside one consistent interface."
  },
  {
    title: "Product Direction",
    description:
      "The frontend stays easy to use while the backend remains modular enough for future scaling, provider changes, queues, and deployment improvements."
  }
];

export const workflowSteps = [
  {
    title: "Choose a tool",
    description: "Start from the homepage or tools directory and open the workflow that matches your task."
  },
  {
    title: "Add your link or file",
    description: "Paste a supported URL or upload a file depending on the tool you selected."
  },
  {
    title: "Get the result",
    description: "Review the processed output, then download, copy, or continue with the next step."
  }
];

export const aboutPrinciples = [
  "Keep useful online tools accessible to everyday users, creators, and students.",
  "Design flows that feel fast, trustworthy, and readable on both desktop and mobile.",
  "Build clean backend contracts so Free2All can grow without a full rewrite."
];

export const aboutFeatureGroups = [
  {
    title: "Media Tools",
    description: "Video downloading, thumbnail fetching, and audio conversion for supported media pages."
  },
  {
    title: "Utility Tools",
    description: "Image compression, PDF merging, password generation, and word counting in one place."
  },
  {
    title: "Scalable Backend",
    description: "Focused API routes make it easier to upgrade providers, add queues, and improve reliability over time."
  }
];

export function getToolBySlug(slug) {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(slug, limit = 3) {
  const activeTool = getToolBySlug(slug);

  if (!activeTool) {
    return [];
  }

  return tools
    .filter((tool) => tool.slug !== slug)
    .sort((left, right) => {
      const leftScore = Number(left.category === activeTool.category) + Number(left.trending);
      const rightScore = Number(right.category === activeTool.category) + Number(right.trending);

      return rightScore - leftScore;
    })
    .slice(0, limit);
}
