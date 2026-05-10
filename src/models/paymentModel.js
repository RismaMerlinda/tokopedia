const db = require('../config/db');

class PaymentModel {
    static async create(orderId, amount, method) {
        const [result] = await db.execute(
            'INSERT INTO payments (order_id, amount, payment_method, status, paid_at) VALUES (?, ?, ?, ?, NOW())',
            [orderId, amount, method, 'success']
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM payments');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM payments WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = PaymentModel;
