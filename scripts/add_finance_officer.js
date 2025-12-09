const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addFinanceOfficer() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'edulms_project',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    try {
        console.log('Adding "Finance Officer" role...');
        // Insert role if not exists
        await connection.execute(
            `INSERT IGNORE INTO roles (name) VALUES ('Finance Officer')`
        );

        // Get Role ID
        const [rows] = await connection.execute(
            `SELECT id FROM roles WHERE name = 'Finance Officer'`
        );

        if (rows.length === 0) {
            throw new Error('Failed to retrieve Finance Officer role ID');
        }
        const roleId = rows[0].id;
        console.log(`Finance Officer Role ID: ${roleId}`);

        // Check if user exists
        const email = 'finance@edulms.com';
        const [users] = await connection.execute(
            `SELECT id FROM users WHERE email = ?`, [email]
        );

        if (users.length > 0) {
            console.log('Finance Officer user already exists.');
        } else {
            console.log('Creating Finance Officer user...');
            const password = 'password123';
            const hashedPassword = await bcrypt.hash(password, 10);

            await connection.execute(
                `INSERT INTO users (name, email, password, role_id, is_active) VALUES (?, ?, ?, ?, 1)`,
                ['Finance Officer', email, hashedPassword, roleId]
            );
            console.log(`Finance Officer user created with email: ${email} and password: ${password}`);
        }

        console.log('Database update completed successfully.');
    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

addFinanceOfficer();
