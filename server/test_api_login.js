async function testApiLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@atlas.academy',
        password: 'AtlasAdmin2024!'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('API Login SUCCESS:', data);
    } else {
      console.log('API Login FAILED (HTTP ' + response.status + '):', data);
    }
    process.exit(0);
  } catch (err) {
    console.error('API Login ERROR:', err.message);
    process.exit(1);
  }
}

testApiLogin();
