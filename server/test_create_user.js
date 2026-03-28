const testCreateUser = async () => {
  try {
    // 1. Login as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@atlas.academy',
        password: 'AtlasAdmin2024!'
      }),
    });
    
    if (!loginRes.ok) {
      console.error('FAILURE: Admin login failed');
      return;
    }
    
    const adminData = await loginRes.json();
    const token = adminData.token;
    console.log('SUCCESS: Logged in as admin');

    // 2. Create a test user
    const createRes = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Account',
        email: `test_account_${Date.now()}@example.com`,
        role: 'student',
        grade: 'CP',
        password: 'password123'
      }),
    });
    
    if (createRes.ok) {
      const data = await createRes.json();
      console.log('SUCCESS: User created:', data);
    } else {
      const errorData = await createRes.json();
      console.log('FAILURE: API error:', createRes.status, errorData);
    }
  } catch (err) {
     console.error('FAILURE:', err.message);
  }
};

testCreateUser();
