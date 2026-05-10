const db = require('../config/db');

class ShipmentModel {
    static async create(orderId, trackingNumber, courier) {
        const [result] = await db.execute(
            'INSERT INTO shipments (order_id, tracking_number, courier, shipped_at) VALUES (?, ?, ?, NOW())',
            [orderId, trackingNumber, courier]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM shipments');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM shipments WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = ShipmentModel;
