const db = require('../controllers/config/db');

class Payment {
    static async create(data) {
        const { studentId, courseId, amount, paymentMethod, status, transactionId, paymentDate } = data;
        const [result] = await db.execute(
            `INSERT INTO payments 
            (student_id, course_id, amount, payment_method, status, transaction_id, payment_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [studentId, courseId, amount, paymentMethod, status, transactionId, paymentDate]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT p.*, u.name as student_name, c.title as course_title 
             FROM payments p 
             JOIN users u ON p.student_id = u.id 
             JOIN courses c ON p.course_id = c.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByStudent(studentId) {
        const [rows] = await db.execute(
            `SELECT p.*, c.title as course_title 
             FROM payments p 
             JOIN courses c ON p.course_id = c.id 
             WHERE p.student_id = ? 
             ORDER BY p.created_at DESC`,
            [studentId]
        );
        return rows;
    }

    static async findAll({ page = 1, limit = 10, status } = {}) {
        let query = `
            SELECT p.*, u.name as student_name, c.title as course_title 
            FROM payments p 
            JOIN users u ON p.student_id = u.id 
            JOIN courses c ON p.course_id = c.id`;

        const params = [];

        if (status) {
            query += ' WHERE p.status = ?';
            params.push(status);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async getCount({ status } = {}) {
        let query = 'SELECT COUNT(*) as count FROM payments';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        const [rows] = await db.execute(query, params);
        return rows[0].count;
    }

    static async updateStatus(id, status) {
        const [result] = await db.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Payment;
