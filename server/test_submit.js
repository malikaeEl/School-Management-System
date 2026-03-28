const testSubmit = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admissions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: 'Test Student',
        grade: 'CP',
        parentName: 'Test Parent',
        email: 'test@example.com',
        phone: '0600000000',
        message: 'Test message'
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('SUCCESS: Admission submitted:', data);
    } else {
      const errorData = await response.json();
      console.log('FAILURE: API error:', errorData);
    }
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
        console.error('FAILURE: Server is not running on port 5000');
    } else {
        console.error('FAILURE: Unknown error:', err.message);
    }
  }
};

testSubmit();
