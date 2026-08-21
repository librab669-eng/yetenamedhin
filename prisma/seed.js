const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const ETH_YEAR = 2017;
const ETH_MONTHS = 13;

function ethDateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateInMonth(year, month) {
  const daysInMonth = month === 13 ? 6 : 30;
  return randomInt(1, daysInMonth);
}

function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

async function main() {
  console.log("🌱 Seeding comprehensive mock data for EC", ETH_YEAR, "...");

  // Default settings
  await prisma.setting.upsert({ where: { key: "pin" }, create: { key: "pin", value: "0000" }, update: {} });
  await prisma.setting.upsert({ where: { key: "family_seq" }, create: { key: "family_seq", value: "0" }, update: {} });
  await prisma.setting.upsert({ where: { key: "hospitalName" }, create: { key: "hospitalName", value: "Yetena Medhin Hospital" }, update: {} });
  await prisma.setting.upsert({ where: { key: "backupInterval" }, create: { key: "backupInterval", value: "1" }, update: {} });
  await prisma.setting.upsert({ where: { key: "backupDir" }, create: { key: "backupDir", value: "C:\\YetenaBackups" }, update: {} });

  // Extended medicine list (common in Ethiopian public hospitals)
  const medicines = [
    { name: "Paracetamol 500mg", nameAm: "ፓራሰታሞል 500ሚ.ግ", unit: "tab", pricePerUnit: 2, weight: 25 },
    { name: "Amoxicillin 250mg", nameAm: "አሞክሲሲሊን 250ሚ.ግ", unit: "cap", pricePerUnit: 5, weight: 20 },
    { name: "ORS Sachet", nameAm: "ኦ.አር.ኤስ ሳሼት", unit: "sachet", pricePerUnit: 10, weight: 15 },
    { name: "Ibuprofen 400mg", nameAm: "ኢቡፕሮፊን 400ሚ.ግ", unit: "tab", pricePerUnit: 3, weight: 18 },
    { name: "Metformin 500mg", nameAm: "ሜትፎርሚን 500ሚ.ግ", unit: "tab", pricePerUnit: 4, weight: 12 },
    { name: "Artemether-Lumefantrine", nameAm: "አርቴሜተር-ሉሜፋንትሪን", unit: "tab", pricePerUnit: 8, weight: 10 },
    { name: "Ciprofloxacin 500mg", nameAm: "ሲፕሮፎሳሲን 500ሚ.ግ", unit: "tab", pricePerUnit: 6, weight: 10 },
    { name: "Doxycycline 100mg", nameAm: "ዶክሲሲክሊን 100ሚ.ግ", unit: "cap", pricePerUnit: 4, weight: 8 },
    { name: "Folic Acid 5mg", nameAm: "ፎሊክ አሲድ 5ሚ.ግ", unit: "tab", pricePerUnit: 1, weight: 15 },
    { name: "Ferrous Sulfate 200mg", nameAm: "ፈሮስ ሱልፌት 200ሚ.ግ", unit: "tab", pricePerUnit: 1, weight: 14 },
    { name: "Vitamin B Complex", nameAm: "ቪታሚን ቢ ኮምፕሌክስ", unit: "tab", pricePerUnit: 2, weight: 12 },
    { name: "Cotrimoxazole 480mg", nameAm: "ኮትሪሞክሳዝል 480ሚ.ግ", unit: "tab", pricePerUnit: 3, weight: 10 },
    { name: "Albendazole 400mg", nameAm: "አልበንዳዞል 400ሚ.ግ", unit: "tab", pricePerUnit: 5, weight: 8 },
    { name: "Mebendazole 100mg", nameAm: "ሜበንዳዞል 100ሚ.ግ", unit: "tab", pricePerUnit: 2, weight: 7 },
    { name: "Salbutamol Inhaler", nameAm: "ሳልቡታሞል ኢንሃለር", unit: "inhaler", pricePerUnit: 45, weight: 5 },
    { name: "Prednisolone 5mg", nameAm: "ፕረድኒሶሎን 5ሚ.ግ", unit: "tab", pricePerUnit: 2, weight: 6 },
    { name: "Hydrochlorothiazide 25mg", nameAm: "ሃይድሮክሎሮታዚድ 25ሚ.ግ", unit: "tab", pricePerUnit: 2, weight: 8 },
    { name: "Amlodipine 5mg", nameAm: "አምሎዲፒን 5ሚ.ግ", unit: "tab", pricePerUnit: 3, weight: 9 },
    { name: "Losartan 50mg", nameAm: "ሎሳርታን 50ሚ.ግ", unit: "tab", pricePerUnit: 4, weight: 7 },
    { name: "Atorvastatin 20mg", nameAm: "አቶርቫስታቲን 20ሚ.ግ", unit: "tab", pricePerUnit: 5, weight: 6 },
  ];

  console.log("Creating medicines...");
  for (const m of medicines) {
    const { weight, ...medData } = m;
    const existing = await prisma.medicine.findFirst({ where: { name: m.name } });
    if (!existing) await prisma.medicine.create({ data: medData });
  }
  const allMedicines = await prisma.medicine.findMany({ orderBy: { name: "asc" } });
  console.log("  →", allMedicines.length, "medicines ready");

  // Amharic names for variety
  const maleNames = [
    "Abebe", "Kebede", "Tadesse", "Getachew", "Mesfin", "Dawit", "Yohannes", "Tekle",
    "Solomon", "Daniel", "Mulugeta", "Assefa", "Berhanu", "Tesfaye", "Alemayehu",
    "Haile", "Girma", "Bekele", "Zewde", "Mekonnen"
  ];
  const femaleNames = [
    "Alem", "Tigist", "Genet", "Mulu", "Abeba", "Tsehay", "Worknesh", "Kalkidan",
    "Hirut", "Emebet", "Yordanos", "Rahel", "Selam", "Mariam", "Aster",
    "Tsion", "Bethel", "Eden", "Ruth", "Naomi"
  ];
  const surnames = [
    "Beyene", "Gebremariam", "Tadesse", "Wolde", "Hailu", "Assefa", "Tesfaye",
    "Mamo", "Desta", "Gebre", "Lemma", "Beyene", "Welde", "Tekle", "Abebe"
  ];
  const amharicMaleNames = [
    "አበበ", "ከበደ", "ታደሰ", "ጌታቸው", "መስፍን", "ዳዊት", "ዮሐንስ", "ተክሌ",
    "ሰሎሞን", "ዳንኤል", "ሙሉጌታ", "አሰፋ", "ብርሃኑ", "ተስፋዬ", "ዓለማየሁ",
    "ኃይሌ", "ግርማ", "በቀሌ", "ዘውዴ", "መኮንን"
  ];
  const amharicFemaleNames = [
    "ዓለም", "ትግስት", "ገነት", "ሙሉ", "አበባ", "ጸሐይ", "ወርቀንሽ", "ቃልኪዳን",
    "ሂሩት", "ኤምበት", "ዮርዳኖስ", "ራህል", "ሰላም", "ማሪያም", "አስቴር",
    "ጽዮን", "ቤተል", "ኤዴን", "ሩት", "ናኦሚ"
  ];
  const amharicSurnames = [
    "በየነ", "ገብረማርያም", "ታደሰ", "ወልዴ", "ሃይሉ", "አሰፋ", "ተስፋዬ",
    "ማሞ", "ደስታ", "ገብረ", "ለማ", "በየነ", "ወልዴ", "ተክሌ", "አበበ"
  ];

  const relations = ["Head", "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandchild"];
  const relationsAm = ["ራስ", "ወይን", "ወንድ", "ሴት", "አባት", "እናት", "ወንድም", "እህት", "ልጅ ልጅ"];

  // Ethiopian locations
  const locations = [
    "Addis Ababa, Bole", "Addis Ababa, Kirkos", "Addis Ababa, Arada", "Addis Ababa, Yeka",
    "Addis Ababa, Nifas Silk", "Addis Ababa, Akaki", "Addis Ababa, Kolfe",
    "Dire Dawa", "Bahir Dar", "Gondar", "Hawassa", "Mekelle", "Adama", "Jimma",
    "Debre Birhan", "Dessie", "Shashamane", "Nekemte", "Arba Minch"
  ];

  console.log("Creating families and patients...");
  const families = [];
  const patients = [];

  // Create ~35 families with 2-5 members each
  for (let famIdx = 0; famIdx < 35; famIdx++) {
    const isAmharic = Math.random() < 0.6;
    const headFirst = isAmharic ? amharicMaleNames[randomInt(0, amharicMaleNames.length - 1)] : maleNames[randomInt(0, maleNames.length - 1)];
    const headLast = isAmharic ? amharicSurnames[randomInt(0, amharicSurnames.length - 1)] : surnames[randomInt(0, surnames.length - 1)];
    const headName = `${headFirst} ${headLast}`;
    const phone = `09${randomInt(10, 99)}${randomInt(100, 999)}${randomInt(1000, 9999)}`;
    const address = locations[randomInt(0, locations.length - 1)];
    const familyYear = weightedRandom([
      { value: ETH_YEAR, weight: 70 },
      { value: ETH_YEAR - 1, weight: 25 },
      { value: ETH_YEAR - 2, weight: 5 }
    ]);

    const family = await prisma.family.create({
      data: {
        familyCode: `YM-${familyYear}-${String(famIdx + 1).padStart(4, "0")}`,
        headName,
        phone,
        address,
        ethYear: familyYear,
        status: "active"
      }
    });
    families.push(family);

    // Head of family (patient)
    const headAge = randomInt(35, 65);
    const headBirthYear = familyYear - headAge;
    const headGender = "male";
    const headPatient = await prisma.patient.create({
      data: {
        familyId: family.id,
        fullName: headName,
        gender: headGender,
        ageOrBirth: headBirthYear.toString(),
        cardNo: `YM${randomInt(100000, 999999)}`,
        relationToHead: "Head",
        notes: isAmharic ? "የቤተሰብ ራስ" : "Head of household"
      }
    });
    patients.push(headPatient);

    // Spouse (80% chance)
    if (Math.random() < 0.8) {
      const spouseAge = headAge + randomInt(-5, 3);
      const spouseBirthYear = familyYear - spouseAge;
      const spouseFirst = isAmharic ? amharicFemaleNames[randomInt(0, amharicFemaleNames.length - 1)] : femaleNames[randomInt(0, femaleNames.length - 1)];
      const spouseName = `${spouseFirst} ${headLast}`;
      const spousePatient = await prisma.patient.create({
        data: {
          familyId: family.id,
          fullName: spouseName,
          gender: "female",
          ageOrBirth: spouseBirthYear.toString(),
          cardNo: `YM${randomInt(100000, 999999)}`,
          relationToHead: "Spouse",
          notes: isAmharic ? "ወይን" : "Spouse"
        }
      });
      patients.push(spousePatient);
    }

    // Children (1-3)
    const numChildren = randomInt(1, 3);
    for (let c = 0; c < numChildren; c++) {
      const childAge = randomInt(1, 18);
      const childBirthYear = familyYear - childAge;
      const isBoy = Math.random() < 0.5;
      const childFirst = isAmharic
        ? (isBoy ? amharicMaleNames[randomInt(0, amharicMaleNames.length - 1)] : amharicFemaleNames[randomInt(0, amharicFemaleNames.length - 1)])
        : (isBoy ? maleNames[randomInt(0, maleNames.length - 1)] : femaleNames[randomInt(0, femaleNames.length - 1)]);
      const childName = `${childFirst} ${headLast}`;
      const childPatient = await prisma.patient.create({
        data: {
          familyId: family.id,
          fullName: childName,
          gender: isBoy ? "male" : "female",
          ageOrBirth: childBirthYear.toString(),
          cardNo: `YM${randomInt(100000, 999999)}`,
          relationToHead: isBoy ? "Son" : "Daughter",
          notes: isAmharic ? (isBoy ? "ወንድ" : "ሴት") : (isBoy ? "Son" : "Daughter")
        }
      });
      patients.push(childPatient);
    }

    // Occasional elderly parent (10% chance)
    if (Math.random() < 0.1) {
      const parentAge = randomInt(70, 85);
      const parentBirthYear = familyYear - parentAge;
      const isMother = Math.random() < 0.6;
      const parentFirst = isAmharic
        ? (isMother ? amharicFemaleNames[randomInt(0, amharicFemaleNames.length - 1)] : amharicMaleNames[randomInt(0, amharicMaleNames.length - 1)])
        : (isMother ? femaleNames[randomInt(0, femaleNames.length - 1)] : maleNames[randomInt(0, maleNames.length - 1)]);
      const parentName = `${parentFirst} ${headLast}`;
      const parentPatient = await prisma.patient.create({
        data: {
          familyId: family.id,
          fullName: parentName,
          gender: isMother ? "female" : "male",
          ageOrBirth: parentBirthYear.toString(),
          cardNo: `YM${randomInt(100000, 999999)}`,
          relationToHead: isMother ? "Mother" : "Father",
          notes: isAmharic ? (isMother ? "እናት" : "አባት") : (isMother ? "Mother" : "Father")
        }
      });
      patients.push(parentPatient);
    }
  }

  console.log("  →", families.length, "families,", patients.length, "patients created");

  // Create expenses distributed across EC 2017 (all 13 months)
  // Seasonal patterns: more respiratory in cold months (Tir-Megabit), more diarrheal in rainy (Hamle-Nehase)
  const seasonalWeights = {
    1: { respiratory: 1.3, diarrheal: 0.8, chronic: 1.0, malaria: 0.5 },  // Meskerem
    2: { respiratory: 1.2, diarrheal: 0.9, chronic: 1.0, malaria: 0.5 },  // Tikimt
    3: { respiratory: 1.1, diarrheal: 1.0, chronic: 1.0, malaria: 0.6 },  // Hidar
    4: { respiratory: 1.3, diarrheal: 0.8, chronic: 1.0, malaria: 0.5 },  // Tahsas
    5: { respiratory: 1.4, diarrheal: 0.7, chronic: 1.0, malaria: 0.4 },  // Tir (coldest)
    6: { respiratory: 1.3, diarrheal: 0.8, chronic: 1.0, malaria: 0.5 },  // Yekatit
    7: { respiratory: 1.1, diarrheal: 1.0, chronic: 1.0, malaria: 0.7 },  // Megabit
    8: { respiratory: 1.0, diarrheal: 1.1, chronic: 1.0, malaria: 0.8 },  // Miyazya
    9: { respiratory: 0.9, diarrheal: 1.2, chronic: 1.0, malaria: 1.0 },  // Ginbot
    10: { respiratory: 0.8, diarrheal: 1.3, chronic: 1.0, malaria: 1.2 }, // Sene
    11: { respiratory: 0.7, diarrheal: 1.4, chronic: 1.0, malaria: 1.3 }, // Hamle (rainy peak)
    12: { respiratory: 0.7, diarrheal: 1.3, chronic: 1.0, malaria: 1.2 }, // Nehase
    13: { respiratory: 0.8, diarrheal: 1.1, chronic: 1.0, malaria: 1.0 }, // Pagume
  };

  // Medicine categories
  const respiratoryMeds = allMedicines.filter(m =>
    ["Amoxicillin 250mg", "Ciprofloxacin 500mg", "Doxycycline 100mg", "Cotrimoxazole 480mg", "Azithromycin 500mg"].includes(m.name)
  );
  const diarrhealMeds = allMedicines.filter(m =>
    ["ORS Sachet", "Ciprofloxacin 500mg", "Cotrimoxazole 480mg", "Metronidazole 250mg", "Zinc 20mg"].includes(m.name)
  );
  const chronicMeds = allMedicines.filter(m =>
    ["Metformin 500mg", "Hydrochlorothiazide 25mg", "Amlodipine 5mg", "Losartan 50mg", "Atorvastatin 20mg", "Folic Acid 5mg", "Ferrous Sulfate 200mg", "Vitamin B Complex"].includes(m.name)
  );
  const malariaMeds = allMedicines.filter(m =>
    ["Artemether-Lumefantrine", "Quinine 300mg", "Primaquine 15mg"].includes(m.name)
  );
  const painMeds = allMedicines.filter(m =>
    ["Paracetamol 500mg", "Ibuprofen 400mg", "Diclofenac 50mg"].includes(m.name)
  );
  const dewormingMeds = allMedicines.filter(m =>
    ["Albendazole 400mg", "Mebendazole 100mg"].includes(m.name)
  );
  const otherMeds = allMedicines.filter(m =>
    !respiratoryMeds.includes(m) && !diarrhealMeds.includes(m) && !chronicMeds.includes(m) &&
    !malariaMeds.includes(m) && !painMeds.includes(m) && !dewormingMeds.includes(m)
  );

  console.log("Creating expenses across EC", ETH_YEAR, "...");

  let totalExpenses = 0;
  const expenseCountByMonth = {};

  for (let month = 1; month <= ETH_MONTHS; month++) {
    expenseCountByMonth[month] = 0;
    const daysInMonth = month === 13 ? 6 : 30;
    const season = seasonalWeights[month];

    // Determine number of expense records for this month (higher in rainy season)
    const baseExpenses = month >= 10 && month <= 12 ? randomInt(180, 250) : randomInt(120, 180);
    const numExpenses = Math.floor(baseExpenses * (1 + (season.malaria - 1) * 0.2));

    for (let e = 0; e < numExpenses; e++) {
      const day = randomDateInMonth(ETH_YEAR, month);
      const ethDate = ethDateStr(ETH_YEAR, month, day);

      // Pick patient (weighted toward chronic patients = older)
      const patient = weightedRandom(
        patients.map(p => {
          const age = ETH_YEAR - parseInt(p.ageOrBirth) || 30;
          let weight = 1;
          if (age > 50) weight = 2.5; // chronic patients visit more
          else if (age < 5) weight = 1.5; // children
          else if (age > 65) weight = 3;
          return { value: p, weight };
        })
      );

      // Determine condition type based on season
      const condition = weightedRandom([
        { value: "respiratory", weight: 30 * season.respiratory },
        { value: "diarrheal", weight: 25 * season.diarrheal },
        { value: "chronic", weight: 20 * season.chronic },
        { value: "malaria", weight: 15 * season.malaria },
        { value: "pain", weight: 10 },
        { value: "deworming", weight: 5 },
        { value: "other", weight: 10 }
      ]);

      let medPool;
      switch (condition) {
        case "respiratory": medPool = respiratoryMeds.length ? respiratoryMeds : allMedicines; break;
        case "diarrheal": medPool = diarrhealMeds.length ? diarrhealMeds : allMedicines; break;
        case "chronic": medPool = chronicMeds.length ? chronicMeds : allMedicines; break;
        case "malaria": medPool = malariaMeds.length ? malariaMeds : allMedicines; break;
        case "pain": medPool = painMeds.length ? painMeds : allMedicines; break;
        case "deworming": medPool = dewormingMeds.length ? dewormingMeds : allMedicines; break;
        default: medPool = otherMeds.length ? otherMeds : allMedicines;
      }

      const medicine = medPool[randomInt(0, medPool.length - 1)];

      // Quantity varies by medicine type
      let quantity;
      if (medicine.unit === "inhaler") quantity = 1;
      else if (medicine.unit === "sachet") quantity = randomInt(5, 20);
      else if (medicine.unit === "cap" || medicine.unit === "tab") {
        if (condition === "chronic") quantity = randomInt(30, 90); // monthly supply
        else if (condition === "malaria") quantity = randomInt(6, 24); // full course
        else if (condition === "deworming") quantity = 1;
        else quantity = randomInt(10, 30);
      } else quantity = randomInt(1, 5);

      // Unit price with slight variation
      const basePrice = Number(medicine.pricePerUnit);
      const unitPrice = basePrice + (Math.random() - 0.5) * 0.5 * basePrice;

      const doctors = ["Dr. Alemu", "Dr. Bekele", "Dr. Tadesse", "Dr. Mulugeta", "Dr. Genet", "Dr. Solomon", "Nurse Tigist", "Nurse Abeba", "Health Officer"];
      const prescribedBy = doctors[randomInt(0, doctors.length - 1)];

      await prisma.expense.create({
        data: {
          patientId: patient.id,
          medicineId: medicine.id,
          quantity,
          unitPrice,
          totalCost: unitPrice * quantity,
          ethDate,
          ethYear: ETH_YEAR,
          ethMonth: month,
          ethDay: day,
          prescribedBy
        }
      });
      totalExpenses++;
      expenseCountByMonth[month]++;
    }
  }

  // Add some expenses in EC 2016 for year-over-year comparison
  console.log("Adding prior year (EC 2016) expenses for comparison...");
  const priorYearExpenses = randomInt(800, 1200);
  for (let e = 0; e < priorYearExpenses; e++) {
    const month = randomInt(1, 13);
    const daysInMonth = month === 13 ? 6 : 30;
    const day = randomInt(1, daysInMonth);
    const ethDate = ethDateStr(ETH_YEAR - 1, month, day);
    const patient = patients[randomInt(0, patients.length - 1)];
    const medicine = allMedicines[randomInt(0, allMedicines.length - 1)];
    const quantity = medicine.unit === "inhaler" ? 1 : randomInt(5, 30);
    const unitPrice = Number(medicine.pricePerUnit) + (Math.random() - 0.5) * 0.3 * Number(medicine.pricePerUnit);
    const doctors = ["Dr. Alemu", "Dr. Bekele", "Dr. Tadesse", "Dr. Mulugeta"];
    const prescribedBy = doctors[randomInt(0, doctors.length - 1)];

    await prisma.expense.create({
      data: {
        patientId: patient.id,
        medicineId: medicine.id,
        quantity,
        unitPrice,
        totalCost: unitPrice * quantity,
        ethDate,
        ethYear: ETH_YEAR - 1,
        ethMonth: month,
        ethDay: day,
        prescribedBy
      }
    });
  }

  console.log("\n✅ Seed complete!");
  console.log("  Families:", families.length);
  console.log("  Patients:", patients.length);
  console.log("  Medicines:", allMedicines.length);
  console.log("  Expenses (EC", ETH_YEAR, "):", totalExpenses);
  console.log("  Expenses (EC", ETH_YEAR - 1, "):", priorYearExpenses);
  console.log("\n📊 Monthly breakdown (EC", ETH_YEAR, "):");
  for (let m = 1; m <= ETH_MONTHS; m++) {
    const mName = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"][m - 1];
    console.log(`  ${mName.padEnd(10)} (${m}): ${expenseCountByMonth[m]} records`);
  }
  console.log("\n🔐 Default PIN: 0000");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());