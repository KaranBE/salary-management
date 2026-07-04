import { prisma } from '../src/lib/db';

// Define names databases for generating realistic data
const MALE_NAMES = [
  'John', 'David', 'Michael', 'James', 'Robert', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Amit', 'Rajesh', 'Vikram', 'Suresh', 'Rohan', 'Arjun', 'Rahul', 'Sanjay', 'Anil', 'Vijay',
  'Hiroshi', 'Takashi', 'Kenji', 'Akira', 'Yuto', 'Minoru', 'Daiki', 'Ren', 'Haruto', 'Sota',
  'Hans', 'Klaus', 'Dieter', 'Wolfgang', 'Stefan', 'Andreas', 'Peter', 'Thomas', 'Michael', 'Jürgen',
  'Oliver', 'Jack', 'Harry', 'George', 'Noah', 'Leo', 'Arthur', 'Oscar', 'Charlie', 'James'
];

const FEMALE_NAMES = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Priya', 'Sunita', 'Anjali', 'Deepika', 'Kavita', 'Neha', 'Ritu', 'Pooja', 'Aisha', 'Swati',
  'Sakura', 'Hana', 'Yuki', 'Yuka', 'Midori', 'Aiko', 'Mei', 'Yui', 'Rio', 'Hina',
  'Sabine', 'Monika', 'Ursula', 'Brigitte', 'Helga', 'Renate', 'Karin', 'Gisela', 'Ingrid', 'Petra',
  'Chloe', 'Olivia', 'Emily', 'Sophie', 'Isla', 'Ava', 'Isabella', 'Mia', 'Lily', 'Freya'
];

const NEUTRAL_NAMES = [
  'Alex', 'Sam', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Robin', 'Jamie', 'Pat', 'Kelly',
  'Avery', 'Riley', 'Rowan', 'Finley', 'Skyler', 'Dakota', 'Charlie', 'Emerson', 'Peyton', 'Hayden'
];

const US_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor'];
const INDIA_LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Joshi', 'Nair', 'Rao'];
const GERMANY_LAST_NAMES = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'];
const UK_LAST_NAMES = ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Davies', 'Evans', 'Thomas', 'Roberts'];
const JAPAN_LAST_NAMES = ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'];

// Departments & Roles with USD base salary bounds
const DEPARTMENTS = [
  {
    name: 'Engineering',
    weight: 0.45,
    roles: [
      { title: 'Software Engineer', weight: 0.60, minUSD: 60000, maxUSD: 110000 },
      { title: 'Senior Software Engineer', weight: 0.25, minUSD: 110000, maxUSD: 170000 },
      { title: 'QA Engineer', weight: 0.10, minUSD: 50000, maxUSD: 90000 },
      { title: 'Engineering Manager', weight: 0.05, minUSD: 130000, maxUSD: 210000 }
    ]
  },
  {
    name: 'Sales',
    weight: 0.20,
    roles: [
      { title: 'Sales Representative', weight: 0.70, minUSD: 45000, maxUSD: 80000 },
      { title: 'Account Manager', weight: 0.20, minUSD: 65000, maxUSD: 110000 },
      { title: 'Sales Director', weight: 0.10, minUSD: 120000, maxUSD: 190000 }
    ]
  },
  {
    name: 'Marketing',
    weight: 0.12,
    roles: [
      { title: 'Marketing Specialist', weight: 0.75, minUSD: 45000, maxUSD: 75000 },
      { title: 'Marketing Manager', weight: 0.20, minUSD: 70000, maxUSD: 115000 },
      { title: 'CMO', weight: 0.05, minUSD: 150000, maxUSD: 250000 }
    ]
  },
  {
    name: 'Product',
    weight: 0.10,
    roles: [
      { title: 'Product Designer', weight: 0.45, minUSD: 60000, maxUSD: 110000 },
      { title: 'Product Manager', weight: 0.45, minUSD: 80000, maxUSD: 135000 },
      { title: 'VP of Product', weight: 0.10, minUSD: 140000, maxUSD: 220000 }
    ]
  },
  {
    name: 'Human Resources',
    weight: 0.08,
    roles: [
      { title: 'HR Specialist', weight: 0.80, minUSD: 45000, maxUSD: 75000 },
      { title: 'HR Manager', weight: 0.15, minUSD: 70000, maxUSD: 115000 },
      { title: 'HR Director', weight: 0.05, minUSD: 120000, maxUSD: 180000 }
    ]
  },
  {
    name: 'Finance',
    weight: 0.05,
    roles: [
      { title: 'Financial Analyst', weight: 0.80, minUSD: 55000, maxUSD: 90000 },
      { title: 'Finance Manager', weight: 0.15, minUSD: 80000, maxUSD: 130000 },
      { title: 'CFO', weight: 0.05, minUSD: 160000, maxUSD: 260000 }
    ]
  }
];

// Country layout with exchange rates to USD and cost multipliers
const COUNTRIES = [
  { name: 'United States', code: 'US', currency: 'USD', rateToUSD: 1.0, multiplier: 1.0, lastNames: US_LAST_NAMES },
  { name: 'Germany', code: 'DE', currency: 'EUR', rateToUSD: 1.08, multiplier: 0.85, lastNames: GERMANY_LAST_NAMES },
  { name: 'India', code: 'IN', currency: 'INR', rateToUSD: 0.012, multiplier: 0.35, lastNames: INDIA_LAST_NAMES },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', rateToUSD: 1.27, multiplier: 0.85, lastNames: UK_LAST_NAMES },
  { name: 'Japan', code: 'JP', currency: 'JPY', rateToUSD: 0.0062, multiplier: 0.75, lastNames: JAPAN_LAST_NAMES }
];

