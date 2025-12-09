const db = require('../app/controllers/config/db');

async function createPaymentsTable() {
    try {
        console.log('Creating payments table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT NOT NULL AUTO_INCREMENT,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'credit_card',
                status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
                transaction_id VARCHAR(255),
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Payments table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating payments table:', error);
        process.exit(1);
    }
}

createPaymentsTable();
