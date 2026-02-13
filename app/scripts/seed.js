
const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

// Define Schemas locally for the script to avoid TS/Module issues in standalone run
const CourseSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  modules: [{
    title: { type: String },
    lessons: [{
      id: { type: String },
      title: { type: String },
      type: { type: String, enum: ['video', 'text', 'challenge'] },
      content: { type: String },
      xp: { type: Number },
      initialCode: { type: String },
      testCode: { type: String }
    }]
  }]
}, { timestamps: true });

const Course = models.Course || model('Course', CourseSchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
}

const courses = [
  {
    id: 'solana-fundamentals',
    slug: 'solana-fundamentals',
    title: 'Solana Fundamentals',
    description: 'Master the basics of Solana development, from accounts to transactions.',
    modules: [
      {
        title: 'Module 1: Introduction',
        lessons: [
            {
                id: 'l1',
                title: 'Welcome to Solana',
                slug: 'welcome',
                type: 'text',
                content: '# Welcome to Solana\n\nSolana is a blockchain built for mass adoption. It is a high-performance network that is utilized for a range of use cases, including finance, NFTs, payments, and gaming.\n\n## Key Concepts\n- **High Throughput**: 65,000+ TPS\n- **Low Latency**: ~400ms block times\n- **Low Cost**: <$0.01 per transaction',
                xp: 10
            },
            {
                id: 'l2',
                title: 'Your First Program',
                slug: 'first-program',
                type: 'challenge',
                content: 'Write a TypeScript function that logs "Hello Solana" to the console.',
                initialCode: 'function main() {\n  // Write your code here\n}',
                testCode: 'expect(main()).toBe(undefined); // console.log returns undefined, we check output logs in runner',
                xp: 50
            },
            {
                id: 'l3',
                title: 'Solana Quiz',
                slug: 'solana-quiz',
                type: 'quiz',
                content: 'Test your knowledge about Solana basics.',
                xp: 20,
                questions: [
                    {
                        question: 'What is the approximate throughput of Solana?',
                        options: ['10 TPS', '65,000+ TPS', '1,000 TPS', '100 TPS'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which programming language is primarily used for Solana smart contracts?',
                        options: ['Solidity', 'Python', 'Rust', 'Java'],
                        correctAnswer: 2
                    }
                ]
            }
        ]
      }
    ],
    tags: ['Blockchain', 'Protocol'],
    difficulty: 'Beginner',
    duration: '2h'
  },
  {
    id: 'rust-for-solana',
    slug: 'rust-for-solana',
    title: 'Rust for Solana',
    description: 'Learn the Rust programming language specifically for Solana smart contracts.',
    modules: [
        {
            title: 'Module 1: Rust Basics',
            lessons: [
                {
                    id: 'r1',
                    title: 'Variables & Mutability',
                    slug: 'variables',
                    type: 'text',
                    content: '# Variables in Rust\n\nBy default, variables are immutable in Rust. This pushes you to write safer code.',
                    xp: 20
                }
            ]
        }
    ],
    tags: ['Rust', 'Smart Contracts'],
    difficulty: 'Intermediate',
    duration: '4h'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Seed cleanup and insertion logic remains same, just ensuring data structure matches new schema
    console.log('Clearing old courses...');
    await Course.deleteMany({});

    console.log('Seeding courses...');
    await Course.insertMany(courses);

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
