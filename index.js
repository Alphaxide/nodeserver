const { Pool } = require('pg');

// Create a pool with the external database URL from environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Adjust this if required by your provider
  }
});

// Function to create tables
async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // Example table creation queries
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        model VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255) UNIQUE,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
        issue_description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT'); // End transaction
    console.log('Tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback in case of error
    console.error('Error creating tables:', error);
  } finally {
    client.release(); // Release the client back to the pool
  }
}

// Run the table creation function
createTables().catch(err => console.error('Unexpected error:', err));
