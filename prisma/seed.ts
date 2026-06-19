import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ── Data pools ────────────────────────────────────────────────────────────────

const LOCALITIES = [
  "Bandra West", "Bandra East", "Andheri West", "Andheri East", "Powai",
  "Worli", "Lower Parel", "Parel", "Dadar", "Prabhadevi",
  "Juhu", "Santacruz West", "Santacruz East", "Vile Parle West", "Vile Parle East",
  "Malad West", "Malad East", "Kandivali West", "Kandivali East",
  "Borivali West", "Borivali East", "Goregaon West", "Goregaon East",
  "Jogeshwari West", "Jogeshwari East", "Ghatkopar West", "Ghatkopar East",
  "Chembur", "Mulund West", "Mulund East", "Thane", "Navi Mumbai",
  "Kharghar", "Vashi", "Belapur", "Nerul", "Kurla", "Sion",
  "Matunga", "Wadala", "Colaba", "Cuffe Parade", "Nariman Point",
  "Malabar Hill", "Walkeshwar", "Fort", "Churchgate", "Marine Lines",
  "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Panvel", "Kharghar",
];

const SUB_LOCALITIES: Record<string, string[]> = {
  "Bandra West": ["Pali Hill", "Bandstand", "Carter Road", "Hill Road", "Linking Road"],
  "Andheri West": ["Versova", "4 Bungalows", "7 Bungalows", "Oshiwara", "DN Nagar"],
  "Andheri East": ["Marol", "Sakinaka", "MIDC", "Chakala", "Airport Road"],
  "Powai": ["Hiranandani", "IIT Area", "Chandivali", "Raheja Vihar"],
  "Worli": ["Worli Sea Face", "Worli Naka", "Century Mills"],
  "Lower Parel": ["Phoenix Mills", "Kamala Mills", "Parel Village"],
  "Malad West": ["Marve", "Malvani", "Orlem", "Mindspace"],
  "Goregaon West": ["Film City Road", "Aarey Colony", "SV Road"],
  "Chembur": ["Govandi", "Tilak Nagar", "Diamond Garden"],
  "Thane": ["Ghodbunder Road", "Hiranandani Estate", "Majiwada", "Wagle Estate"],
};

const BROKERS_DATA = [
  { name: "Rajesh Mehta", phone: "9820111001", rera: "A51800019168", areas: ["Bandra West", "Juhu", "Santacruz West"] },
  { name: "Priya Sharma", phone: "9821222002", rera: "A51800019230", areas: ["Andheri West", "Andheri East", "Jogeshwari West"] },
  { name: "Sunil Patil", phone: "9833333003", rera: "A51800019312", areas: ["Powai", "Vikhroli", "Kanjurmarg"] },
  { name: "Anita Desai", phone: "9844444004", rera: "A51800019401", areas: ["Worli", "Lower Parel", "Parel"] },
  { name: "Mohammed Shaikh", phone: "9855555005", rera: "A51800019523", areas: ["Malad West", "Malad East", "Kandivali West"] },
  { name: "Deepika Nair", phone: "9866666006", rera: "A51800019645", areas: ["Goregaon West", "Goregaon East", "Borivali West"] },
  { name: "Vikram Singh", phone: "9877777007", rera: "A51800019712", areas: ["Thane", "Navi Mumbai", "Kharghar"] },
  { name: "Kavita Joshi", phone: "9888888008", rera: "A51800019834", areas: ["Chembur", "Ghatkopar West", "Ghatkopar East"] },
  { name: "Arun Kumar", phone: "9899999009", rera: "A51800019956", areas: ["Dadar", "Matunga", "Sion"] },
  { name: "Sneha Wagh", phone: "9810101010", rera: "A51800020012", areas: ["Colaba", "Cuffe Parade", "Nariman Point"] },
  { name: "Rohit Kapoor", phone: "9810202020", rera: "A51800020134", areas: ["Vile Parle West", "Vile Parle East", "Santacruz East"] },
  { name: "Meera Iyer", phone: "9810303030", rera: "A51800020256", areas: ["Mulund West", "Mulund East", "Bhandup"] },
  { name: "Nikhil Rao", phone: "9810404040", rera: "A51800020378", areas: ["Kurla", "Ghatkopar East", "Wadala"] },
  { name: "Pooja Agarwal", phone: "9810505050", rera: "A51800020490", areas: ["Malabar Hill", "Walkeshwar", "Worli"] },
  { name: "Farhan Khan", phone: "9810606060", rera: "A51800020512", areas: ["Vashi", "Belapur", "Nerul"] },
  { name: "Shweta Bhatt", phone: "9810707070", rera: "A51800020634", areas: ["Borivali East", "Dahisar West", "Mira Road"] },
  { name: "Dinesh Gupta", phone: "9810808080", rera: "A51800020756", areas: ["Kandivali East", "Borivali West", "Dahisar East"] },
  { name: "Ritu Verma", phone: "9810909090", rera: "A51800020878", areas: ["Fort", "Churchgate", "Marine Lines"] },
  { name: "Sachin Lotke", phone: "9811010101", rera: "A51800020990", areas: ["Prabhadevi", "Dadar", "Lower Parel"] },
  { name: "Naina Choudhary", phone: "9811111111", rera: "A51800021012", areas: ["Panvel", "Kharghar", "Navi Mumbai"] },
];

