const db = require('../app/controllers/config/db');

async function createAttendanceTable() {
    try {
        console.log('Creating attendance table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT NOT NULL AUTO_INCREMENT,
                course_id INT NOT NULL,
                student_id INT NOT NULL,
                date DATE NOT NULL,
                status ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY unique_daily_attendance (course_id, student_id, date),
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Attendance table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating attendance table:', error);
        process.exit(1);
    }
}

createAttendanceTable();
