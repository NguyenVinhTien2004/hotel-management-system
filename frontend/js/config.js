// Cấu hình chung cho toàn bộ ứng dụng
const AppConfig = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3001/api',
    
    // Tự động phát hiện cổng có sẵn
    getApiUrl() {
        // Lấy hostname và port hiện tại
        const hostname = window.location.hostname;
        const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
        
        console.log('Current hostname:', hostname);
        console.log('Current port:', port);
        
        // Nếu đang chạy trên localhost hoặc 127.0.0.1
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return this.API_URL;
        }
        
        // Nếu đang chạy trên HTTPS (production)
        if (window.location.protocol === 'https:') {
            return `https://${hostname}/api`;
        }
        
        // Nếu đang chạy trên IP local (mobile access)
        if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
            return `http://${hostname}:3001/api`;
        }
        
        // Default fallback
        return `http://${hostname}:3001/api`;
    },
    
    getImageUrl(imagePath) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${this.API_BASE_URL}${imagePath}`;
        }
        
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        if (protocol === 'https:') {
            return `https://${hostname}${imagePath}`;
        } else {
            return `http://${hostname}:3001${imagePath}`;
        }
    }
};

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