const AMENITIES_POOL = [
  "Gymnasium", "Swimming Pool", "24x7 Security", "Power Backup",
  "Covered Parking", "Children's Play Area", "Clubhouse", "Garden",
  "CCTV Surveillance", "Intercom", "Lift", "Visitor Parking",
  "Jogging Track", "Indoor Games", "Multipurpose Hall", "Rooftop Terrace",
  "Solar Power", "RO Water", "Video Door Phone", "Fire Safety",
];

const BUILDINGS = [
  "Hiranandani Gardens", "Lodha Palava", "Godrej Prime", "Oberoi Sky Heights",
  "Rustomjee Elements", "Mahindra Happinest", "L&T Realty", "Shapoorji Pallonji",
  "Tata Housing", "Kalpataru Radiance", "Wadhwa Courtyard", "DB Woods",
  "Raheja Classique", "Ekta Tripolis", "Omkar Alta Monte", "Runwal Forests",
  "Kanakia Spaces", "Haware Citi", "Dosti Acres", "Nahar Amrit Shakti",
  "Sunteck Realty", "Sheth Montana", "Raymond Realty", "Prestige Residences",
  "Brigade Gateway", "Puravankara Heights", "Kolte Patil Life Republic",
];

const PINCODES: Record<string, string> = {
  "Bandra West": "400050", "Bandra East": "400051", "Andheri West": "400058",
  "Andheri East": "400069", "Powai": "400076", "Worli": "400018",
  "Lower Parel": "400013", "Parel": "400012", "Dadar": "400014",
  "Prabhadevi": "400025", "Juhu": "400049", "Santacruz West": "400054",
  "Santacruz East": "400055", "Vile Parle West": "400056", "Vile Parle East": "400057",
  "Malad West": "400064", "Malad East": "400097", "Kandivali West": "400067",
  "Kandivali East": "400101", "Borivali West": "400092", "Borivali East": "400066",
  "Goregaon West": "400062", "Goregaon East": "400063", "Jogeshwari West": "400102",
  "Jogeshwari East": "400060", "Ghatkopar West": "400086", "Ghatkopar East": "400077",
  "Chembur": "400071", "Mulund West": "400080", "Mulund East": "400081",
  "Thane": "400601", "Navi Mumbai": "400706", "Kharghar": "410210",
  "Vashi": "400703", "Belapur": "400614", "Nerul": "400706",
  "Kurla": "400070", "Sion": "400022", "Matunga": "400019",
  "Wadala": "400037", "Colaba": "400005", "Cuffe Parade": "400005",
  "Nariman Point": "400021", "Malabar Hill": "400006", "Walkeshwar": "400006",
  "Fort": "400001", "Churchgate": "400020", "Marine Lines": "400002",
  "Vikhroli": "400083", "Kanjurmarg": "400042", "Bhandup": "400078",
  "Nahur": "400080", "Panvel": "410206",
};

