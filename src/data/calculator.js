export const calculatorTreatments = [
  {
    id: "scaling",
    name: { en: "Teeth Scaling & Deep Polishing", bn: "টিথ স্কেলিং ও পলিশিং" },
    minPrice: 1200,
    maxPrice: 2500,
    duration: "30-45 mins",
    desc: {
      en: "Ultrasonic cleaning removing tartar, calculus, and dark smoking/tea stains.",
      bn: "আল্ট্রাসনিক স্কেলারের সাহায্যে দাঁতের পাথর ও দীর্ঘদিনের দাগ পরিষ্কার।"
    }
  },
  {
    id: "filling",
    name: { en: "Composite Laser Tooth Filling (Per tooth)", bn: "কম্পোজিট দাঁতের ফিলিং (প্রতি দাঁত)" },
    minPrice: 1200,
    maxPrice: 3000,
    duration: "25 mins",
    desc: {
      en: "Tooth-colored aesthetic resin restoration for cavities and small chips.",
      bn: "দাঁতের স্বাভাবিক রঙের সাথে মিল রেখে তৈরি টেকসই ক্যাভিটি ফিলিং।"
    }
  },
  {
    id: "rct",
    name: { en: "Single-Visit Rotary Root Canal (RCT)", bn: "রোটারি রুট ক্যানেল চিকিৎসা (আরসিটি)" },
    minPrice: 4500,
    maxPrice: 7500,
    duration: "1 hour",
    desc: {
      en: "Painless removal of infected pulp nerve using rotary instrumentation.",
      bn: "সংক্রমিত স্নায়ু অপসারণ করে দাঁতকে আজীবনের জন্য রক্ষা করার চিকিৎসা।"
    }
  },
  {
    id: "crown-metal-ceramic",
    name: { en: "Porcelain Fused to Metal Crown (PFM)", bn: "মেটাল-সিরামিক ক্রাউন (ক্যাপ)" },
    minPrice: 4000,
    maxPrice: 6500,
    duration: "2 visits",
    desc: {
      en: "Durable ceramic crown with inner metal support for strong posterior teeth.",
      bn: "পেছনের দাঁতের জন্য মজবুত মেটাল বেসড সিরামিক ক্যাপ।"
    }
  },
  {
    id: "crown-zirconia",
    name: { en: "Premium CAD/CAM Zirconia Crown", bn: "প্রিমিয়াম সিএডি/সিএএম জিরকোনিয়া ক্রাউন" },
    minPrice: 8000,
    maxPrice: 16000,
    duration: "2 visits",
    desc: {
      en: "Metal-free, diamond-hard German monolithic zirconia with 10-year warranty.",
      bn: "জার্মান জিরকোনিয়া দিয়ে তৈরি প্রাকৃতিক রঙের ১০০% মেটালমুক্ত ক্যাপ।"
    }
  },
  {
    id: "implant",
    name: { en: "Dental Implant with Crown (Single tooth)", bn: "ডেন্টাল ইমপ্ল্যান্ট ও ক্রাউন (প্রতিটি)" },
    minPrice: 35000,
    maxPrice: 65000,
    duration: "3-4 months total",
    desc: {
      en: "Permanent titanium screw anchored in jawbone with custom ceramic tooth.",
      bn: "হারিয়ে যাওয়া দাঁত আজীবনের জন্য প্রতিস্থাপনের টাইটানিয়াম ইমপ্ল্যান্ট।"
    }
  },
  {
    id: "whitening",
    name: { en: "In-Office Laser Teeth Whitening", bn: "ইন-অফিস লেজার টিথ হোয়াইটনিং" },
    minPrice: 6000,
    maxPrice: 12000,
    duration: "45 mins",
    desc: {
      en: "Instant 4-8 shades smile brightening using clinical cold-light technology.",
      bn: "মাত্র ৪৫ মিনিটে দাঁত ৪-৮ শেড পর্যন্ত উজ্জ্বল করার লেজার সেশন।"
    }
  },
  {
    id: "extraction-simple",
    name: { en: "Painless Routine Tooth Extraction", bn: "ব্যথাহীন সাধারণ দাঁত তোলা" },
    minPrice: 1200,
    maxPrice: 2500,
    duration: "20 mins",
    desc: {
      en: "Gentle extraction of non-restorable damaged teeth under local anesthesia.",
      bn: "সম্পূর্ণ ব্যথামুক্ত উপায়ে ক্ষতিগ্রস্ত বা নড়া দাঁত তোলা।"
    }
  },
  {
    id: "wisdom-surgery",
    name: { en: "Surgical Impacted Wisdom Tooth Removal", bn: "আক্কেল দাঁতের সার্জিক্যাল অপারেশন" },
    minPrice: 3500,
    maxPrice: 8000,
    duration: "30-45 mins",
    desc: {
      en: "Specialist minor oral surgery for horizontal or bone-trapped third molars.",
      bn: "হাড়ে আটকে থাকা বা বাঁকা আক্কেল দাঁতের নিখুঁত সার্জারি।"
    }
  },
  {
    id: "braces",
    name: { en: "Orthodontic Braces Treatment (Full Mouth)", bn: "অর্থোডন্টিক ব্রেসেস চিকিৎসা (পুরো মুখ)" },
    minPrice: 35000,
    maxPrice: 85000,
    duration: "12-18 months",
    desc: {
      en: "Comprehensive realignment of crooked, crowded, or spaced teeth.",
      bn: "উঁচু-নিচু বা বাঁকা দাঁত সোজা করার পূর্ণাঙ্গ ব্রেসেস কোর্স।"
    }
  },
  {
    id: "denture",
    name: { en: "Flexible Valplast Denture (Partial/Full)", bn: "ফ্লেক্সিবল ডেনচার (বাঁধানো দাঁত)" },
    minPrice: 8000,
    maxPrice: 25000,
    duration: "3 visits",
    desc: {
      en: "Lightweight, unbreakable flexible artificial teeth for senior comfort.",
      bn: "খাবারের সুবিধার জন্য হালকা ও নমনীয় কৃত্রিম দাঁতের পাটি।"
    }
  },
  {
    id: "veneer",
    name: { en: "Porcelain Ceramic Veneer (Per tooth)", bn: "সিরামিক ভেনিয়ার (প্রতি দাঁত)" },
    minPrice: 12000,
    maxPrice: 20000,
    duration: "2 visits",
    desc: {
      en: "Ultra-thin custom porcelain shell for perfect Hollywood smile design.",
      bn: "সামনের দাঁতের নিখুঁত হাসি ও সৌন্দর্যের জন্য কাস্টম সিরামিক ভেনিয়ার।"
    }
  }
];
