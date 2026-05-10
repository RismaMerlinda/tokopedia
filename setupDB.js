require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('Menghubungkan ke MySQL...');
    
    try {
        // Buat koneksi awal tanpa memilih database (karena database mungkin belum ada)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true // Penting untuk menjalankan banyak query sekaligus
        });

        console.log('Koneksi berhasil. Membaca file database.sql...');
        const sqlFilePath = path.join(__dirname, 'database.sql');
        const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Mengeksekusi query database.sql...');
        await connection.query(sqlQuery);

        console.log('✅ Database dan semua tabel berhasil dibuat dan disinkronisasi!');
        
        await connection.end();
    } catch (error) {
        console.error('❌ Terjadi kesalahan saat mensetup database:');
        console.error(error);
    }
}

setupDatabase();
