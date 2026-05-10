const ShipmentModel = require('../models/shipmentModel');
const OrderModel = require('../models/orderModel');
const { sendResponse } = require('../utils/response');

class ShipmentController {
    static async create(req, res) {
        try {
            const { order_id, tracking_number, courier } = req.body;

            const order = await OrderModel.getById(order_id);
            if (!order) return sendResponse(res, 404, false, 'Order not found');
            
            // Should be 'paid' to be shipped
            if (order.status !== 'paid') {
                return sendResponse(res, 400, false, 'Order must be paid before shipment');
            }

            // Only the seller of the items should be able to ship, simplistically we check if user is seller
            // In a real multi-seller cart, this gets complex. For now, assume single seller order or penjual can ship.
            
            const shipmentId = await ShipmentModel.create(order_id, tracking_number, courier);
            await OrderModel.updateStatus(order_id, 'shipped');

            return sendResponse(res, 201, true, 'Shipment created, order status updated to shipped', { shipment_id: shipmentId });
        } catch (error) {
            console.error('Error creating shipment:', error);
            return sendResponse(res, 500, false, 'Internal server error');
        }
    }

    static async getAll(req, res) {
        try {
            const shipments = await ShipmentModel.getAll();
            return sendResponse(res, 200, true, 'Shipments fetched successfully', shipments);
        } catch (error) {
            return sendResponse(res, 500, false, 'Internal server error');
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const shipment = await ShipmentModel.getById(id);
            if (!shipment) return sendResponse(res, 404, false, 'Shipment not found');
            return sendResponse(res, 200, true, 'Shipment fetched successfully', shipment);
        } catch (error) {
            return sendResponse(res, 500, false, 'Internal server error');
        }
    }
}

module.exports = ShipmentController;
