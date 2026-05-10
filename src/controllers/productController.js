const ProductModel = require('../models/productModel');
const { sendResponse } = require('../utils/response');

class ProductController {
    static async getAll(req, res) {
        try {
            const products = await ProductModel.getAll();
            return sendResponse(res, 200, true, 'Produk berhasil diambil', products);
        } catch (error) {
            console.error('Gagal mengambil produk:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductModel.getById(id);
            if (!product) {
                return sendResponse(res, 404, false, 'Produk tidak ditemukan');
            }
            return sendResponse(res, 200, true, 'Produk berhasil diambil', product);
        } catch (error) {
            console.error('Gagal mengambil produk:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async create(req, res) {
        try {
            const { category_id, name, description, price, stock, image } = req.body;
            const id_user = req.user.id; // Ambil dari token auth

            if (!category_id || !name || !price) {
                return sendResponse(res, 400, false, 'ID Kategori, nama, dan harga wajib diisi');
            }
            if (isNaN(price) || price < 0) {
                return sendResponse(res, 400, false, 'Harga harus berupa angka positif yang valid');
            }
            if (stock && (isNaN(stock) || stock < 0)) {
                return sendResponse(res, 400, false, 'Stok tidak boleh negatif');
            }

            const id = await ProductModel.create({
                id_user,
                category_id,
                name,
                description: description || null,
                price,
                stock: stock || 0,
                image: image || null
            });

            const product = await ProductModel.getById(id);
            return sendResponse(res, 201, true, 'Produk berhasil dibuat', product);
        } catch (error) {
            console.error('Gagal membuat produk:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { category_id, name, description, price, stock, image } = req.body;
            const user = req.user;

            const product = await ProductModel.getById(id);
            if (!product) {
                return sendResponse(res, 404, false, 'Produk tidak ditemukan');
            }

            // Periksa otorisasi: Admin atau Penjual yang memiliki produk tersebut
            if (user.role !== 'admin' && product.id_user !== user.id) {
                return sendResponse(res, 403, false, 'Anda tidak berwenang untuk memperbarui produk ini');
            }

            if (price && (isNaN(price) || price < 0)) {
                return sendResponse(res, 400, false, 'Harga harus berupa angka positif yang valid');
            }
            if (stock && (isNaN(stock) || stock < 0)) {
                return sendResponse(res, 400, false, 'Stok tidak boleh negatif');
            }

            await ProductModel.update(id, {
                category_id: category_id || product.category_id,
                name: name || product.name,
                description: description !== undefined ? description : product.description,
                price: price || product.price,
                stock: stock !== undefined ? stock : product.stock,
                image: image !== undefined ? image : product.image
            });

            const updatedProduct = await ProductModel.getById(id);
            return sendResponse(res, 200, true, 'Produk berhasil diperbarui', updatedProduct);
        } catch (error) {
            console.error('Gagal memperbarui produk:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const product = await ProductModel.getById(id);
            if (!product) {
                return sendResponse(res, 404, false, 'Produk tidak ditemukan');
            }

            // Periksa otorisasi: Admin atau Penjual yang memiliki produk tersebut
            if (user.role !== 'admin' && product.id_user !== user.id) {
                return sendResponse(res, 403, false, 'Anda tidak berwenang untuk menghapus produk ini');
            }

            await ProductModel.delete(id);
            return sendResponse(res, 200, true, 'Produk berhasil dihapus');
        } catch (error) {
            console.error('Gagal menghapus produk:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = ProductController;
