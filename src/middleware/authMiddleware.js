const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { sendResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return sendResponse(res, 401, false, 'Tidak ada token, akses ditolak');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return sendResponse(res, 401, false, 'User tidak ditemukan');
        }

        req.user = user;
        next();
    } catch (error) {
        return sendResponse(res, 401, false, 'Token tidak valid');
    }
};

module.exports = authMiddleware;
