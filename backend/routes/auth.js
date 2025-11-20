const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Đăng ký tài khoản khách hàng
router.post('/register', async (req, res) => {
    try {
        const { username, name, email, password, phone } = req.body;
        
        if (!username || !name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin' 
            });
        }

        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Tên đăng nhập đã tồn tại' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, name, email, hashedPassword, 'customer']
        );

        if (phone) {
            await pool.execute(
                'INSERT INTO customers (name, phone, email, address, id_number) VALUES (?, ?, ?, ?, ?)',
                [name, phone, email, '', '']
            );
        }
        
        res.status(201).json({ 
            success: true,
            message: 'Đăng ký thành công!',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
        });
    }
});

// Đăng nhập khách hàng
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
            });
        }
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
            });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                name: user.name,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
        });
    }
});

// Đăng nhập admin/staff
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
            });
        }

        // Admin mặc định
        if (password === '@') {
            const token = jwt.sign(
                { 
                    id: 1, 
                    username: username, 
                    role: 'admin',
                    name: username,
                    email: `${username}@hotel.com`
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                message: 'Đăng nhập admin thành công',
                token,
                user: {
                    id: 1,
                    username: username,
                    name: username,
                    email: `${username}@hotel.com`,
                    role: 'admin'
                }
            });
        }

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND (role = ? OR role = ?)',
            [username, 'admin', 'staff']
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Tài khoản không tồn tại hoặc không có quyền admin/staff' 
            });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Mật khẩu không đúng' 
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                name: user.name,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: `Đăng nhập ${user.role} thành công`,
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập admin:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
        });
    }
});

// Tạo tài khoản staff (chỉ admin)
router.post('/create-staff', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Chỉ admin mới có quyền tạo tài khoản nhân viên' 
            });
        }

        const { username, name, email, password, role = 'staff' } = req.body;
        
        if (!username || !name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin' 
            });
        }

        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Tên đăng nhập đã tồn tại' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, name, email, hashedPassword, role]
        );
        
        res.status(201).json({ 
            success: true,
            message: `Tạo tài khoản ${role} thành công`,
            userId: result.insertId
        });
    } catch (error) {
        console.error('Lỗi tạo staff:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
        });
    }
});

// Kiểm tra token hợp lệ
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Tài khoản không tồn tại' 
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Lỗi verify token:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
        });
    }
});

module.exports = router;