const CartModel = require('../models/cartModel');
const ProductModel = require('../models/productModel');
const { sendResponse } = require('../utils/response');

class CartController {
    static async getCart(req, res) {
        try {
            const userId = req.user.id;
            const cart = await CartModel.getCartByUserId(userId);
            return sendResponse(res, 200, true, 'Keranjang berhasil diambil', cart);
        } catch (error) {
            console.error('Gagal mengambil keranjang:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { product_id, quantity } = req.body;

            if (!product_id || !quantity) {
                return sendResponse(res, 400, false, 'ID Produk dan jumlah wajib diisi');
            }

            if (isNaN(quantity) || quantity <= 0) {
                return sendResponse(res, 400, false, 'Jumlah harus berupa angka positif lebih dari 0');
            }

            // Periksa apakah produk ada dan stok mencukupi
            const product = await ProductModel.getById(product_id);
            if (!product) {
                return sendResponse(res, 404, false, 'Produk tidak ditemukan');
            }

            if (product.stock < quantity) {
                return sendResponse(res, 400, false, 'Stok tidak mencukupi');
            }

            // Ambil atau buat keranjang
            const cart = await CartModel.getCartByUserId(userId);
            
            // Tambahkan item ke keranjang
            await CartModel.addItemToCart(cart.id, product_id, quantity);
            
            // Ambil keranjang yang sudah diperbarui
            const updatedCart = await CartModel.getCartByUserId(userId);

            return sendResponse(res, 201, true, 'Produk berhasil ditambahkan ke keranjang', updatedCart);
        } catch (error) {
            console.error('Gagal menambahkan ke keranjang:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async updateCartItem(req, res) {
        try {
            const { id } = req.params; // id item keranjang
            const { quantity } = req.body;
            const userId = req.user.id;

            if (isNaN(quantity) || quantity <= 0) {
                return sendResponse(res, 400, false, 'Jumlah harus berupa angka positif lebih dari 0');
            }

            // verifikasi item keranjang milik user yang sesuai
            const cart = await CartModel.getCartByUserId(userId);
            const cartItem = await CartModel.getCartItemById(id);
            
            if (!cartItem || cartItem.cart_id !== cart.id) {
                return sendResponse(res, 404, false, 'Item keranjang tidak ditemukan di keranjang Anda');
            }

            // Periksa stok
            const product = await ProductModel.getById(cartItem.product_id);
            if (product.stock < quantity) {
                return sendResponse(res, 400, false, 'Stok tidak mencukupi');
            }

            await CartModel.updateItemQuantity(id, quantity);
            
            const updatedCart = await CartModel.getCartByUserId(userId);
            return sendResponse(res, 200, true, 'Keranjang berhasil diperbarui', updatedCart);
        } catch (error) {
            console.error('Gagal memperbarui keranjang:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async removeFromCart(req, res) {
        try {
            const { id } = req.params; // id item keranjang
            const userId = req.user.id;

            // verifikasi item keranjang milik user yang sesuai
            const cart = await CartModel.getCartByUserId(userId);
            const cartItem = await CartModel.getCartItemById(id);
            
            if (!cartItem || cartItem.cart_id !== cart.id) {
                return sendResponse(res, 404, false, 'Item keranjang tidak ditemukan di keranjang Anda');
            }

            await CartModel.removeCartItem(id);
            
            const updatedCart = await CartModel.getCartByUserId(userId);
            return sendResponse(res, 200, true, 'Item berhasil dihapus dari keranjang', updatedCart);
        } catch (error) {
            console.error('Gagal menghapus dari keranjang:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = CartController;
