const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'tokopedia',
        port: 3306
    });

    // Clear existing data
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE tb_user');
    await connection.execute('TRUNCATE TABLE categories');
    await connection.execute('TRUNCATE TABLE products');
    await connection.execute('TRUNCATE TABLE carts');
    await connection.execute('TRUNCATE TABLE cart_items');
    await connection.execute('TRUNCATE TABLE orders');
    await connection.execute('TRUNCATE TABLE order_items');
    await connection.execute('TRUNCATE TABLE payments');
    await connection.execute('TRUNCATE TABLE escrows');
    await connection.execute('TRUNCATE TABLE shipments');
    await connection.execute('TRUNCATE TABLE disputes');
    await connection.execute('TRUNCATE TABLE transaction_histories');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Database cleared.');

    // Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const [adminResult] = await connection.execute(
        'INSERT INTO tb_user (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin Utama', 'admin@tokopedia.com', passwordHash, 'admin']
    );
    const adminId = adminResult.insertId;

    const [sellerResult] = await connection.execute(
        'INSERT INTO tb_user (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Penjual Sukses', 'penjual@tokopedia.com', passwordHash, 'penjual']
    );
    const sellerId = sellerResult.insertId;

    const [buyerResult] = await connection.execute(
        'INSERT INTO tb_user (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Pembeli Setia', 'pembeli@tokopedia.com', passwordHash, 'pembeli']
    );
    const buyerId = buyerResult.insertId;

    console.log('Users seeded.');

    // Seed Categories
    const categories = ['Elektronik', 'Pakaian Pria', 'Pakaian Wanita', 'Buku'];
    const categoryIds = [];
    for (const cat of categories) {
        const [catResult] = await connection.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [cat]
        );
        categoryIds.push(catResult.insertId);
    }
    console.log('Categories seeded.');

    // Seed Products
    const products = [
        { id_user: sellerId, category_id: categoryIds[0], name: 'Laptop Gaming ASUS', description: 'Laptop kencang', price: 15000000, stock: 10, image: 'laptop.jpg' },
        { id_user: sellerId, category_id: categoryIds[0], name: 'Smartphone Samsung', description: 'HP flagship', price: 12000000, stock: 15, image: 'hp.jpg' },
        { id_user: sellerId, category_id: categoryIds[1], name: 'Kemeja Flanel', description: 'Kemeja kotak-kotak', price: 150000, stock: 50, image: 'kemeja.jpg' },
        { id_user: sellerId, category_id: categoryIds[3], name: 'Buku Belajar Node.js', description: 'Tutorial lengkap', price: 95000, stock: 100, image: 'buku.jpg' }
    ];

    for (const prod of products) {
        await connection.execute(
            'INSERT INTO products (id_user, category_id, name, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [prod.id_user, prod.category_id, prod.name, prod.description, prod.price, prod.stock, prod.image]
        );
    }
    console.log('Products seeded.');

    await connection.end();
    console.log('Seeding complete.');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
