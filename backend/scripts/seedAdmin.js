require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');

  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const exists = await User.findOne({ email, deletedAt: null });

  if (exists) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const user = await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'change-this-password',
    role: 'admin',
    provider: 'local',
    isVerified: true,
    isPortfolioProfile: true,
  });

  console.log(`Admin created: ${user.email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
