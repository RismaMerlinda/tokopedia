const db = require('../config/db');

class EscrowModel {
    static async create(orderId, amount) {
        const [result] = await db.execute(
            'INSERT INTO escrows (order_id, amount, status) VALUES (?, ?, ?)',
            [orderId, amount, 'holding']
        );
        return result.insertId;
    }
    
    static async updateStatus(orderId, status) {
        const [result] = await db.execute(
            'UPDATE escrows SET status = ?, released_at = IF(? = "released", NOW(), released_at) WHERE order_id = ?',
            [status, status, orderId]
        );
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.execute(`
            SELECT e.*, o.id_user as buyer_id, o.status as order_status 
            FROM escrows e 
            JOIN orders o ON e.order_id = o.id
        `);
        return rows;
    }
}

module.exports = EscrowModel;
