const db = require('../config/db');

class OrderModel {
    static async getAllByUserId(userId, role) {
        let query = 'SELECT * FROM orders WHERE id_user = ?';
        if (role === 'admin') {
            query = 'SELECT * FROM orders';
            return (await db.execute(query))[0];
        }
        // Penjual perlu melihat pesanan yang berisi produk mereka
        if (role === 'penjual') {
            const [rows] = await db.execute(`
                SELECT DISTINCT o.* FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                WHERE oi.id_user = ?
            `, [userId]);
            return rows;
        }
        
        const [rows] = await db.execute(query, [userId]);
        return rows;
    }

    static async getById(id) {
        const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) return null;
        
        const order = orders[0];
        const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);
        order.items = items;
        return order;
    }

    static async create(userId, items, totalPrice) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [orderResult] = await connection.execute(
                'INSERT INTO orders (id_user, total_price, status, escrow_status) VALUES (?, ?, ?, ?)',
                [userId, totalPrice, 'pending', 'holding']
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                // item membutuhkan: product_id, seller_id (id_user), quantity, price
                // Ambil id penjual dan harga saat ini dari produk
                const [products] = await connection.execute('SELECT id_user, price, stock FROM products WHERE id = ?', [item.product_id]);
                if (products.length === 0) throw new Error(`Product ${item.product_id} not found`);
                const product = products[0];

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.product_id}`);
                }

                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, id_user, quantity, price) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.product_id, product.id_user, item.quantity, product.price]
                );

                // Kurangi stok
                await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
            }

            // Buat Riwayat Transaksi
            await connection.execute(
                'INSERT INTO transaction_histories (id_user, order_id, activity) VALUES (?, ?, ?)',
                [userId, orderId, 'Pesanan dibuat']
            );

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async updateStatus(id, status, escrowStatus = null, cancelReason = null) {
        let query = 'UPDATE orders SET status = ?';
        const params = [status];
        if (escrowStatus) {
            query += ', escrow_status = ?';
            params.push(escrowStatus);
        }
        if (cancelReason) {
            query += ', cancel_reason = ?';
            params.push(cancelReason);
        }
        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.execute(query, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = OrderModel;
