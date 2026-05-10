const DisputeModel = require('../models/disputeModel');
const OrderModel = require('../models/orderModel');
const { sendResponse } = require('../utils/response');

class DisputeController {
    static async create(req, res) {
        try {
            const { order_id, reason } = req.body;
            const userId = req.user.id;

            if (!order_id || !reason) {
                return sendResponse(res, 400, false, 'ID Pesanan dan alasan wajib diisi');
            }

            const order = await OrderModel.getById(order_id);
            if (!order) return sendResponse(res, 404, false, 'Pesanan tidak ditemukan');
            
            if (order.id_user !== userId) {
                return sendResponse(res, 403, false, 'Anda hanya dapat menyanggah pesanan Anda sendiri');
            }

            const disputeId = await DisputeModel.create(order_id, userId, reason);
            
            // Perbarui status pesanan menjadi disanggah
            await OrderModel.updateStatus(order_id, 'disputed', 'holding'); // Escrow ditahan

            return sendResponse(res, 201, true, 'Sanggahan berhasil dibuat', { dispute_id: disputeId });
        } catch (error) {
            console.error('Gagal membuat sanggahan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getAll(req, res) {
        try {
            const user = req.user;
            let disputes;
            if (user.role === 'admin') {
                disputes = await DisputeModel.getAll();
            } else if (user.role === 'penjual') {
                disputes = await DisputeModel.getBySellerId(user.id);
            } else {
                disputes = await DisputeModel.getByUserId(user.id);
            }
            return sendResponse(res, 200, true, 'Sanggahan berhasil diambil', disputes);
        } catch (error) {
            console.error('Gagal mengambil sanggahan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async respond(req, res) {
        try {
            const { id } = req.params;
            const { seller_status, seller_response } = req.body;
            const sellerId = req.user.id;

            const dispute = await DisputeModel.getById(id);
            if (!dispute) return sendResponse(res, 404, false, 'Sanggahan tidak ditemukan');

            // Verifikasi penjual memiliki produk dalam sanggahan ini
            const ProductModel = require('../models/productModel');
            const orders = await OrderModel.getById(dispute.order_id);
            const isOwner = orders.items.some(item => item.id_user === sellerId);
            
            if (!isOwner) {
                return sendResponse(res, 403, false, 'Anda tidak berwenang untuk menanggapi sanggahan ini');
            }

            await DisputeModel.respondBySeller(id, seller_status, seller_response);

            // Jika penjual menerima, otomatis selesaikan dan kembalikan dana
            if (seller_status === 'accepted') {
                await OrderModel.updateStatus(dispute.order_id, 'cancelled', 'refunded', 'Penjual menerima sanggahan: ' + seller_response);
                
                // Kembalikan stok
                for (const item of orders.items) {
                    await ProductModel.updateStock(item.product_id, item.quantity);
                }

                await DisputeModel.updateStatus(id, 'resolved');
            }

            return sendResponse(res, 200, true, `Sanggahan ${seller_status} oleh penjual`);
        } catch (error) {
            console.error('Gagal menanggapi sanggahan:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const dispute = await DisputeModel.getById(id);
            if (!dispute) return sendResponse(res, 404, false, 'Sanggahan tidak ditemukan');
            
            if (req.user.role !== 'admin' && dispute.id_user !== req.user.id) {
                return sendResponse(res, 403, false, 'Tidak berwenang');
            }
            
            return sendResponse(res, 200, true, 'Sanggahan berhasil diambil', dispute);
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            // Admin meninjau dan menyelesaikan
            await DisputeModel.updateStatus(id, status);
            return sendResponse(res, 200, true, 'Sanggahan berhasil diperbarui');
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await DisputeModel.delete(id);
            return sendResponse(res, 200, true, 'Sanggahan berhasil dihapus');
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = DisputeController;
