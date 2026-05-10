const PaymentModel = require('../models/paymentModel');
const EscrowModel = require('../models/escrowModel');
const OrderModel = require('../models/orderModel');
const { sendResponse } = require('../utils/response');

class PaymentController {
    static async simulatePayment(req, res) {
        try {
            const { order_id, payment_method } = req.body;

            const order = await OrderModel.getById(order_id);
            if (!order) return sendResponse(res, 404, false, 'Pesanan tidak ditemukan');
            if (order.status !== 'pending') return sendResponse(res, 400, false, 'Pesanan tidak dalam status pending');

            // Simulasi pembayaran berhasil
            const paymentId = await PaymentModel.create(order_id, order.total_price, payment_method || 'transfer');
            
            // Buat catatan escrow
            await EscrowModel.create(order_id, order.total_price);

            // Perbarui status pesanan
            await OrderModel.updateStatus(order_id, 'paid', 'holding');

            return sendResponse(res, 201, true, 'Pembayaran berhasil. Dana kini berada di escrow.', { payment_id: paymentId });
        } catch (error) {
            console.error('Gagal mensimulasikan pembayaran:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getAll(req, res) {
        try {
            const payments = await PaymentModel.getAll();
            return sendResponse(res, 200, true, 'Pembayaran berhasil diambil', payments);
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const payment = await PaymentModel.getById(id);
            if (!payment) return sendResponse(res, 404, false, 'Pembayaran tidak ditemukan');
            return sendResponse(res, 200, true, 'Pembayaran berhasil diambil', payment);
        } catch (error) {
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = PaymentController;