const COORDS: Record<string, [number, number]> = {
  "Bandra West": [19.0596, 72.8295], "Bandra East": [19.0544, 72.8406],
  "Andheri West": [19.1307, 72.8272], "Andheri East": [19.1136, 72.8697],
  "Powai": [19.1176, 72.9060], "Worli": [19.0176, 72.8178],
  "Lower Parel": [18.9969, 72.8265], "Parel": [19.0060, 72.8408],
  "Dadar": [19.0213, 72.8427], "Juhu": [19.1075, 72.8263],
  "Santacruz West": [19.0821, 72.8397], "Malad West": [19.1868, 72.8484],
  "Goregaon West": [19.1544, 72.8488], "Chembur": [19.0623, 72.9004],
  "Thane": [19.2183, 72.9781], "Navi Mumbai": [19.0330, 73.0297],
  "Kharghar": [19.0473, 73.0693], "Vashi": [19.0771, 73.0068],
  "Colaba": [18.9067, 72.8147], "Cuffe Parade": [18.9200, 72.8215],
  "Fort": [18.9344, 72.8353], "Churchgate": [18.9322, 72.8264],
  "Malabar Hill": [18.9543, 72.7985], "Worli": [19.0176, 72.8178],
  "Ghatkopar East": [19.0864, 72.9081], "Ghatkopar West": [19.0863, 72.8989],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randBool(chance = 0.5): boolean {
  return Math.random() < chance;
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generatePrice(bhk: number, type: "SALE" | "RENT", locality: string): number {
  const premiumLocalities = ["Bandra West", "Worli", "Juhu", "Malabar Hill", "Cuffe Parade", "Colaba", "Nariman Point", "Lower Parel", "Powai"];
  const isPremium = premiumLocalities.includes(locality);
  const multiplier = isPremium ? 1.5 : 1;

  if (type === "RENT") {
    const base: Record<number, [number, number]> = {
      1: [15000, 35000], 2: [25000, 60000], 3: [45000, 100000],
      4: [70000, 180000], 5: [120000, 350000],
    };
    const [min, max] = base[bhk] || base[2];
    return Math.round(rand(min, max) * multiplier / 1000) * 1000;
  } else {
    const base: Record<number, [number, number]> = {
      1: [4500000, 9000000], 2: [7000000, 18000000], 3: [12000000, 35000000],
      4: [25000000, 70000000], 5: [50000000, 150000000],
    };
    const [min, max] = base[bhk] || base[2];
    return Math.round(rand(min, max) * multiplier / 100000) * 100000;
  }
}

function generateTitle(bhk: number, locality: string, type: "SALE" | "RENT", building?: string): string {
  const adjectives = ["Spacious", "Luxurious", "Modern", "Beautiful", "Well-Maintained", "Ready to Move", "Newly Renovated", "Corner", "Sea View", "Garden Facing", "Premium", "Elegant"];
  const adj = pick(adjectives);
  const typeLabel = type === "RENT" ? "for Rent" : "for Sale";
  if (building && randBool(0.4)) {
    return `${adj} ${bhk}BHK in ${building}, ${locality} ${typeLabel}`;
  }
  return `${adj} ${bhk}BHK Flat ${typeLabel} in ${locality}`;
}

function generateDescription(bhk: number, locality: string, areaSqft: number, floor: number, totalFloors: number): string {
  const lines = [
    `This well-maintained ${bhk}BHK apartment is located in one of the prime areas of ${locality}, Mumbai.`,
    `The property is on the ${floor}${floor === 1 ? "st" : floor === 2 ? "nd" : floor === 3 ? "rd" : "th"} floor out of ${totalFloors} floors with excellent ventilation and natural light.`,
    `Super built-up area of ${areaSqft} sq ft with efficient space utilization.`,
    `The apartment is in close proximity to schools, hospitals, shopping malls, and public transport.`,
    `Local train station and metro connectivity are within walking distance.`,
  ];
  return lines.join(" ");
}

// ── Main seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding MumbaiBrokers database...\n");

  // 1. Create brokers
  console.log("Creating brokers...");
  const brokers = await Promise.all(
    BROKERS_DATA.map((b) =>
      prisma.user.upsert({
        where: { phone: b.phone },
        update: {},
        create: {
          name: b.name,
          phone: b.phone,
          rera_number: b.rera,
          areas: b.areas,
          whatsapp: b.phone,
          role: "BROKER",
          isVerified: true,
          bio: `Experienced real estate broker specializing in ${b.areas.slice(0, 2).join(" and ")} areas with 5+ years of expertise in Mumbai residential and commercial properties.`,
        },
      })
    )
  );
  console.log(`✓ ${brokers.length} brokers created\n`);

  // 2. Create listings in batches
  console.log("Creating 5000 listings in batches...");
  const TOTAL = 5000;
  const BATCH = 100;
  let created = 0;

  for (let i = 0; i < TOTAL; i += BATCH) {
    const batch = [];

    for (let j = 0; j < BATCH && i + j < TOTAL; j++) {
      const locality = pick(LOCALITIES);
      const subLocalityList = SUB_LOCALITIES[locality];
      const subLocality = subLocalityList ? (randBool(0.5) ? pick(subLocalityList) : undefined) : undefined;
      const bhk = pick([1, 1, 2, 2, 2, 3, 3, 3, 4, 5]);
      const type: "SALE" | "RENT" = randBool(0.55) ? "SALE" : "RENT";
      const propType: "RESIDENTIAL" | "COMMERCIAL" = randBool(0.9) ? "RESIDENTIAL" : "COMMERCIAL";
      const furnishing = pick(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const);
      const floor = rand(1, 25);
      const totalFloors = rand(floor, Math.max(floor + 2, 30));
      const areaSqft = rand(450, 2800);
      const price = generatePrice(bhk, type, locality);
      const building = randBool(0.4) ? pick(BUILDINGS) : undefined;
      const title = generateTitle(bhk, locality, type, building);
      const description = generateDescription(bhk, locality, areaSqft, floor, totalFloors);
      const amenities = pickN(AMENITIES_POOL, rand(3, 8));
      const coords = COORDS[locality];
      const broker = pick(brokers);
      const isFeatured = randBool(0.08); // ~8% featured

      // Use placeholder images from Unsplash (no API key needed)
      const imgId = rand(1, 50);
      const images = [
        `https://images.unsplash.com/photo-${1600596542815 + imgId * 1000000}-${imgId}ea6c6c91fa?w=800&q=80`,
        `https://images.unsplash.com/photo-${1600607687939 + imgId * 500000}-d5?w=800&q=80`,
      ];

      batch.push({
        brokerId: broker.id,
        type,
        propertyType: propType,
        bhk,
        title,
        description,
        price: BigInt(price),
        area_sqft: areaSqft,
        locality,
        subLocality: subLocality ?? null,
        pincode: PINCODES[locality] || "400001",
        latitude: coords ? coords[0] + (Math.random() - 0.5) * 0.02 : null,
        longitude: coords ? coords[1] + (Math.random() - 0.5) * 0.02 : null,
        images,
        amenities,
        furnishing,
        floor,
        totalFloors,
        possession: randBool(0.7) ? "Ready to Move" : "Under Construction",
        isActive: true,
        isFeatured,
        views: rand(0, 500),
      });
    }

    await prisma.listing.createMany({ data: batch });
    created += batch.length;
    process.stdout.write(`  ${created}/${TOTAL} listings...\r`);
  }

  console.log(`\n✓ ${created} listings created\n`);

  // 3. Summary
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
  ]);
  console.log("── Seed complete ──────────────────────");
  console.log(`  Users:    ${counts[0]}`);
  console.log(`  Listings: ${counts[1]}`);
  console.log("──────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
