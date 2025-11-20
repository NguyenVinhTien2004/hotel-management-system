// Helper function để lấy hình ảnh theo loại phòng
const ImageHelper = {
    // Mapping loại phòng với thư mục tương ứng
    roomTypeMapping: {
        // Tên đầy đủ
        'Phòng Đơn': 'phong-don',
        'Phòng Đôi': 'phong-doi', 
        'Phòng Gia Đình': 'phong-gia-dinh',
        'Phòng VIP': 'phong-vip',
        // Tên ngắn từ database
        'Don': 'phong-don',
        'Doi': 'phong-doi',
        'Gia Dinh': 'phong-gia-dinh',
        'VIP': 'phong-vip',
        // Thêm các biến thể khác
        'Đơn': 'phong-don',
        'Đôi': 'phong-doi',
        'Gia Đình': 'phong-gia-dinh'
    },

    // Danh sách file hình ảnh thực tế trong mỗi thư mục
    imageFiles: {
        'phong-don': ['OIP.jfif', 'OIP (1).jfif', 'OIP (2).jfif', 'OIP (3).jfif', 'OIP (4).jfif'],
        'phong-doi': ['OIP.jfif', 'OIP (1).jfif', 'OIP (2).jfif', 'OIP (3).jfif', 'OIP (5).jfif'],
        'phong-gia-dinh': ['OIP.jfif', 'OIP (1).jfif', 'OIP (2).jfif', 'OIP (3).jfif', 'OIP (4).jfif'],
        'phong-vip': ['OIP.jfif', 'OIP (1).jfif', 'OIP (2).jfif', 'OIP (3).jfif', 'OIP (5).jfif']
    },

    // Lấy hình ảnh đầu tiên theo loại phòng
    getRoomImage(roomType) {
        console.log('Getting image for room type:', roomType); // Debug
        const folderName = this.roomTypeMapping[roomType];
        console.log('Mapped to folder:', folderName); // Debug
        if (!folderName || !this.imageFiles[folderName]) {
            console.log('No folder or files found, using placeholder'); // Debug
            return './images/placeholder.jpg';
        }
        const imagePath = `./images/${folderName}/${this.imageFiles[folderName][0]}`;
        console.log('Final image path:', imagePath); // Debug
        return imagePath;
    },

    // Lấy tất cả hình ảnh trong thư mục của loại phòng
    getAllRoomImages(roomType) {
        const folderName = this.roomTypeMapping[roomType];
        if (!folderName || !this.imageFiles[folderName]) {
            return [];
        }
        
        return this.imageFiles[folderName].map(file => 
            `./images/${folderName}/${file}`
        );
    },

    // Lấy hình ảnh ngẫu nhiên theo loại phòng
    getRandomRoomImage(roomType) {
        const images = this.getAllRoomImages(roomType);
        if (images.length === 0) return './images/placeholder.jpg';
        
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    },

    // Lấy hình ảnh theo số phòng (mỗi phòng 1 hình khác nhau)
    getRoomImageByNumber(roomType, roomNumber) {
        const images = this.getAllRoomImages(roomType);
        if (images.length === 0) return './images/placeholder.jpg';
        
        // Dùng số phòng để chọn hình
        const index = (parseInt(roomNumber) || 0) % images.length;
        return images[index];
    }
};

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageHelper;
}