export const MUMBAI_LOCALITIES = [
  // South Mumbai
  "Colaba", "Cuffe Parade", "Nariman Point", "Fort", "Churchgate",
  "Marine Lines", "Malabar Hill", "Walkeshwar", "Worli", "Prabhadevi",
  "Dadar", "Parel", "Lower Parel", "Sewri", "Matunga",

  // Central Mumbai
  "Byculla", "Curry Road", "Chinchpokli", "Wadala", "Antop Hill",

  // Western Suburbs
  "Mahim", "Dharavi", "Sion", "Kurla", "Bandra West", "Bandra East",
  "Santacruz West", "Santacruz East", "Vile Parle West", "Vile Parle East",
  "Andheri West", "Andheri East", "Jogeshwari West", "Jogeshwari East",
  "Goregaon West", "Goregaon East", "Malad West", "Malad East",
  "Kandivali West", "Kandivali East", "Borivali West", "Borivali East",
  "Dahisar West", "Dahisar East", "Mira Road", "Bhayander",

  // Eastern Suburbs
  "Ghatkopar West", "Ghatkopar East", "Vikhroli", "Kanjurmarg",
  "Bhandup", "Mulund West", "Mulund East", "Nahur", "Powai",
  "Chembur", "Govandi", "Mankhurd", "Trombay",

  // Harbour Line
  "Chunabhatti", "Tilaknagar", "Vidyavihar",

  // Extended MMR
  "Thane", "Kalwa", "Mumbra", "Diva", "Navi Mumbai",
  "Vashi", "Sanpada", "Kopar Khairane", "Ghansoli", "Rabale",
  "Turbhe", "Juinagar", "Kharghar", "Panvel",
  "Airoli", "Belapur", "Nerul", "Seawoods",
] as const;

export type MumbaiLocality = (typeof MUMBAI_LOCALITIES)[number];

export const LOCALITY_ZONES: Record<string, string[]> = {
  "South Mumbai": [
    "Colaba", "Cuffe Parade", "Nariman Point", "Fort", "Churchgate",
    "Marine Lines", "Malabar Hill", "Walkeshwar", "Worli", "Prabhadevi",
    "Dadar", "Parel", "Lower Parel", "Sewri", "Matunga",
  ],
  "Central Mumbai": ["Byculla", "Curry Road", "Chinchpokli", "Wadala", "Antop Hill"],
  "Western Suburbs": [
    "Mahim", "Dharavi", "Sion", "Kurla", "Bandra West", "Bandra East",
    "Santacruz West", "Santacruz East", "Vile Parle West", "Vile Parle East",
    "Andheri West", "Andheri East", "Jogeshwari West", "Jogeshwari East",
    "Goregaon West", "Goregaon East", "Malad West", "Malad East",
    "Kandivali West", "Kandivali East", "Borivali West", "Borivali East",
    "Dahisar West", "Dahisar East", "Mira Road", "Bhayander",
  ],
  "Eastern Suburbs": [
    "Ghatkopar West", "Ghatkopar East", "Vikhroli", "Kanjurmarg",
    "Bhandup", "Mulund West", "Mulund East", "Nahur", "Powai",
    "Chembur", "Govandi", "Mankhurd", "Trombay",
  ],
  "Navi Mumbai": [
    "Navi Mumbai", "Vashi", "Sanpada", "Kopar Khairane", "Ghansoli",
    "Rabale", "Turbhe", "Juinagar", "Kharghar", "Panvel",
    "Airoli", "Belapur", "Nerul", "Seawoods",
  ],
  "Thane & MMR": ["Thane", "Kalwa", "Mumbra", "Diva"],
};

export const MUMBAI_CENTER = { lat: 19.076, lng: 72.8777 };
