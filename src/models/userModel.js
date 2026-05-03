const db = require('../config/db');

class UserModel {
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM tb_user WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT id_user as id, full_name as name, email, role, created_at, updated_at FROM tb_user WHERE id_user = ?', [id]);
        return rows[0];
    }

    static async create(userData) {
        const { name, email, password, role } = userData;
        const [result] = await db.query(
            'INSERT INTO tb_user (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role || 'pembeli']
        );
        return result.insertId;
    }

    static async updateResetToken(email, token, expires) {
        await db.query(
            'UPDATE tb_user SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
            [token, expires, email]
        );
    }

    static async findByResetToken(token) {
        const [rows] = await db.query(
            'SELECT * FROM tb_user WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    static async updatePassword(userId, hashedPassword) {
        await db.query(
            'UPDATE tb_user SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id_user = ?',
            [hashedPassword, userId]
        );
    }

    static async updateRole(userId, newRole) {
        await db.query(
            'UPDATE tb_user SET role = ? WHERE id_user = ?',
            [newRole, userId]
        );
    }

    static async findAll() {
        const [rows] = await db.query('SELECT id_user as id, full_name as name, email, role, created_at FROM tb_user');
        return rows;
    }

    static async update(userId, userData) {
        const { name, email, role } = userData;
        await db.query(
            'UPDATE tb_user SET full_name = ?, email = ?, role = ? WHERE id_user = ?',
            [name, email, role, userId]
        );
    }

    static async delete(userId) {
        await db.query('DELETE FROM tb_user WHERE id_user = ?', [userId]);
    }
}

module.exports = UserModel;
