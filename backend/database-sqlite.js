const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo database SQLite
const dbPath = path.join(__dirname, 'hotel.db');
const db = new sqlite3.Database(dbPath);

// Wrapper để sử dụng Promise
const pool = {
    execute: (query, params = []) => {
        return new Promise((resolve, reject) => {
            if (query.trim().toUpperCase().startsWith('SELECT')) {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve([rows]);
                });
            } else {
                db.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
                });
            }
        });
    }
};

async function testConnection() {
    console.log('✅ SQLite database ready!');
}

async function initDatabase() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'staff',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            price REAL NOT NULL,
            capacity INTEGER NOT NULL,
            image TEXT,
            status TEXT DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            email TEXT,
            address TEXT,
            id_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            room_id INTEGER NOT NULL,
            room_number TEXT NOT NULL,
            room_name TEXT,
            room_type TEXT,
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            guest_count INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            payment_method TEXT DEFAULT 'cash',
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            room_number TEXT NOT NULL,
            room_name TEXT,
            room_rating INTEGER NOT NULL CHECK (room_rating >= 1 AND room_rating <= 5),
            service_rating INTEGER NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
            comment TEXT,
            check_in DATE,
            check_out DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            room_charges REAL NOT NULL,
            service_charges REAL DEFAULT 0,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS invoice_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            price REAL NOT NULL,
            total REAL NOT NULL
        )`,
        
        `CREATE TABLE IF NOT EXISTS admin_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            admin_name TEXT NOT NULL,
            action TEXT NOT NULL,
            target_type TEXT NOT NULL,
            target_id INTEGER NOT NULL,
            reason TEXT,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            booking_id INTEGER NULL,
            feedback_id INTEGER NULL,
            service_id INTEGER NULL,
            for_customers BOOLEAN DEFAULT FALSE,
            read_status BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];
    
    for (const table of tables) {
        await pool.execute(table);
    }
    
    await addSampleRoomsIfEmpty();
    console.log('✅ SQLite database initialized!');
}

async function addSampleRoomsIfEmpty() {
    try {
        const [existingRooms] = await pool.execute('SELECT COUNT(*) as count FROM rooms');
        if (existingRooms[0].count > 0) return;
        
        const sampleRooms = [
            ['101', 'Phòng Hoa Sen', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            ['102', 'Phòng Hoa Đào', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            ['201', 'Phòng Biển Xanh', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            ['202', 'Phòng Biển Bạc', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            ['301', 'Phòng Gia Đình Hạnh Phúc', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'],
            ['401', 'Phòng VIP Hoàng Gia', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available']
        ];
        
        for (const room of sampleRooms) {
            await pool.execute(
                'INSERT INTO rooms (number, name, type, price, capacity, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                room
            );
        }
        
        console.log(`✅ Added ${sampleRooms.length} sample rooms`);
    } catch (error) {
        console.error('❌ Error adding sample rooms:', error);
    }
}

module.exports = {
    pool,
    testConnection,
    initDatabase
};