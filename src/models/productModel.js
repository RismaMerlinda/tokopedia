const db = require('../config/db');

class ProductModel {
    static async getAll() {
        const [rows] = await db.execute('SELECT p.*, c.name as category_name, u.full_name as seller_name FROM products p JOIN categories c ON p.category_id = c.id JOIN tb_user u ON p.id_user = u.id_user');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT p.*, c.name as category_name, u.full_name as seller_name FROM products p JOIN categories c ON p.category_id = c.id JOIN tb_user u ON p.id_user = u.id_user WHERE p.id = ?', [id]);
        return rows[0];
    }

    static async create(productData) {
        const { id_user, category_id, name, description, price, stock, image } = productData;
        const [result] = await db.execute(
            'INSERT INTO products (id_user, category_id, name, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_user, category_id, name, description, price, stock, image]
        );
        return result.insertId;
    }

    static async update(id, productData) {
        const { category_id, name, description, price, stock, image } = productData;
        const [result] = await db.execute(
            'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image = ? WHERE id = ?',
            [category_id, name, description, price, stock, image, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async updateStock(id, quantity) {
        // jumlah positif untuk menambah, negatif untuk mengurangi
        await db.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, id]);
    }
}

module.exports = ProductModel;
