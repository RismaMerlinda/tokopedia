const db = require('../config/db');

class TransactionHistoryModel {
    static async create(userId, orderId, activity) {
        const [result] = await db.execute(
            'INSERT INTO transaction_histories (id_user, order_id, activity) VALUES (?, ?, ?)',
            [userId, orderId, activity]
        );
        return result.insertId;
    }

    static async getAllByUserId(userId, role) {
        if (role === 'admin') {
            const [rows] = await db.execute('SELECT * FROM transaction_histories');
            return rows;
        }
        
        // Mengasumsikan penjual melihat riwayat yang terkait dengan produk mereka? Atau hanya riwayat pembeli.
        // Mari buat tetap sederhana: ambil berdasarkan id_user
        const [rows] = await db.execute('SELECT * FROM transaction_histories WHERE id_user = ?', [userId]);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM transaction_histories WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = TransactionHistoryModel;
