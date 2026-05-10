const TransactionHistoryModel = require('../models/transactionHistoryModel');
const { sendResponse } = require('../utils/response');

class TransactionHistoryController {
    static async getAll(req, res) {
        try {
            const user = req.user;
            const histories = await TransactionHistoryModel.getAllByUserId(user.id, user.role);
            return sendResponse(res, 200, true, 'Riwayat transaksi berhasil diambil', histories);
        } catch (error) {
            console.error('Gagal mengambil riwayat transaksi:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const history = await TransactionHistoryModel.getById(id);
            if (!history) return sendResponse(res, 404, false, 'Riwayat tidak ditemukan');
            
            if (req.user.role !== 'admin' && history.id_user !== req.user.id) {
                return sendResponse(res, 403, false, 'Tidak berwenang');
            }
            
            return sendResponse(res, 200, true, 'Riwayat berhasil diambil', history);
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
    
    // POST/PUT/DELETE tambahan dapat ditangani dengan aman atau di-mock jika diperlukan untuk kelengkapan API
    static async create(req, res) {
        try {
            const { order_id, activity } = req.body;
            const historyId = await TransactionHistoryModel.create(req.user.id, order_id, activity);
            return sendResponse(res, 201, true, 'Riwayat berhasil dibuat', { id: historyId });
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
    
    static async update(req, res) {
        return sendResponse(res, 405, false, 'Metode tidak diizinkan untuk riwayat transaksi');
    }
    
    static async delete(req, res) {
        return sendResponse(res, 405, false, 'Metode tidak diizinkan untuk riwayat transaksi');
    }
}

module.exports = TransactionHistoryController;
