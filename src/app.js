const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const transactionHistoryRoutes = require('./routes/transactionHistoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const escrowRoutes = require('./routes/escrowRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rute-rute aplikasi
app.use('/', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/disputes', disputeRoutes);
app.use('/transactions', transactionHistoryRoutes);
app.use('/penjual', dashboardRoutes);
app.use('/escrow', escrowRoutes);

// Rute dasar (beranda)
app.get('/', (req, res) => {
    res.send('<h2>Tokopedia API sedang berjalan!</h2>');
});

// Tangani 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rute tidak ditemukan',
        data: null
    });
});

module.exports = app;
