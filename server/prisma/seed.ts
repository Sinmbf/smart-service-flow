import { PrismaClient } from "../src/generated/prisma/client";
import { Role, Language } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data (respecting foreign keys)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.priorityRequest.deleteMany();
  await prisma.serviceDurationHistory.deleteMany();
  await prisma.counter.deleteMany();
  await prisma.token.deleteMany();
  await prisma.requiredDocument.deleteMany();
  await prisma.serviceStage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.governmentOffice.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing records");

  // 1. Government Offices
  const dotm = await prisma.governmentOffice.create({
    data: {
      nameEn: "Department of Transport Management (DoTM)",
      nameNe: "यातायात व्यवस्था विभाग (DoTM)",
      location: "Ekantakuna, Lalitpur",
      hours: "Sun-Thu 10:00-16:00, Fri 10:00-14:00",
      services: {
        create: [
          {
            nameEn: "New Driving License",
            nameNe: "नयाँ सवारी चालक अनुमतिपत्र",
            descriptionEn: "Complete in-person verification, medical test, biometric, written exam, and trial for new driving license.",
            descriptionNe: "नयाँ लाइसेन्सका लागि कागजात प्रमाणीकरण, स्वास्थ्य परीक्षण, बायोमेट्रिक, लिखित परीक्षा तथा ट्रायल।",
            category: "Transportation",
            stages: {
              create: [
                {
                  stageOrder: 1,
                  nameEn: "Biometrics & Photo",
                  nameNe: "बायोमेट्रिक्स तथा फोटो",
                  baselineMinutes: 8,
                  location: "Room 101, Counter 1-3",
                  documents: {
                    create: [
                      { nameEn: "Citizenship Certificate (Original)", nameNe: "नागरिकताको प्रमाणपत्र (सक्कली)", type: "id" },
                      { nameEn: "Online Application Printout", nameNe: "अनलाइन आवेदनको फारम प्रिन्ट", type: "receipt" },
                      { nameEn: "Passport Size Photos (2 pcs)", nameNe: "पासपोर्ट साइजको फोटो (२ प्रति)", type: "photo" },
                    ],
                  },
                },
                {
                  stageOrder: 2,
                  nameEn: "Medical & Eye Examination",
                  nameNe: "स्वास्थ्य तथा आँखा परीक्षण",
                  baselineMinutes: 5,
                  location: "Room 104",
                  documents: {
                    create: [
                      { nameEn: "Blood Group Card / Report", nameNe: "रक्त समूह कार्ड / रिपोर्ट", type: "medical" },
                    ],
                  },
                },
                {
                  stageOrder: 3,
                  nameEn: "Document Verification & Fee Payment",
                  nameNe: "कागजात प्रमाणीकरण तथा राजस्व भुक्तानी",
                  baselineMinutes: 10,
                  location: "Room 108, Counter 4-8",
                  documents: {
                    create: [
                      { nameEn: "Medical Examination Slip", nameNe: "स्वास्थ्य परीक्षणको पर्ची", type: "medical" },
                      { nameEn: "Revenue Voucher", nameNe: "राजस्व भौचर", type: "receipt" },
                    ],
                  },
                },
                {
                  stageOrder: 4,
                  nameEn: "Written Exam",
                  nameNe: "लिखित परीक्षा",
                  baselineMinutes: 30,
                  location: "Exam Hall (2nd Floor)",
                },
                {
                  stageOrder: 5,
                  nameEn: "Practical Driving Test (Trial)",
                  nameNe: "प्रयोगात्मक परीक्षा (ट्रायल)",
                  baselineMinutes: 15,
                  location: "Trial Center, Ground",
                },
                {
                  stageOrder: 6,
                  nameEn: "License Fee & Final Approval",
                  nameNe: "लाइसेन्स दस्तुर तथा अन्तिम स्वीकृति",
                  baselineMinutes: 12,
                  location: "Room 205",
                },
                {
                  stageOrder: 7,
                  nameEn: "Smart License Distribution",
                  nameNe: "स्मार्ट लाइसेन्स वितरण",
                  baselineMinutes: 5,
                  location: "Distribution Counter A",
                },
              ],
            },
          },
          {
            nameEn: "Driving License Renewal",
            nameNe: "सवारी चालक अनुमतिपत्र नवीकरण",
            descriptionEn: "Renew expired driving license with updated biometric and medical verification.",
            descriptionNe: "म्याद सकिएको सवारी चालक अनुमतिपत्रको नवीकरण।",
            category: "Transportation",
            stages: {
              create: [
                {
                  stageOrder: 1,
                  nameEn: "Medical Verification",
                  nameNe: "स्वास्थ्य परीक्षण",
                  baselineMinutes: 5,
                  location: "Room 104",
                  documents: {
                    create: [
                      { nameEn: "Old Driving License (Original)", nameNe: "पुरानो सवारी चालक अनुमतिपत्र (सक्कली)", type: "id" },
                    ],
                  },
                },
                {
                  stageOrder: 2,
                  nameEn: "Biometric & Fee Payment",
                  nameNe: "बायोमेट्रिक तथा राजस्व भुक्तानी",
                  baselineMinutes: 8,
                  location: "Room 108",
                },
                {
                  stageOrder: 3,
                  nameEn: "Slip / License Collection",
                  nameNe: "रसिद / लाइसेन्स संकलन",
                  baselineMinutes: 5,
                  location: "Counter 2",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const dao = await prisma.governmentOffice.create({
    data: {
      nameEn: "District Administration Office (DAO)",
      nameNe: "जिल्ला प्रशासन कार्यालय",
      location: "Babarmahal, Kathmandu",
      hours: "Sun-Thu 10:00-16:00, Fri 10:00-14:00",
      services: {
        create: [
          {
            nameEn: "Citizenship Certificate Issue",
            nameNe: "नागरिकता प्रमाणपत्र प्राप्ति",
            descriptionEn: "New citizenship by descent or birth certificate.",
            descriptionNe: "वंशज वा जन्मका आधारमा नयाँ नागरिकता प्रमाणपत्र।",
            category: "Civil Registry",
            stages: {
              create: [
                {
                  stageOrder: 1,
                  nameEn: "Recommendation & Form Check",
                  nameNe: "सिफारिस तथा फारम जाँच",
                  baselineMinutes: 10,
                  location: "Room 12, Counter 1",
                  documents: {
                    create: [
                      { nameEn: "Ward Recommendation Letter", nameNe: "वडा कार्यालयको सिफारिस पत्र", type: "document" },
                      { nameEn: "Father/Mother's Citizenship (Original + Copy)", nameNe: "बुबा/आमाको नागरिकता (सक्कली र प्रतिलिपि)", type: "id" },
                      { nameEn: "Birth Certificate", nameNe: "जन्म दर्ता प्रमाणपत्र", type: "document" },
                    ],
                  },
                },
                {
                  stageOrder: 2,
                  nameEn: "Officer Verification & Interview",
                  nameNe: "अधिकृत प्रमाणीकरण तथा अन्तर्वार्ता",
                  baselineMinutes: 15,
                  location: "Room 15 (Officer Chamber)",
                },
                {
                  stageOrder: 3,
                  nameEn: "Data Entry & Fingerprint",
                  nameNe: "डाटा प्रविष्टि तथा औँठाछाप",
                  baselineMinutes: 8,
                  location: "Room 14",
                },
                {
                  stageOrder: 4,
                  nameEn: "Card Printing & Handover",
                  nameNe: "प्रमाणपत्र छपाई तथा वितरण",
                  baselineMinutes: 5,
                  location: "Distribution Counter",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded 2 Government Offices:`);
  console.log(`   - ${dotm.nameEn}`);
  console.log(`   - ${dao.nameEn}`);

  // 2. Demo Users (Citizen + Staff + Admin)
  const citizen = await prisma.user.create({
    data: {
      phoneNumber: "+9779841234567",
      name: "Siddhartha Shakya",
      role: Role.CITIZEN,
      preferredLanguage: Language.EN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@dotm.gov.np",
      // password will be set via bcrypt in Step 2 (auth) — placeholder for now
      password: null,
      name: "Ramesh Sharma",
      employeeId: "DOTM-1042",
      role: Role.STAFF,
      preferredLanguage: Language.NE,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@smartservice.gov.np",
      password: null,
      name: "System Administrator",
      role: Role.ADMIN,
      preferredLanguage: Language.EN,
    },
  });

  console.log("✅ Seeded demo users:");
  console.log(`   - Citizen: ${citizen.phoneNumber} (${citizen.name})`);
  console.log(`   - Staff:   ${staff.email} (${staff.name})`);
  console.log(`   - Admin:   ${admin.email}`);
  console.log("🌱 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
