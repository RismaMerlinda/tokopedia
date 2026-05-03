const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rute-rute aplikasi
app.use('/', authRoutes);

// Rute dasar (home)
app.get('/', (req, res) => {
    res.send('<h2>Tokopedia API is Running!</h2>');
});

// Tangani 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null
    });
});

module.exports = app;
