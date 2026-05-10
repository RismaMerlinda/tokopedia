const db = require('../config/db');

class CategoryModel {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM categories');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(name) {
        const [result] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
        return result.insertId;
    }

    static async update(id, name) {
        const [result] = await db.execute('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = CategoryModel;
