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

        console.log('Updating disputes table for Seller Response...');
        
        try {
            await conn.query(`ALTER TABLE disputes 
                ADD COLUMN seller_response TEXT AFTER reason,
                ADD COLUMN seller_status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending' AFTER seller_response`);
            console.log('Columns added to disputes table.');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log('Columns already exist.');
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
