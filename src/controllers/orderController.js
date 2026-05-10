const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');
const { sendResponse } = require('../utils/response');

class OrderController {
    static async getAll(req, res) {
        try {
            const user = req.user;
            const orders = await OrderModel.getAllByUserId(user.id, user.role);
            return sendResponse(res, 200, true, 'Pesanan berhasil diambil', orders);
        } catch (error) {
            console.error('Gagal mengambil pesanan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const order = await OrderModel.getById(id);
            if (!order) return sendResponse(res, 404, false, 'Pesanan tidak ditemukan');

            // Otorisasi: Admin, Pembeli yang memesan, Penjual dari produk
            if (req.user.role === 'pembeli' && order.id_user !== req.user.id) {
                return sendResponse(res, 403, false, 'Tidak berwenang untuk melihat pesanan ini');
            }

            return sendResponse(res, 200, true, 'Pesanan berhasil diambil', order);
        } catch (error) {
            console.error('Gagal mengambil pesanan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async create(req, res) {
        try {
            const { items } = req.body; // Array dari { product_id, quantity }
            if (!items || items.length === 0) {
                return sendResponse(res, 400, false, 'Item pesanan wajib diisi');
            }

            let totalPrice = 0;
            for (const item of items) {
                const product = await ProductModel.getById(item.product_id);
                if (!product) return sendResponse(res, 404, false, `Produk ${item.product_id} tidak ditemukan`);
                totalPrice += product.price * item.quantity;
            }

            const orderId = await OrderModel.create(req.user.id, items, totalPrice);
            const newOrder = await OrderModel.getById(orderId);

            return sendResponse(res, 201, true, 'Pesanan berhasil dibuat', newOrder);
        } catch (error) {
            console.error('Gagal membuat pesanan:', error);
            return sendResponse(res, 400, false, error.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { status, cancel_reason } = req.body;
            const user = req.user;

            const order = await OrderModel.getById(id);
            if (!order) return sendResponse(res, 404, false, 'Pesanan tidak ditemukan');

            // Otorisasi: Admin atau Penjual yang memiliki item dalam pesanan ini
            if (user.role === 'penjual') {
                const isSellerOfOrder = order.items.some(item => item.id_user === user.id);
                if (!isSellerOfOrder) {
                    return sendResponse(res, 403, false, 'Anda tidak berwenang untuk memperbarui pesanan ini');
                }
            } else if (user.role !== 'admin') {
                return sendResponse(res, 403, false, 'Tidak berwenang untuk memperbarui pesanan');
            }

            // Logika pembatalan: kembalikan stok
            if (status === 'cancelled' && order.status !== 'cancelled') {
                for (const item of order.items) {
                    await ProductModel.updateStock(item.product_id, item.quantity); // Pastikan updateStock ada atau gunakan query manual
                }
            }
            
            await OrderModel.updateStatus(id, status, null, cancel_reason || null);
            return sendResponse(res, 200, true, 'Pesanan berhasil diperbarui');
        } catch (error) {
            console.error('Gagal memperbarui pesanan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async confirmReceipt(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await OrderModel.getById(id);
            if (!order) return sendResponse(res, 404, false, 'Pesanan tidak ditemukan');

            if (order.id_user !== userId && req.user.role !== 'admin') {
                return sendResponse(res, 403, false, 'Tidak berwenang untuk mengonfirmasi pesanan ini');
            }

            if (order.status !== 'shipped') {
                return sendResponse(res, 400, false, 'Pesanan harus dikirim sebelum konfirmasi');
            }

            // Perbarui pesanan dan escrow
            await OrderModel.updateStatus(id, 'completed', 'released');

            // Juga perbarui tabel Escrows secara langsung
            const EscrowModel = require('../models/escrowModel');
            await EscrowModel.updateStatus(id, 'released');

            return sendResponse(res, 200, true, 'Penerimaan dikonfirmasi, dana diteruskan ke penjual');
        } catch (error) {
            console.error('Gagal mengonfirmasi penerimaan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await OrderModel.delete(id);
            return sendResponse(res, 200, true, 'Pesanan berhasil dihapus');
        } catch (error) {
            console.error('Gagal menghapus pesanan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = OrderController;
