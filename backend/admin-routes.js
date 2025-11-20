const express = require('express');
const { pool } = require('./database');
const router = express.Router();

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
};

// Lấy danh sách feedback
router.get('/feedback', requireAdmin, async (req, res) => {
    try {
        const [feedback] = await pool.execute(`
            SELECT f.*, b.check_in, b.check_out 
            FROM feedback f 
            JOIN bookings b ON f.booking_id = b.id 
            ORDER BY f.created_at DESC
        `);
        res.json({ feedback });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy danh sách hóa đơn
router.get('/invoices', requireAdmin, async (req, res) => {
    try {
        const [invoices] = await pool.execute(`
            SELECT i.*, b.check_in, b.check_out, b.room_number
            FROM invoices i 
            JOIN bookings b ON i.booking_id = b.id 
            ORDER BY i.created_at DESC
        `);
        
        // Lấy dịch vụ cho mỗi hóa đơn
        for (let invoice of invoices) {
            const [services] = await pool.execute(
                'SELECT * FROM invoice_services WHERE invoice_id = ?',
                [invoice.id]
            );
            invoice.services = services;
        }
        
        res.json({ invoices });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Thêm hóa đơn mới
router.post('/invoices', requireAdmin, async (req, res) => {
    try {
        const { booking_id, customer_name, room_charges, services, reason } = req.body;
        
        let service_charges = 0;
        if (services && services.length > 0) {
            service_charges = services.reduce((sum, s) => sum + s.total, 0);
        }
        
        const total_amount = room_charges + service_charges;
        
        const [result] = await pool.execute(
            'INSERT INTO invoices (booking_id, customer_name, room_charges, service_charges, total_amount) VALUES (?, ?, ?, ?, ?)',
            [booking_id, customer_name, room_charges, service_charges, total_amount]
        );
        
        const invoiceId = result.insertId;
        
        // Thêm dịch vụ vào hóa đơn
        if (services && services.length > 0) {
            for (const service of services) {
                await pool.execute(
                    'INSERT INTO invoice_services (invoice_id, service_id, service_name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                    [invoiceId, service.service_id, service.service_name, service.quantity, service.price, service.total]
                );
            }
        }
        
        // Ghi log
        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, req.user.username, 'CREATE', 'invoice', invoiceId, reason || 'Tạo hóa đơn mới']
        );
        
        res.status(201).json({ message: 'Tạo hóa đơn thành công', invoiceId });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Cập nhật hóa đơn
router.put('/invoices/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { room_charges, services, status, reason } = req.body;
        
        let service_charges = 0;
        if (services && services.length > 0) {
            service_charges = services.reduce((sum, s) => sum + s.total, 0);
        }
        
        const total_amount = room_charges + service_charges;
        
        await pool.execute(
            'UPDATE invoices SET room_charges = ?, service_charges = ?, total_amount = ?, status = ? WHERE id = ?',
            [room_charges, service_charges, total_amount, status, id]
        );
        
        // Xóa dịch vụ cũ và thêm mới
        await pool.execute('DELETE FROM invoice_services WHERE invoice_id = ?', [id]);
        
        if (services && services.length > 0) {
            for (const service of services) {
                await pool.execute(
                    'INSERT INTO invoice_services (invoice_id, service_id, service_name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, service.service_id, service.service_name, service.quantity, service.price, service.total]
                );
            }
        }
        
        // Ghi log
        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, req.user.username, 'UPDATE', 'invoice', id, reason || 'Cập nhật hóa đơn']
        );
        
        res.json({ message: 'Cập nhật hóa đơn thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Xóa hóa đơn
router.delete('/invoices/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        await pool.execute('DELETE FROM invoice_services WHERE invoice_id = ?', [id]);
        await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
        
        // Ghi log
        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, req.user.username, 'DELETE', 'invoice', id, reason || 'Xóa hóa đơn']
        );
        
        res.json({ message: 'Xóa hóa đơn thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy nhật ký hoạt động admin
router.get('/logs', requireAdmin, async (req, res) => {
    try {
        const [logs] = await pool.execute(
            'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100'
        );
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Quản lý tài khoản khách hàng
router.delete('/customers/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
        
        // Ghi log
        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, req.user.username, 'DELETE', 'customer', id, reason || 'Xóa tài khoản khách hàng']
        );
        
        res.json({ message: 'Xóa tài khoản khách hàng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;