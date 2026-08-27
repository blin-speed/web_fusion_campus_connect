import { initDB } from './schema';

export const SEED_USERS = [
  {
    id: 'u1',
    name: 'Aisha',
    trustScore: 4.5,
    ratingsCount: 10,
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    verificationStatus: 'verified',
  },
  {
    id: 'u2',
    name: 'Rohan',
    trustScore: 4.0,
    ratingsCount: 8,
    department: 'Electrical Engineering',
    year: '4th Year',
    verificationStatus: 'verified',
  },
  {
    id: 'u3',
    name: 'Meera',
    trustScore: 4.8,
    ratingsCount: 15,
    department: 'Film & Media Studies',
    year: '2nd Year',
    verificationStatus: 'verified',
  },
  {
    id: 'u4',
    name: 'Kabir',
    trustScore: 3.9,
    ratingsCount: 7,
    department: 'Mechanical Engineering',
    year: '3rd Year',
    verificationStatus: 'verified',
  },
  {
    id: 'u5',
    name: 'Diya',
    trustScore: 4.2,
    ratingsCount: 12,
    department: 'Civil Engineering',
    year: '4th Year',
    verificationStatus: 'verified',
  },
];

export const SEED_POSTS = [
  // Filming Equipment (3)
  {
    id: 'post-1',
    ownerId: 'u1',
    title: 'Sony Alpha DSLR Camera Kit',
    channel: 'Filming Equipment',
    itemName: 'camera',
    description: 'Sony Alpha DSLR with 18-55mm lens and battery charger. Great for class video projects.',
    borrowingCost: 250,
    securityDeposit: 1500,
    location: 'Media Arts Lab, Room 104',
    status: 'available',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'post-2',
    ownerId: 'u2',
    title: 'Heavy-Duty Aluminum Tripod',
    channel: 'Filming Equipment',
    itemName: 'tripod',
    description: 'Extendable to 60 inches, fluid pan head, quick release plate included.',
    borrowingCost: 100,
    securityDeposit: 500,
    location: 'Hostel 3, Ground Floor Lounge',
    status: 'available',
    createdAt: '2026-08-21T11:30:00.000Z',
  },
  {
    id: 'post-3',
    ownerId: 'u3',
    title: 'Dimmable LED Ring Light with Stand',
    channel: 'Filming Equipment',
    itemName: 'ring light',
    description: '10-inch USB-powered ring light with 3 color modes and phone mount.',
    borrowingCost: 80,
    securityDeposit: 400,
    location: 'Girls Hostel B, Block 2',
    status: 'available',
    createdAt: '2026-08-22T09:15:00.000Z',
  },

  // Stationery (3)
  {
    id: 'post-4',
    ownerId: 'u4',
    title: 'Engineering Mini Drafter Set',
    channel: 'Stationery',
    itemName: 'drafter',
    description: 'Precision engineering mini drafter with clamp and scale ruler in protective case.',
    borrowingCost: 60,
    securityDeposit: 300,
    location: 'Mechanical Engineering Workshop',
    status: 'available',
    createdAt: '2026-08-22T14:00:00.000Z',
  },
  {
    id: 'post-5',
    ownerId: 'u5',
    title: 'Casio fx-991EX Scientific Calculator',
    channel: 'Stationery',
    itemName: 'calculator',
    description: 'High-resolution scientific calculator, ideal for calculus and linear algebra exams.',
    borrowingCost: 50,
    securityDeposit: 400,
    location: 'Central Library, 2nd Floor Study Area',
    status: 'available',
    createdAt: '2026-08-23T08:45:00.000Z',
  },
  {
    id: 'post-6',
    ownerId: 'u1',
    title: 'Pastel Highlighter Pack (Set of 6)',
    channel: 'Stationery',
    itemName: 'highlighter',
    description: 'Assorted pastel chisel-tip markers for note-taking and revision.',
    borrowingCost: 20,
    securityDeposit: 100,
    location: 'Hostel 1, Room 312',
    status: 'available',
    createdAt: '2026-08-23T16:20:00.000Z',
  },

  // Computers & Electronics (3)
  {
    id: 'post-7',
    ownerId: 'u2',
    title: '65W USB-C Fast Laptop Charger',
    channel: 'Computers & Electronics',
    itemName: 'charger',
    description: 'Universal 65W PD charger with 6ft braided USB-C cable. Compatible with Mac and ThinkPad.',
    borrowingCost: 90,
    securityDeposit: 600,
    location: 'Computer Center, Lab 3',
    status: 'available',
    createdAt: '2026-08-24T12:00:00.000Z',
  },
  {
    id: 'post-8',
    ownerId: 'u3',
    title: 'Logitech Wireless Ergonomic Mouse',
    channel: 'Computers & Electronics',
    itemName: 'mouse',
    description: 'Silent click Bluetooth & 2.4GHz wireless mouse with fresh battery.',
    borrowingCost: 50,
    securityDeposit: 350,
    location: 'Student Activity Center (SAC)',
    status: 'available',
    createdAt: '2026-08-24T15:10:00.000Z',
  },
  {
    id: 'post-9',
    ownerId: 'u4',
    title: 'High-Speed 4K HDMI Cable (2m)',
    channel: 'Computers & Electronics',
    itemName: 'hdmi cable',
    description: 'Gold-plated 6ft HDMI cable for monitor connection or classroom presentations.',
    borrowingCost: 30,
    securityDeposit: 150,
    location: 'Hostel 4, Common Room',
    status: 'available',
    createdAt: '2026-08-25T10:30:00.000Z',
  },

  // Books & Study Material (2)
  {
    id: 'post-10',
    ownerId: 'u5',
    title: 'Algorithms & Data Structures (CLRS 4th Ed)',
    channel: 'Books & Study Material',
    itemName: 'reference book',
    description: 'Standard computer science reference textbook, clean pages with no markings.',
    borrowingCost: 120,
    securityDeposit: 700,
    location: 'Department of Computer Science, 1st Floor',
    status: 'available',
    createdAt: '2026-08-25T13:40:00.000Z',
  },
  {
    id: 'post-11',
    ownerId: 'u1',
    title: 'Digital Signal Processing Lab Manual',
    channel: 'Books & Study Material',
    itemName: 'lab manual',
    description: 'Spiral-bound MATLAB DSP lab workbook covering Fourier transforms and filters.',
    borrowingCost: 40,
    securityDeposit: 200,
    location: 'ECE Department Corridor',
    status: 'available',
    createdAt: '2026-08-26T09:00:00.000Z',
  },

  // Sports & Outdoor (1)
  {
    id: 'post-12',
    ownerId: 'u2',
    title: 'Yonex Nanoray Badminton Racket',
    channel: 'Sports & Outdoor',
    itemName: 'badminton racket',
    description: 'Lightweight carbon graphite racket with head cover and freshly gripped handle.',
    borrowingCost: 80,
    securityDeposit: 500,
    location: 'Campus Sports Complex / Badminton Courts',
    status: 'available',
    createdAt: '2026-08-26T17:00:00.000Z',
  },
];

