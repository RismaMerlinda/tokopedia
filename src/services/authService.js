const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');

class AuthService {
    static async register(name, email, password) {
        // Validation
        if (!email) {
            throw new Error('Email tidak boleh kosong');
        }
        
        // Password Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            throw new Error('Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka');
        }

        // Check if email exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user - FORCED to 'pembeli' for security
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
        // Validation
        if (!email) {
            throw new Error('Email tidak boleh kosong');
        }
        if (!password) {
            throw new Error('Password tidak boleh kosong');
        }

        // Check user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('Kredensial tidak valid');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Kredensial tidak valid');
        }

        // Generate JWT
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
        // Use existing login logic
        const result = await this.login(email, password);
        
        // Verify role
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

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        await UserModel.updateResetToken(email, resetToken, expires);

        return resetToken;
    }

    static async resetPassword(token, newPassword) {
        if (!token) {
            throw new Error('Token tidak valid');
        }

        // Password Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            throw new Error('Password baru minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka');
        }

        const user = await UserModel.findByResetToken(token);
        if (!user) {
            throw new Error('Token tidak valid atau sudah kadaluwarsa');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await UserModel.updatePassword(user.id_user, hashedPassword);

        return true;
    }
}

module.exports = AuthService;
