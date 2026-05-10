const db = require('../config/db');

class DisputeModel {
    static async create(orderId, userId, reason) {
        const [result] = await db.execute(
            'INSERT INTO disputes (order_id, id_user, reason, status) VALUES (?, ?, ?, ?)',
            [orderId, userId, reason, 'open']
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM disputes');
        return rows;
    }
    
    static async getByUserId(userId) {
        const [rows] = await db.execute('SELECT * FROM disputes WHERE id_user = ?', [userId]);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM disputes WHERE id = ?', [id]);
        return rows[0];
    }
    
    static async updateStatus(id, status) {
        const [result] = await db.execute('UPDATE disputes SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows;
    }
    
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM disputes WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async getBySellerId(sellerId) {
        const [rows] = await db.execute(`
            SELECT DISTINCT d.* FROM disputes d
            JOIN order_items oi ON d.order_id = oi.order_id
            WHERE oi.id_user = ?
        `, [sellerId]);
        return rows;
    }

    static async respondBySeller(id, sellerStatus, sellerResponse) {
        const [result] = await db.execute(
            'UPDATE disputes SET seller_status = ?, seller_response = ? WHERE id = ?',
            [sellerStatus, sellerResponse, id]
        );
        return result.affectedRows;
    }
}

module.exports = DisputeModel;
