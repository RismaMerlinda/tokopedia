const CategoryModel = require('../models/categoryModel');
const { sendResponse } = require('../utils/response');

class CategoryController {
    static async getAll(req, res) {
        try {
            const categories = await CategoryModel.getAll();
            return sendResponse(res, 200, true, 'Kategori berhasil diambil', categories);
        } catch (error) {
            console.error('Gagal mengambil kategori:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async create(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return sendResponse(res, 400, false, 'Nama kategori wajib diisi');
            }

            const id = await CategoryModel.create(name);
            const category = await CategoryModel.getById(id);
            return sendResponse(res, 201, true, 'Kategori berhasil dibuat', category);
        } catch (error) {
            console.error('Gagal membuat kategori:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return sendResponse(res, 400, false, 'Nama kategori wajib diisi');
            }

            const category = await CategoryModel.getById(id);
            if (!category) {
                return sendResponse(res, 404, false, 'Kategori tidak ditemukan');
            }

            await CategoryModel.update(id, name);
            const updatedCategory = await CategoryModel.getById(id);
            return sendResponse(res, 200, true, 'Kategori berhasil diperbarui', updatedCategory);
        } catch (error) {
            console.error('Gagal memperbarui kategori:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryModel.getById(id);
            if (!category) {
                return sendResponse(res, 404, false, 'Kategori tidak ditemukan');
            }

            await CategoryModel.delete(id);
            return sendResponse(res, 200, true, 'Kategori berhasil dihapus');
        } catch (error) {
            console.error('Gagal menghapus kategori:', error);
            return sendResponse(res, 500, false, 'Kesalahan server internal');
        }
    }
}

module.exports = CategoryController;
