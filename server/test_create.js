import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function testCreate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const rawPassword = 'testpassword';
    const email = 'test_debug_' + Date.now() + '@example.com';

    let user;
    try {
      user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email,
        password: rawPassword,
        role: 'student',
        grade: 'CP',
        phone: '123456',
        parentId: null,
      });
      console.log('User created successfully via raw Mongoose!');
    } catch (e) {
      console.error('Mongoose Create Error:', e);
      process.exit(1);
    }
    
    // Test the create endpoint from frontend perspective
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Make request to endpoint to create a second user (this acts like the frontend calling creating users)
    console.log('\n--- Testing API Endpoint ---');
    const axios = (await import('axios')).default;
    
    // We set the created user to 'admin' so it has permissions
    user.role = 'admin';
    await user.save();

    console.log('Calling POST /api/users...');
    try {
      const res = await axios.post('http://localhost:5000/api/users', {
        firstName: 'Another',
        lastName: 'Test',
        email: 'another_debug_' + Date.now() + '@example.com',
        role: 'student',
        grade: 'CE1'
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      console.log('API Request Success!', res.data);
    } catch (e) {
      console.error('API Error Response:', e.response?.data || e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  }
}

testCreate();
