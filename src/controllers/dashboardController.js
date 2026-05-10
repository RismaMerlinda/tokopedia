const db = require('../config/db');
const { sendResponse } = require('../utils/response');

class DashboardController {
    static async getSellerDashboard(req, res) {
        try {
            const sellerId = req.user.id;

            // Total produk
            const [products] = await db.execute('SELECT COUNT(*) as total FROM products WHERE id_user = ?', [sellerId]);
            const totalProducts = products[0].total;

            // Ambil semua item pesanan untuk penjual ini guna menghitung statistik pesanan
            const [orderItems] = await db.execute(`
                SELECT oi.*, o.status, o.total_price 
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.id_user = ?
            `, [sellerId]);

            let totalOrder = new Set(orderItems.map(item => item.order_id)).size;
            let pendingOrder = 0;
            let completedOrder = 0;
            let totalPenjualan = 0; // Jumlah item yang terjual
            let totalRevenue = 0;

            const processedOrders = new Set();

            for (const item of orderItems) {
                if (!processedOrders.has(item.order_id)) {
                    processedOrders.add(item.order_id);
                    if (item.status === 'pending' || item.status === 'paid') pendingOrder++;
                    if (item.status === 'completed') completedOrder++;
                }
                
                if (item.status === 'completed') {
                    totalPenjualan += item.quantity;
                    totalRevenue += (item.price * item.quantity);
                }
            }

            const data = {
                total_produk: totalProducts,
                total_order: totalOrder,
                total_penjualan: totalPenjualan,
                total_revenue: totalRevenue,
                pending_order: pendingOrder,
                completed_order: completedOrder
            };

            return sendResponse(res, 200, true, 'Data dashboard berhasil diambil', data);
        } catch (error) {
            console.error('Gagal mengambil data dashboard:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = DashboardController;
