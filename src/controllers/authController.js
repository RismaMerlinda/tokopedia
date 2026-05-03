const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');
const { sendResponse } = require('../utils/response');

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const user = await AuthService.register(name, email, password);

            return sendResponse(res, 201, true, 'Registrasi berhasil', user);
        } catch (error) {
            console.error('Error in register:', error);
            return sendResponse(res, 400, false, error.message);
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            return sendResponse(res, 200, true, 'Login berhasil', result);
        } catch (error) {
            console.error('Error in login:', error);
            return sendResponse(res, 401, false, error.message);
        }
    }

    static async loginByRole(req, res) {
        try {
            const { role } = req.params;
            const { email, password } = req.body;
            const result = await AuthService.loginByRole(email, password, role);

            return sendResponse(res, 200, true, `Login ${role} berhasil`, result);
        } catch (error) {
            console.error('Error in loginByRole:', error);
            return sendResponse(res, 401, false, error.message);
        }
    }

    static async getProfile(req, res) {
        try {
            // req.user is set by authMiddleware
            return sendResponse(res, 200, true, 'Profil berhasil diambil', req.user);
        } catch (error) {
            console.error('Error in getProfile:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const token = await AuthService.forgotPassword(email);

            // In a real app, you would send this token via email
            return sendResponse(res, 200, true, 'Token reset password telah dibuat', { resetToken: token });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            return sendResponse(res, 400, false, error.message);
        }
    }

    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            await AuthService.resetPassword(token, newPassword);

            return sendResponse(res, 200, true, 'Password berhasil diperbarui', null);
        } catch (error) {
            console.error('Error in resetPassword:', error);
            return sendResponse(res, 400, false, error.message);
        }
    }

    static async updateUserRole(req, res) {
        try {
            const { targetUserId, newRole } = req.body;

            if (!['admin', 'penjual', 'pembeli'].includes(newRole)) {
                return sendResponse(res, 400, false, 'Role tidak valid');
            }

            await UserModel.updateRole(targetUserId, newRole);

            return sendResponse(res, 200, true, `Role user ID ${targetUserId} berhasil diubah menjadi ${newRole}`, null);
        } catch (error) {
            console.error('Error in updateUserRole:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.findAll();
            return sendResponse(res, 200, true, 'Daftar semua user berhasil diambil', users);
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById(id);

            if (!user) {
                return sendResponse(res, 404, false, 'User tidak ditemukan');
            }

            return sendResponse(res, 200, true, 'Detail user berhasil diambil', user);
        } catch (error) {
            console.error('Error in getUserById:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async updateProfile(req, res) {
        try {
            const { name, email } = req.body;
            const userId = req.user.id; // From authMiddleware

            await UserModel.update(userId, { name, email, role: req.user.role });

            return sendResponse(res, 200, true, 'Profil berhasil diperbarui', { name, email });
        } catch (error) {
            console.error('Error in updateProfile:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async updateUserById(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;

            const user = await UserModel.findById(id);
            if (!user) {
                return sendResponse(404, false, 'User tidak ditemukan');
            }

            await UserModel.update(id, { name, email, role });

            return sendResponse(res, 200, true, `User ID ${id} berhasil diperbarui`, { name, email, role });
        } catch (error) {
            console.error('Error in updateUserById:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async deleteProfile(req, res) {
        try {
            const userId = req.user.id;
            await UserModel.delete(userId);
            return sendResponse(res, 200, true, 'Akun Anda berhasil dihapus', null);
        } catch (error) {
            console.error('Error in deleteProfile:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }

    static async deleteUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById(id);
            if (!user) {
                return sendResponse(res, 404, false, 'User tidak ditemukan');
            }
            await UserModel.delete(id);
            return sendResponse(res, 200, true, `User ID ${id} berhasil dihapus oleh Admin`, null);
        } catch (error) {
            console.error('Error in deleteUserById:', error);
            return sendResponse(res, 500, false, 'Terjadi kesalahan pada server');
        }
    }
}

module.exports = AuthController;
