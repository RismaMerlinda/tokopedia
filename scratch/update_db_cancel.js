require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateDB() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Adding cancelled status and cancel_reason column...');
        
        // Update enum status
        await conn.query(`ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'paid', 'shipped', 'completed', 'disputed', 'cancelled') DEFAULT 'pending'`);
        
        // Add cancel_reason column if not exists
        try {
            await conn.query(`ALTER TABLE orders ADD COLUMN cancel_reason TEXT AFTER escrow_status`);
            console.log('Column cancel_reason added.');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log('Column cancel_reason already exists.');
            } else {
                throw err;
            }
        }

        console.log('Database updated successfully.');
        await conn.end();
    } catch (error) {
        console.error('Error updating database:', error);
    }
}

updateDB();
