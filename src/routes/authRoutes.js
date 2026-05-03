const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/login/:role', AuthController.loginByRole);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.delete('/profile', authMiddleware, AuthController.deleteProfile);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// --- CONTOH PEMBATASAN ROLE ---
// Hanya bisa diakses oleh ADMIN
router.get('/admin-only', authMiddleware, authorize('admin'), (req, res) => {
    res.json({ success: true, message: 'Selamat datang, Admin!', data: req.user });
});

// Hanya bisa diakses oleh PENJUAL
router.get('/seller-only', authMiddleware, authorize('penjual'), (req, res) => {
    res.json({ success: true, message: 'Ini area khusus Penjual', data: req.user });
});

// Hanya bisa diakses oleh PEMBELI
router.get('/buyer-only', authMiddleware, authorize('pembeli'), (req, res) => {
    res.json({ success: true, message: 'Halo Pembeli, selamat berbelanja!', data: req.user });
});

// Ambil Semua Data User (Hanya Admin)
router.get('/users', authMiddleware, authorize('admin'), AuthController.getAllUsers);

// Ambil Data User Berdasarkan ID (Hanya Admin)
router.get('/users/:id', authMiddleware, authorize('admin'), AuthController.getUserById);

// Update Data User Berdasarkan ID (Hanya Admin)
router.put('/users/:id', authMiddleware, authorize('admin'), AuthController.updateUserById);

// Hapus Data User Berdasarkan ID (Hanya Admin)
router.delete('/users/:id', authMiddleware, authorize('admin'), AuthController.deleteUserById);

// Fitur Khusus Admin: Mengubah Role User Lain
router.post('/admin/update-role', authMiddleware, authorize('admin'), AuthController.updateUserRole);

module.exports = router;
