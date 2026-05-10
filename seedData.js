require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedData() {
    console.log('Menyiapkan data dummy (Seeding) untuk Tokopedia API...');
    
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tokopedia'
        });

        // Hapus data lama (opsional, tapi bagus agar bersih)
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE tb_user');
        await connection.execute('TRUNCATE TABLE categories');
        await connection.execute('TRUNCATE TABLE products');
        await connection.execute('TRUNCATE TABLE orders');
        await connection.execute('TRUNCATE TABLE order_items');
        await connection.execute('TRUNCATE TABLE payments');
        await connection.execute('TRUNCATE TABLE escrows');
        await connection.execute('TRUNCATE TABLE shipments');
        await connection.execute('TRUNCATE TABLE transaction_histories');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('1. Membuat Users (Admin, Penjual, Pembeli)...');
        const passwordHash = await bcrypt.hash('password123', 10);
        
        await connection.execute('INSERT INTO tb_user (id_user, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)', 
            [1, 'Bapak Admin', 'admin@gmail.com', passwordHash, 'admin']);
        await connection.execute('INSERT INTO tb_user (id_user, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)', 
            [2, 'Toko Jaya Abadi', 'penjual@gmail.com', passwordHash, 'penjual']);
        await connection.execute('INSERT INTO tb_user (id_user, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)', 
            [3, 'Budi Pembeli', 'pembeli@gmail.com', passwordHash, 'pembeli']);

        console.log('2. Membuat Kategori...');
        await connection.execute('INSERT INTO categories (id, name) VALUES (?, ?)', [1, 'Elektronik']);
        await connection.execute('INSERT INTO categories (id, name) VALUES (?, ?)', [2, 'Pakaian']);

        console.log('3. Membuat Produk...');
        await connection.execute('INSERT INTO products (id, id_user, category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [1, 2, 1, 'Laptop ASUS ROG', 'Laptop gaming kencang RGB', 15000000, 10]);
        await connection.execute('INSERT INTO products (id, id_user, category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [2, 2, 1, 'Mouse Logitech G502', 'Mouse gaming presisi tinggi', 800000, 50]);
        await connection.execute('INSERT INTO products (id, id_user, category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [3, 2, 2, 'Kaos Polos Hitam', 'Kaos cotton combed 30s', 50000, 100]);

        console.log('4. Mensimulasikan Transaksi Order Lengkap...');
        // Order 1: Selesai (Beli Laptop & Mouse)
        const orderTotalPrice = 15800000;
        await connection.execute('INSERT INTO orders (id, id_user, total_price, status, escrow_status) VALUES (?, ?, ?, ?, ?)', 
            [1, 3, orderTotalPrice, 'completed', 'released']);
        
        await connection.execute('INSERT INTO order_items (order_id, product_id, id_user, quantity, price) VALUES (?, ?, ?, ?, ?)', 
            [1, 1, 2, 1, 15000000]); // Beli 1 Laptop (dari penjual 2)
        await connection.execute('INSERT INTO order_items (order_id, product_id, id_user, quantity, price) VALUES (?, ?, ?, ?, ?)', 
            [1, 2, 2, 1, 800000]); // Beli 1 Mouse (dari penjual 2)

        console.log('5. Mensimulasikan Pembayaran & Escrow...');
        await connection.execute('INSERT INTO payments (order_id, amount, payment_method, status, paid_at) VALUES (?, ?, ?, ?, NOW())', 
            [1, orderTotalPrice, 'BCA Virtual Account', 'success']);
        await connection.execute('INSERT INTO escrows (order_id, amount, status, released_at) VALUES (?, ?, ?, NOW())', 
            [1, orderTotalPrice, 'released']);

        console.log('6. Mensimulasikan Pengiriman...');
        await connection.execute('INSERT INTO shipments (order_id, tracking_number, courier, shipped_at, delivered_at) VALUES (?, ?, ?, NOW(), NOW())', 
            [1, 'JNE1234567890', 'JNE REG']);

        console.log('7. Mensimulasikan Histori Transaksi...');
        await connection.execute('INSERT INTO transaction_histories (id_user, order_id, activity) VALUES (?, ?, ?)', 
            [3, 1, 'Pesanan dibuat']);
        await connection.execute('INSERT INTO transaction_histories (id_user, order_id, activity) VALUES (?, ?, ?)', 
            [3, 1, 'Pembayaran berhasil']);
        await connection.execute('INSERT INTO transaction_histories (id_user, order_id, activity) VALUES (?, ?, ?)', 
            [3, 1, 'Pesanan selesai']);

        console.log('✅ SEEDING SELESAI! Database Anda sekarang sudah berisi data lengkap dan siap digunakan/dilihat hasilnya.');
        
    } catch (error) {
        console.error('❌ Error saat seeding data:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedData();