export async function seedIfEmpty() {
  const db = await initDB();

  // Check if users store already has data
  const existingUsers = await db.getAll('users');
  if (existingUsers && existingUsers.length > 0) {
    // Ensure existing users have department, year, verificationStatus
    for (const u of existingUsers) {
      let updated = false;
      const seedMatch = SEED_USERS.find((su) => su.id === u.id);
      if (!u.department) {
        u.department = seedMatch?.department || 'General Studies';
        updated = true;
      }
      if (!u.year) {
        u.year = seedMatch?.year || '1st Year';
        updated = true;
      }
      if (!u.verificationStatus) {
        u.verificationStatus = 'verified';
        updated = true;
      }
      if (updated) {
        await db.put('users', u);
      }
    }

    // Ensure existing posts have borrowingCost, securityDeposit, and location
    const existingPosts = await db.getAll('posts');
    for (const p of existingPosts) {
      let updated = false;
      const seedMatch = SEED_POSTS.find((sp) => sp.id === p.id);
      if (p.borrowingCost === undefined) {
        p.borrowingCost = seedMatch?.borrowingCost || 50;
        updated = true;
      }
      if (p.securityDeposit === undefined) {
        p.securityDeposit = seedMatch?.securityDeposit || 300;
        updated = true;
      }
      if (!p.location) {
        p.location = seedMatch?.location || 'Campus Main Library';
        updated = true;
      }
      if (updated) {
        await db.put('posts', p);
      }
    }
    return;
  }

  // Populate users
  const txUsers = db.transaction('users', 'readwrite');
  for (const user of SEED_USERS) {
    await txUsers.store.put(user);
  }
  await txUsers.done;

  // Populate posts
  const txPosts = db.transaction('posts', 'readwrite');
  for (const post of SEED_POSTS) {
    await txPosts.store.put(post);
  }
  await txPosts.done;
}
