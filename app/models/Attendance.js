const db = require('../controllers/config/db');

class Attendance {
    static async mark(data) {
        const { courseId, studentId, date, status } = data;
        const [result] = await db.execute(
            `INSERT INTO attendance (course_id, student_id, date, status) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [courseId, studentId, date, status]
        );
        return result;
    }

    static async getByCourseAndDate(courseId, date) {
        const [rows] = await db.execute(
            `SELECT a.*, u.name as student_name, u.email as student_email 
             FROM attendance a 
             JOIN users u ON a.student_id = u.id 
             WHERE a.course_id = ? AND a.date = ?`,
            [courseId, date]
        );
        return rows;
    }

    static async getByStudent(studentId, courseId = null) {
        let query = `
            SELECT a.*, c.title as course_title 
            FROM attendance a 
            JOIN courses c ON a.course_id = c.id 
            WHERE a.student_id = ?`;

        const params = [studentId];

        if (courseId) {
            query += ' AND a.course_id = ?';
            params.push(courseId);
        }

        query += ' ORDER BY a.date DESC';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async getStats(studentId, courseId) {
        const [rows] = await db.execute(
            `SELECT status, COUNT(*) as count 
             FROM attendance 
             WHERE student_id = ? AND course_id = ? 
             GROUP BY status`,
            [studentId, courseId]
        );
        return rows;
    }
}

module.exports = Attendance;
