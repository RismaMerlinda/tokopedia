const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('<h2>Tokopedia API is Running!</h2>');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null
    });
});

module.exports = app;
