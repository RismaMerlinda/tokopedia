const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');

class AuthService {
    static async register(name, email, password) {
        // Validasi
        if (!email) {
            throw new Error('Email tidak boleh kosong');
        }
        
        // Validasi password: min 8 karakter, ada huruf besar, kecil, dan angka
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            throw new Error('Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka');
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }

        // Enkripsi password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Buat user baru - otomatis jadi 'pembeli' demi keamanan
        const userId = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'pembeli'
        });

        const user = await UserModel.findById(userId);
        return user;
    }

    static async login(email, password) {
        // Validasi input login
        if (!email) {
            throw new Error('Email tidak boleh kosong');
        }
        if (!password) {
            throw new Error('Password tidak boleh kosong');
        }

        // Cek keberadaan user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('Kredensial tidak valid');
        }

        // Cek kecocokan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Kredensial tidak valid');
        }

        // Buat token JWT
        const payload = {
            id: user.id_user,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRES 
        });

        return {
            user: {
                id: user.id_user,
                name: user.full_name,
                email: user.email,
                role: user.role
            },
            token
        };
    }

    static async loginByRole(email, password, requiredRole) {
        // Gunakan logika login yang sudah ada
        const result = await this.login(email, password);
        
        // Verifikasi kesesuaian role
        if (result.user.role !== requiredRole) {
            throw new Error(`Akun Anda bukan ${requiredRole}, silakan login di pintu yang benar.`);
        }

        return result;
    }

    static async forgotPassword(email) {
        if (!email) {
            throw new Error('Email tidak boleh kosong');
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('User dengan email tersebut tidak ditemukan');
        }

        // Buat token reset password
        const resetToken = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // Berlaku 1 jam

        await UserModel.updateResetToken(email, resetToken, expires);

        return resetToken;
    }

    static async resetPassword(token, newPassword) {
        if (!token) {
            throw new Error('Token tidak valid');
        }

        // Validasi format password baru
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            throw new Error('Password baru minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka');
        }

        const user = await UserModel.findByResetToken(token);
        if (!user) {
            throw new Error('Token tidak valid atau sudah kadaluwarsa');
        }

        // Enkripsi password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await UserModel.updatePassword(user.id_user, hashedPassword);

        return true;
    }
}

module.exports = AuthService;
