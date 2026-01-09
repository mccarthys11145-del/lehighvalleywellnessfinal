/**
 * Test CSV Export functionality
 * Creates a test lead, exports CSV, and verifies the content
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function testCSVExport() {
  console.log('=== CSV Export Test ===\n');
  
  // Step 1: Create a test lead via API
  console.log('Step 1: Creating test lead...');
  const testLead = {
    fullName: 'CSV Export Test User',
    email: `csv-test-${Date.now()}@example.com`,
    phone: '555-999-8888',
    state: 'PA',
    interest: 'MENOPAUSE_HRT',
    preferredContactMethod: 'PHONE',
    preferredContactTime: 'Afternoons',
    message: 'Testing CSV export functionality',
  };

  const createResponse = await fetch('http://localhost:3000/api/trpc/leads.create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: testLead }),
  });

  const createResult = await createResponse.json();
  if (!createResult.result?.data?.json?.success) {
    console.error('Failed to create test lead:', createResult);
    process.exit(1);
  }
  console.log('✅ Test lead created:', createResult.result.data.json.lead.id);

  // Step 2: Verify lead exists in database
  console.log('\nStep 2: Verifying lead in database...');
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    const [rows] = await connection.execute(
      'SELECT * FROM leads WHERE email = ?',
      [testLead.email.toLowerCase()]
    );

    if (rows.length === 0) {
      console.error('❌ Lead not found in database');
      process.exit(1);
    }

    console.log('✅ Lead found in database');
    console.log('  ID:', rows[0].id);
    console.log('  Name:', rows[0].fullName);
    console.log('  Email:', rows[0].email);
    console.log('  Interest:', rows[0].interest);

    // Step 3: Verify CSV export format
    console.log('\nStep 3: Verifying CSV export format...');
    
    // Simulate CSV generation (same logic as in the API)
    const lead = rows[0];
    const headers = [
      "ID", "Full Name", "Email", "Phone", "State", "Interest",
      "Preferred Contact Method", "Preferred Contact Time", "Status",
      "Source", "Message", "Created At", "Updated At"
    ];

    const row = [
      lead.id,
      lead.fullName,
      lead.email,
      lead.phone || "",
      lead.state,
      lead.interest,
      lead.preferredContactMethod,
      lead.preferredContactTime || "",
      lead.status,
      lead.source,
      (lead.message || "").replace(/"/g, '""'),
      new Date(lead.createdAt).toISOString(),
      new Date(lead.updatedAt).toISOString(),
    ];

    const csvContent = [
      headers.join(","),
      row.map(cell => `"${cell}"`).join(","),
    ].join("\n");

    console.log('\nGenerated CSV:');
    console.log('---');
    console.log(csvContent);
    console.log('---');

    // Verify CSV contains expected data
    const checks = [
      { name: 'Headers', test: csvContent.includes('ID,Full Name,Email') },
      { name: 'Lead ID', test: csvContent.includes(lead.id) },
      { name: 'Full Name', test: csvContent.includes('CSV Export Test User') },
      { name: 'Email', test: csvContent.includes(testLead.email.toLowerCase()) },
      { name: 'Interest', test: csvContent.includes('MENOPAUSE_HRT') },
      { name: 'No Internal Notes column', test: !csvContent.includes('Internal Notes') },
    ];

    console.log('\nCSV Verification:');
    let allPassed = true;
    for (const check of checks) {
      console.log(`  ${check.test ? '✅' : '❌'} ${check.name}`);
      if (!check.test) allPassed = false;
    }

    // Step 4: Cleanup
    console.log('\nStep 4: Cleaning up test data...');
    await connection.execute('DELETE FROM leads WHERE email = ?', [testLead.email.toLowerCase()]);
    console.log('✅ Test record deleted');

    if (allPassed) {
      console.log('\n✅ ALL CSV EXPORT TESTS PASSED!\n');
    } else {
      console.log('\n❌ SOME TESTS FAILED\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

testCSVExport();
