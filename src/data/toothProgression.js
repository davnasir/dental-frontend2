export const toothStagesData = [
  {
    id: 1,
    stageNumber: "01",
    severity: "Mild",
    severityColor: "emerald",
    title: {
      en: "Stage 1: Enamel Surface Decay",
      bn: "পর্যায় ১: এনামেল উপরিভাগের ক্ষয়"
    },
    subtitle: {
      en: "Microscopic breakdown of the hard outer protective enamel layer.",
      bn: "দাঁতের সবচেয়ে শক্ত বাইরের এনামেল স্তরে প্রাথমিক ক্ষয়।"
    },
    whatHappens: {
      en: "Plaque acids begin demineralizing the enamel, forming chalky white spots that darken into small surface cavities. Because enamel lacks nerve endings, this stage is completely painless.",
      bn: "খাবারের কণা ও ব্যাকটেরিয়ার অ্যাসিড এনামেল স্তর ক্ষয় করতে শুরু করে। দাঁতের ওপর সাদাটে বা কালো দাগ পড়ে। কোনো স্নায়ু না থাকায় এই পর্যায়ে কোনো ব্যথা অনুভূত হয় না।"
    },
    symptoms: {
      en: [
        "Faint brown, black or white discoloration on tooth surface",
        "Rough spot detectable with the tongue",
        "Occasional mild twinge when having sweet foods",
        "Zero spontaneous or lingering tooth pain"
      ],
      bn: [
        "দাঁতের ওপর কালো, বাদামি বা সাদাটে দাগ",
        "জিহ্বা দিয়ে ছুঁলে অমসৃণ বা খাঁজ অনুভব হওয়া",
        "মিষ্টি খাবার খেলে মাঝে মাঝে হালকা শিরশির অনুভূতি",
        "কোনো স্থায়ী বা তীব্র ব্যথা না থাকা"
      ]
    },
    urgency: {
      en: "Low to Moderate — Preventative window",
      bn: "সাধারণ — প্রতিরোধমূলক চিকিৎসার উপযুক্ত সময়"
    },
    treatment: {
      en: "Composite Resin Tooth Filling or Fluoride Remineralization",
      bn: "কম্পোজিট রেজিন ফিলিং অথবা ফ্লোরাইড চিকিৎসা"
    },
    duration: {
      en: "Single visit (20 mins)",
      bn: "একটি সিটিং (২০ মিনিট)"
    },
    actionServiceId: "filling"
  },
  {
    id: 2,
    stageNumber: "02",
    severity: "Moderate",
    severityColor: "amber",
    title: {
      en: "Stage 2: Dentin & Pulp Involvement",
      bn: "পর্যায় ২: ডেন্টিন ও পাল্প স্তরে সংক্রমণ"
    },
    subtitle: {
      en: "Decay penetrates the softer dentin and approaches the living nerve chamber.",
      bn: "ক্ষয় এনামেল ভেদ করে ডেন্টিনে প্রবেশ করে স্নায়ুমূলের কাছাকাছি পৌঁছায়।"
    },
    whatHappens: {
      en: "Dentin contains thousands of microscopic tubules directly connected to the dental nerve. Once bacteria reach this layer, temperature changes trigger sharp, lingering sensitivity and throbbing pain.",
      bn: "ডেন্টিনের সূক্ষ্ম নালী সরাসরি দাঁতের স্নায়ুর সাথে যুক্ত। ব্যাকটেরিয়া এখানে পৌঁছালে ঠাণ্ডা বা গরম খাবার মুখে দিলেই দাঁতে তীব্র টনটন করা ও দীর্ঘস্থায়ী শিরশির ভাব শুরু হয়।"
    },
    symptoms: {
      en: [
        "Sharp pain when drinking iced water or hot tea",
        "Food constantly getting packed into a visible hole",
        "Pain lingering for 10-30 seconds after eating",
        "Discomfort when biting down on hard foods"
      ],
      bn: [
        "বরফ পানি বা গরম চা পানের সময় তীব্র টনটনে ব্যথা",
        "দাঁতের গর্তে বারবার খাবার আটকে অস্বস্তি",
        "খাবার খাওয়ার পরও বেশ কিছুক্ষণ ব্যথা স্থায়ী হওয়া",
        "শক্ত খাবার চিবানোর সময় চাপ লাগলে ব্যথা"
      ]
    },
    urgency: {
      en: "High — Needs treatment before irreversible pulp necrosis",
      bn: "উচ্চ — স্নায়ু পুরোপুরি নষ্ট হওয়ার আগেই দ্রুত চিকিৎসা জরুরি"
    },
    treatment: {
      en: "Deep Pulp Protection or Single-Visit Root Canal Treatment",
      bn: "ডিপ পাল্প ক্যাপিং অথবা রুট ক্যানেল চিকিৎসা (আরসিটি)"
    },
    duration: {
      en: "1 - 2 visits (45 mins)",
      bn: "১ বা ২ সিটিং (৪৫ মিনিট)"
    },
    actionServiceId: "rct"
  },
  {
    id: 3,
    stageNumber: "03",
    severity: "Critical",
    severityColor: "rose",
    title: {
      en: "Stage 3: Periapical Abscess & Emergency",
      bn: "পর্যায় ৩: গোড়ায় ইনফেকশন ও পুঁজ জমা (জরুরি অবস্থা)"
    },
    subtitle: {
      en: "Nerve is dead; bacteria form an active pus pocket inside the jawbone.",
      bn: "দাঁতের স্নায়ু অকেজো হয়ে চোয়ালের হাড়ের ভেতর মারাত্মক পুঁজ ও ইনফেকশন।"
    },
    whatHappens: {
      en: "The bacterial infection travels through the root canals into the surrounding jawbone, creating high-pressure pus build-up. Without immediate intervention, infection can spread to facial tissue spaces.",
      bn: "ইনফেকশন দাঁতের শিকড় পেরিয়ে চারপাশের হাড়ে ছড়িয়ে পড়ে পুঁজ জমা করে। মুখ বা মাড়ি ফুলে ওঠে এবং সময়মতো চিকিৎসা না নিলে রক্তে ইনফেকশন ছড়ানোর ঝুঁকি থাকে।"
    },
    symptoms: {
      en: [
        "Severe, continuous throbbing pain preventing sleep",
        "Noticeable swelling on the gum, cheek, or jawline",
        "Tooth feels raised, loose, or impossible to touch",
        "Fever, foul taste in mouth, or draining pimple on gum"
      ],
      bn: [
        "অসহ্য একটানা ব্যথা যার কারণে রাতে ঘুমানো যায় না",
        "মাড়ি, গাল বা চোয়াল দৃশ্যমানভাবে ফুলে যাওয়া",
        "দাঁত কিছুটা উঁচু মনে হওয়া এবং জিহ্বা লাগলেই অসহ্য ব্যথা",
        "জ্বর, মুখে বাজে স্বাদ অথবা মাড়ির ওপর পুঁজের ফোস্কা"
      ]
    },
    urgency: {
      en: "Immediate Emergency — Requires same-day clinical drainage & RCT",
      bn: "জরুরি — অবিলম্বে পুঁজ ড্রেনেজ ও বিশেষায়িত রুট ক্যানেল প্রয়োজন"
    },
    treatment: {
      en: "Emergency Canal Decompression, Antibiotic Therapy & Root Canal",
      bn: "জরুরি ক্যানেল ডিকম্প্রেশন, অ্যান্টিবায়োটিক ও রুট ক্যানেল"
    },
    duration: {
      en: "Immediate drainage + Multi-visit RCT",
      bn: "তাৎক্ষণিক ড্রেনেজ + রুট ক্যানেল সম্পন্ন"
    },
    actionServiceId: "rct"
  }
];
