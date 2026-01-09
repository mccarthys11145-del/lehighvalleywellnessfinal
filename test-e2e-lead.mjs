/**
 * End-to-end test: Submit contact form and verify lead appears in database
 * 
 * This script:
 * 1. Submits a test lead via the API
 * 2. Queries the database to verify the lead was created
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Test data
const testLead = {
  fullName: 'E2E Test User',
  email: `e2e-test-${Date.now()}@example.com`,
  phone: '555-123-4567',
  state: 'PA',
  interest: 'WEIGHT_LOSS',
  preferredContactMethod: 'EMAIL',
  preferredContactTime: 'Mornings',
  message: 'This is an end-to-end test submission.',
};

async function runTest() {
  console.log('=== End-to-End Lead Submission Test ===\n');
  
  // Step 1: Submit via API
  console.log('Step 1: Submitting lead via API...');
  console.log('Test data:', JSON.stringify(testLead, null, 2));
  
  const apiUrl = 'http://localhost:3000/api/trpc/leads.create';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ json: testLead }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', result);
      process.exit(1);
    }
    
    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log('✅ Lead submitted successfully via API\n');
    
  } catch (error) {
    console.error('Failed to submit via API:', error.message);
    process.exit(1);
  }
  
  // Step 2: Verify in database
  console.log('Step 2: Verifying lead in database...');
  
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    
    const [rows] = await connection.execute(
      'SELECT * FROM leads WHERE email = ? ORDER BY createdAt DESC LIMIT 1',
      [testLead.email.toLowerCase()]
    );
    
    if (rows.length === 0) {
      console.error('❌ Lead NOT found in database!');
      process.exit(1);
    }
    
    const dbLead = rows[0];
    console.log('\nDatabase record found:');
    console.log('  ID:', dbLead.id);
    console.log('  Full Name:', dbLead.fullName);
    console.log('  Email:', dbLead.email);
    console.log('  Phone:', dbLead.phone);
    console.log('  State:', dbLead.state);
    console.log('  Interest:', dbLead.interest);
    console.log('  Preferred Contact:', dbLead.preferredContactMethod);
    console.log('  Status:', dbLead.status);
    console.log('  Created At:', dbLead.createdAt);
    
    // Verify data matches
    const checks = [
      { field: 'fullName', expected: testLead.fullName, actual: dbLead.fullName },
      { field: 'email', expected: testLead.email.toLowerCase(), actual: dbLead.email },
      { field: 'state', expected: testLead.state, actual: dbLead.state },
      { field: 'interest', expected: testLead.interest, actual: dbLead.interest },
      { field: 'status', expected: 'NEW', actual: dbLead.status },
    ];
    
    console.log('\nData verification:');
    let allPassed = true;
    for (const check of checks) {
      const passed = check.expected === check.actual;
      console.log(`  ${passed ? '✅' : '❌'} ${check.field}: ${check.actual} ${passed ? '' : `(expected: ${check.expected})`}`);
      if (!passed) allPassed = false;
    }
    
    if (allPassed) {
      console.log('\n✅ ALL CHECKS PASSED - Lead successfully written to database!\n');
    } else {
      console.log('\n❌ SOME CHECKS FAILED\n');
      process.exit(1);
    }
    
    // Cleanup: Delete test record
    console.log('Step 3: Cleaning up test data...');
    await connection.execute('DELETE FROM leads WHERE email = ?', [testLead.email.toLowerCase()]);
    console.log('✅ Test record deleted\n');
    
    console.log('=== End-to-End Test Complete ===');
    
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runTest();