// Helper to pick randomly based on weights
function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const r = Math.random();
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.weight;
    if (r <= cumulative) return item;
  }
  return items[items.length - 1];
}

function getRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function main() {
  console.log('Starting data seeding...');
  
  // DB connection is imported from src/lib/db

  try {
    // 1. Clean existing records
    console.log('Cleaning existing records...');
    await prisma.employee.deleteMany({});
    await prisma.exchangeRate.deleteMany({});

    // 2. Seed exchange rates
    console.log('Seeding exchange rates...');
    const exchangeRatesData = COUNTRIES.map(c => ({
      fromCurrency: c.currency,
      toCurrency: 'USD',
      rate: c.rateToUSD
    }));
    
    // De-duplicate rates (EUR, INR, GBP, JPY, USD)
    const uniqueRates = Array.from(new Map(exchangeRatesData.map(item => [item.fromCurrency, item])).values());
    for (const rate of uniqueRates) {
      await prisma.exchangeRate.create({ data: rate });
    }

    // 3. Generate 10,000 employees
    console.log('Generating 10,000 employees...');
    const employees = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < 10000; i++) {
      // Pick Country (proportional distribution)
      // Country weights: US 40%, India 30%, Germany 10%, UK 10%, Japan 10%
      const countryWeights = [
        { ...COUNTRIES[0], weight: 0.40 }, // US
        { ...COUNTRIES[2], weight: 0.30 }, // India
        { ...COUNTRIES[1], weight: 0.10 }, // Germany
        { ...COUNTRIES[3], weight: 0.10 }, // UK
        { ...COUNTRIES[4], weight: 0.10 }  // Japan
      ];
      const country = pickWeighted(countryWeights);

      // Pick Department & Role
      const dept = pickWeighted(DEPARTMENTS);
      const role = pickWeighted(dept.roles);

      // Determine Gender: Female (48%), Male (48%), Non-binary (4%)
      const genderRand = Math.random();
      let gender = 'Non-binary';
      let firstName = '';
      if (genderRand < 0.48) {
        gender = 'Male';
        firstName = MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
      } else if (genderRand < 0.96) {
        gender = 'Female';
        firstName = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
      } else {
        firstName = NEUTRAL_NAMES[Math.floor(Math.random() * NEUTRAL_NAMES.length)];
      }

      const lastName = country.lastNames[Math.floor(Math.random() * country.lastNames.length)];
      
      // Ensure unique email
      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.com`;
      let suffix = 1;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${suffix}@acme.com`;
        suffix++;
      }
      usedEmails.add(email);

      // Calculate salary in USD base
      let salaryUSD = getRandomBetween(role.minUSD, role.maxUSD);
      
      // Apply Country cost multiplier
      salaryUSD *= country.multiplier;

      // Introduce a slight gender pay gap in Sales & Marketing for analytical interest
      if (gender === 'Female' && (dept.name === 'Sales' || dept.name === 'Marketing')) {
        salaryUSD *= 0.93; // 7% gap on average
      }

      // Convert USD base to local currency
      let localSalary = salaryUSD / country.rateToUSD;

      // Neaten local salary numbers
      if (country.currency === 'JPY') {
        localSalary = Math.round(localSalary / 10000) * 10000; // Round to nearest 10k JPY
      } else {
        localSalary = Math.round(localSalary / 100) * 100; // Round to nearest 100
      }

      // Ensure a reasonable floor
      localSalary = Math.max(localSalary, 1000);

      // 25% of employees have got a previous salary (indicating a recent pay raise)
      let previousSalary: number | null = null;
      let salaryUpdatedAt = new Date();
      if (Math.random() < 0.25) {
        // Got a raise of 5-15%
        const raisePercentage = getRandomBetween(0.05, 0.15);
        previousSalary = Math.round((localSalary / (1 + raisePercentage)) * 100) / 100;
        
        // Got this raise in the last 12 months
        const monthsAgo = getRandomBetween(1, 11);
        salaryUpdatedAt = new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000);
      }

      employees.push({
        firstName,
        lastName,
        email,
        gender,
        jobTitle: role.title,
        department: dept.name,
        country: country.name,
        currency: country.currency,
        salary: localSalary,
        previousSalary,
        salaryUpdatedAt,
        createdAt: new Date(Date.now() - getRandomBetween(12, 60) * 30 * 24 * 60 * 60 * 1000) // Joined 1-5 years ago
      });
    }

    // Insert in chunks to satisfy SQLite parameter limits
    const chunkSize = 1000;
    console.log(`Inserting 10,000 employee records in chunks of ${chunkSize}...`);
    for (let i = 0; i < employees.length; i += chunkSize) {
      const chunk = employees.slice(i, i + chunkSize);
      await prisma.employee.createMany({
        data: chunk
      });
      console.log(`Inserted chunk ${i / chunkSize + 1}/${employees.length / chunkSize}`);
    }

    console.log('Seeding completed successfully!');
    const employeeCount = await prisma.employee.count();
    const rateCount = await prisma.exchangeRate.count();
    console.log(`Total employees in DB: ${employeeCount}`);
    console.log(`Total exchange rates in DB: ${rateCount}`);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
