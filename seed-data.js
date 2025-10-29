const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'stellar_db'
  });

  try {
    console.log('Connected to database');

    // Check if site exists
    const [sites] = await connection.execute('SELECT id FROM site WHERE id = 1');

    if (sites.length === 0) {
      console.log('Creating site with id=1...');
      await connection.execute(`
        INSERT INTO site (id, name, description, rfc, address, phone_number, whatsapp_number, email, due_date, monthly_payment, currency, zip_code, status)
        VALUES (1, 'Sitio Principal', 'Sitio de prueba', 'ABC123456789', 'Dirección de prueba 123', '5512345678', '5512345678', 'sitio@test.com', '2025-12-31', 1000.00, 'MXN', '12345', 'ACTIVE')
      `);
      console.log('✓ Site created successfully');
    } else {
      console.log('✓ Site already exists');
    }

    // Check if user exists
    const [users] = await connection.execute('SELECT id FROM user WHERE email = ?', ['admin@test.com']);

    if (users.length === 0) {
      console.log('Creating user admin@test.com...');
      // Password: "password" hashed with bcrypt
      const hashedPassword = '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa';
      await connection.execute(`
        INSERT INTO user (site_id, email, name, last_name, password, phone_number, role, status)
        VALUES (1, 'admin@test.com', 'Admin', 'Test', ?, '5512345678', 'SUPER_ADMIN', 'ACTIVE')
      `, [hashedPassword]);
      console.log('✓ User created successfully');
      console.log('  Email: admin@test.com');
      console.log('  Password: password');
    } else {
      console.log('✓ User already exists');
    }

    console.log('\n=== Database seeded successfully! ===');
    console.log('You can now login with:');
    console.log('  Email: admin@test.com');
    console.log('  Password: password');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

seedData();
