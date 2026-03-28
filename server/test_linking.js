import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  try {
    // Authenticate as Admin
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@atlas.academy',
        password: 'AtlasAdmin2024!'
      })
    });
    
    if (!loginRes.ok) throw new Error('Admin login failed');
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('SUCCESS: Logged in as admin');

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const ts = Date.now();

    // 1. Create a Parent
    const parentRes = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName: 'Papa',
        lastName: 'Test',
        email: `papa_${ts}@example.com`,
        role: 'parent'
      })
    });
    
    if (!parentRes.ok) {
      const err = await parentRes.json();
      throw new Error(`Parent creation failed: ${err.message}`);
    }
    const parentData = await parentRes.json();
    const parentId = parentData._id;
    console.log(`SUCCESS: Created parent ${parentId}`);

    // 2. Create Student WITHOUT login
    const studentNoLoginRes = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName: 'Enfant1',
        lastName: 'Test',
        role: 'student',
        grade: 'CP',
        parentId: parentId,
        hasLogin: false
      })
    });
    
    if (!studentNoLoginRes.ok) {
        const err = await studentNoLoginRes.json();
        throw new Error(`Student1 creation failed: ${err.message}`);
    }
    const student1Data = await studentNoLoginRes.json();
    console.log(`SUCCESS: Created student WITHOUT login: ${student1Data._id}`);

    // 3. Create Student WITH login
    const studentWithLoginRes = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName: 'Enfant2',
        lastName: 'Test',
        email: `enfant2_${ts}@example.com`,
        role: 'student',
        grade: 'CE1',
        parentId: parentId,
        hasLogin: true
      })
    });
    
    if (!studentWithLoginRes.ok) {
        const err = await studentWithLoginRes.json();
        throw new Error(`Student2 creation failed: ${err.message}`);
    }
    const student2Data = await studentWithLoginRes.json();
    console.log(`SUCCESS: Created student WITH login: ${student2Data._id}`);

    // Verify DB
    await mongoose.connect(process.env.MONGODB_URI);
    const kids = await User.find({ parentId });
    console.log(`FOUND IN DB: ${kids.length} children for parent ${parentId}`);
    for (const kid of kids) {
      console.log(` - Kid: ${kid.firstName}, Email: ${kid.email || 'NO_EMAIL'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('TEST FAILED:', error.message);
    process.exit(1);
  }
};

runTests();
