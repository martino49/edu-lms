const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

async function runSqlFile() {
    // Determine the absolute path to database.sql relative to this script
    const sqlPath = path.resolve(__dirname, '../database.sql');
    const dbName = process.env.DB_NAME || 'edulms_project';

    try {
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        console.log('Reading database.sql...');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Connecting to MySQL server...');
        // Connect without database selected first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            multipleStatements: true,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
        });

        console.log(`Creating database '${dbName}' if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

        console.log(`Using database '${dbName}'...`);
        await connection.query(`USE \`${dbName}\`;`);

        console.log('Executing SQL script...');
        await connection.query(sql);

        console.log('Database initialization completed successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error executing database script:', error);
        process.exit(1);
    }
}

runSqlFile();
