const db = require('../config/db');

class CartModel {
    static async getCartByUserId(userId) {
        let [carts] = await db.execute('SELECT * FROM carts WHERE id_user = ?', [userId]);
        
        if (carts.length === 0) {
            // Buat keranjang jika belum ada
            const [result] = await db.execute('INSERT INTO carts (id_user) VALUES (?)', [userId]);
            const cartId = result.insertId;
            return { id: cartId, id_user: userId, items: [] };
        }

        const cart = carts[0];
        
        // Ambil item keranjang
        const [items] = await db.execute(`
            SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, p.name, p.price, p.image 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cart.id]);

        cart.items = items;
        return cart;
    }

    static async addItemToCart(cartId, productId, quantity) {
        // Periksa apakah item sudah ada di keranjang
        const [existing] = await db.execute('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);

        if (existing.length > 0) {
            // Perbarui jumlah (quantity)
            const newQty = existing[0].quantity + quantity;
            const [result] = await db.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
            return existing[0].id; // Kembalikan id item
        } else {
            // Masukkan item baru
            const [result] = await db.execute('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
            return result.insertId;
        }
    }

    static async updateItemQuantity(itemId, quantity) {
        const [result] = await db.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
        return result.affectedRows;
    }

    static async removeCartItem(itemId) {
        const [result] = await db.execute('DELETE FROM cart_items WHERE id = ?', [itemId]);
        return result.affectedRows;
    }
    
    static async getCartItemById(itemId) {
        const [rows] = await db.execute('SELECT * FROM cart_items WHERE id = ?', [itemId]);
        return rows[0];
    }
}

module.exports = CartModel;
