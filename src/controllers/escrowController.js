const EscrowModel = require('../models/escrowModel');
const { sendResponse } = require('../utils/response');

class EscrowController {
    static async getAll(req, res) {
        try {
            const escrows = await EscrowModel.getAll();
            return sendResponse(res, 200, true, 'Data escrow berhasil diambil', escrows);
        } catch (error) {
            console.error('Gagal mengambil data escrow:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    // Pelepasan manual oleh Admin jika diperlukan
    static async manualRelease(req, res) {
        try {
            const { order_id } = req.body;
            await EscrowModel.updateStatus(order_id, 'released');
            
            // Juga perbarui status pesanan
            const OrderModel = require('../models/orderModel');
            await OrderModel.updateStatus(order_id, 'completed');
            
            return sendResponse(res, 200, true, 'Dana berhasil dilepaskan secara manual ke penjual');
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    // Pengembalian dana manual oleh Admin jika diperlukan
    static async manualRefund(req, res) {
        try {
            const { order_id } = req.body;
            await EscrowModel.updateStatus(order_id, 'refunded');
            
            // Juga perbarui status pesanan
            const OrderModel = require('../models/orderModel');
            await OrderModel.updateStatus(order_id, 'cancelled', 'refunded', 'Pengembalian dana manual oleh Admin');
            
            return sendResponse(res, 200, true, 'Dana berhasil dikembalikan secara manual ke pembeli');
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = EscrowController;
