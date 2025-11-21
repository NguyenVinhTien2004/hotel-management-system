// Sử dụng AppConfig để hỗ trợ mobile
const API_URL = typeof AppConfig !== 'undefined' ? AppConfig.getApiUrl() : (() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `http://${window.location.hostname}:3001/api`;
    }
    return AppConfig.getApiUrl();
})();

console.log('Admin Dashboard API URL:', API_URL);
console.log('Current hostname:', window.location.hostname);

// Kiểm tra quyền truy cập
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    document.getElementById('adminName').textContent = user.name || user.username;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'admin-login.html';
}

// Tab management
function showTab(tabName) {
    // Ẩn tất cả tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Xóa active class từ tất cả tab buttons và dropdown buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-green-500', 'text-green-600', 'tab-active');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Hiển thị tab được chọn
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Thêm active class cho tab button hoặc dropdown parent
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-gray-500');
        activeBtn.classList.add('border-green-500', 'text-green-600', 'tab-active');
    } else {
        // Nếu không tìm thấy direct button, tìm dropdown parent
        const dropdownParents = {
            'customers': 'customer-dropdown',
            'bookings': 'customer-dropdown', 
            'rooms': 'resource-dropdown',
            'services': 'resource-dropdown',
            'revenue': 'finance-dropdown',
            'invoices': 'finance-dropdown',
            'feedback': 'report-dropdown',
            'logs': 'report-dropdown'
        };
        
        const parentDropdown = dropdownParents[tabName];
        if (parentDropdown) {
            const parentBtn = document.querySelector(`button[onclick*="${parentDropdown}"]`);
            if (parentBtn) {
                parentBtn.classList.remove('border-transparent', 'text-gray-500');
                parentBtn.classList.add('border-green-500', 'text-green-600', 'tab-active');
            }
        }
    }
    
    // Load dữ liệu cho tab
    switch(tabName) {
        case 'feedback':
            loadFeedback();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'rooms':
            loadAdminRooms();
            break;
        case 'services':
            loadAdminServices();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'revenue':
            loadRevenueSummary();
            loadRevenueData();
            break;
    }
}

// Load feedback
async function loadFeedback() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('feedbackList');
    
    try {
        container.innerHTML = '<p class="text-gray-500 text-center">Đang tải...</p>';
        console.log('Loading feedback from:', `${API_URL}/admin/feedback`);
        
        const response = await fetch(`${API_URL}/admin/feedback`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Feedback response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Feedback data:', data);
            displayFeedback(data.feedback);
        } else {
            const errorText = await response.text();
            console.error('Feedback API error:', response.status, errorText);
            container.innerHTML = `<p class="text-red-500 text-center">Lỗi tải dữ liệu: ${response.status}</p>`;
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        container.innerHTML = `<p class="text-red-500 text-center">Lỗi kết nối: ${error.message}</p>`;
    }
}

function displayFeedback(feedback) {
    const container = document.getElementById('feedbackList');
    
    if (feedback.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">Chưa có đánh giá nào</p>';
        return;
    }
    
    container.innerHTML = feedback.map(item => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-medium text-gray-900">${item.customer_name}</h4>
                    <p class="text-sm text-gray-600">Phòng ${item.room_number} • ${formatDate(item.check_in)} - ${formatDate(item.check_out)}</p>
                </div>
                <div class="text-right">
                    <div class="flex items-center mb-1">
                        <span class="text-xs text-gray-500 mr-2">Phòng:</span>
                        ${generateStars(item.room_rating || item.rating)}
                        <span class="ml-1 text-sm text-gray-600">${item.room_rating || item.rating}/5</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-xs text-gray-500 mr-2">Dịch vụ:</span>
                        ${generateStars(item.service_rating || item.rating)}
                        <span class="ml-1 text-sm text-gray-600">${item.service_rating || item.rating}/5</span>
                    </div>
                </div>
            </div>
            <p class="text-gray-700">${item.comment || 'Không có bình luận'}</p>
            <p class="text-xs text-gray-500 mt-2">${formatDateTime(item.created_at)}</p>
        </div>
    `).join('');
}

// Load invoices
async function loadInvoices() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/invoices`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayInvoices(data.invoices);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesTableBody');
    
    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.customer_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium">${invoice.room_name || 'Không xác định'}</div>
                <div class="text-xs text-gray-500">${invoice.room_number || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(invoice.room_charges)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(invoice.service_charges)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatCurrency(invoice.total_amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}">
                    ${getStatusText(invoice.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editInvoice(${invoice.id})" class="text-blue-600 hover:text-blue-900 mr-2">Sửa</button>
                <button onclick="deleteInvoice(${invoice.id})" class="text-red-600 hover:text-red-900">Xóa</button>
            </td>
        </tr>
    `).join('');
}

// Load customers
async function loadCustomers() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('customersTableBody');
    
    try {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Đang tải...</td></tr>';
        console.log('Loading customers from:', `${API_URL}/customers`);
        
        const response = await fetch(`${API_URL}/customers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayCustomers(data.customers);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-500">Lỗi tải dữ liệu: ${response.status}</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-500">Lỗi kết nối: ${error.message}</td></tr>`;
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.email || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.address || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-900">Xóa tài khoản</button>
            </td>
        </tr>
    `).join('');
}

// Load bookings
async function loadBookings() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayBookings(data.bookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const tbody = document.getElementById('adminBookingsTableBody');
    
    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium">${booking.customer_name}</div>
                <div class="text-xs text-gray-500">${booking.customer_phone}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium">${booking.room_number}</div>
                <div class="text-xs text-gray-500">${booking.room_name || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.check_in)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.check_out)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatCurrency(booking.total_amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <select onchange="updateBookingStatus(${booking.id}, this.value)" class="text-sm border border-gray-300 rounded px-2 py-1 ${getStatusSelectColor(booking.status)}">
                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                    <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Xác nhận</option>
                    <option value="checked_in" ${booking.status === 'checked_in' ? 'selected' : ''}>Nhận phòng</option>
                    <option value="checked_out" ${booking.status === 'checked_out' ? 'selected' : ''}>Trả phòng</option>
                    <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Hủy</option>
                </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewBookingDetails(${booking.id})" class="text-blue-600 hover:text-blue-900 mr-2">Xem chi tiết</button>
                ${booking.status !== 'cancelled' ? `<button onclick="cancelBooking(${booking.id})" class="text-red-600 hover:text-red-900">Hủy phòng</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function getStatusSelectColor(status) {
    const colors = {
        'pending': 'bg-yellow-50 text-yellow-800',
        'confirmed': 'bg-blue-50 text-blue-800',
        'checked_in': 'bg-green-50 text-green-800',
        'checked_out': 'bg-gray-50 text-gray-800',
        'cancelled': 'bg-red-50 text-red-800'
    };
    return colors[status] || 'bg-gray-50 text-gray-800';
}

async function cancelBooking(bookingId) {
    const reason = prompt('Nhập lý do hủy phòng:');
    if (!reason) return;
    
    if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;
    
    await updateBookingStatus(bookingId, 'cancelled');
}

async function updateBookingStatus(bookingId, newStatus) {
    const token = localStorage.getItem('token');
    console.log('Updating booking status:', bookingId, newStatus);
    
    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Update success:', result);
            loadBookings();
            const message = newStatus === 'cancelled' ? 'Hủy phòng thành công!' : 'Cập nhật trạng thái thành công!';
            alert(message);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Update error:', response.status, errorData);
            alert(`Lỗi ${response.status}: ${errorData.message}`);
            loadBookings();
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Lỗi kết nối server: ' + error.message);
        loadBookings();
    }
}

async function viewBookingDetails(bookingId) {
    const token = localStorage.getItem('token');
    console.log('Loading booking details for ID:', bookingId);
    console.log('API URL:', `${API_URL}/bookings/${bookingId}`);
    
    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Booking data:', data);
            displayBookingDetail(data.booking);
            document.getElementById('bookingDetailModal').classList.remove('hidden');
        } else {
            // Fallback: Tìm booking từ dữ liệu đã load
            console.log('API failed, using fallback data');
            const bookingRows = document.querySelectorAll('#adminBookingsTableBody tr');
            let fallbackBooking = null;
            
            bookingRows.forEach(row => {
                const idCell = row.cells[0];
                if (idCell && idCell.textContent == bookingId) {
                    fallbackBooking = {
                        id: bookingId,
                        customer_name: row.cells[1].querySelector('.font-medium').textContent,
                        customer_phone: row.cells[1].querySelector('.text-xs').textContent,
                        customer_email: 'Không có',
                        room_number: row.cells[2].querySelector('.font-medium').textContent,
                        room_name: row.cells[2].querySelector('.text-xs').textContent,
                        check_in: row.cells[3].textContent,
                        check_out: row.cells[4].textContent,
                        total_amount: row.cells[5].textContent.replace(/[^0-9]/g, ''),
                        status: row.cells[6].querySelector('select').value,
                        guest_count: 'Không xác định',
                        services: [],
                        created_at: new Date().toISOString()
                    };
                }
            });
            
            if (fallbackBooking) {
                displayBookingDetail(fallbackBooking);
                document.getElementById('bookingDetailModal').classList.remove('hidden');
            } else {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                alert(`Lỗi tải thông tin: ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Lỗi kết nối server: ' + error.message);
    }
}

// Load logs
async function loadLogs() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayLogs(data.logs);
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function displayLogs(logs) {
    const container = document.getElementById('logsList');
    
    if (logs.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">Chưa có hoạt động nào</p>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="border-l-4 ${getActionColor(log.action)} bg-gray-50 p-4">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium text-gray-900">${log.admin_name} - ${getActionText(log.action)} ${log.target_type}</p>
                    <p class="text-sm text-gray-600">ID: ${log.target_id}</p>
                    ${log.reason ? `<p class="text-sm text-gray-700 mt-1">Lý do: ${log.reason}</p>` : ''}
                </div>
                <span class="text-xs text-gray-500">${formatDateTime(log.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// Load admin rooms
async function loadAdminRooms() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAdminRooms(data.rooms);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function displayAdminRooms(rooms) {
    const tbody = document.getElementById('adminRoomsTableBody');
    
    tbody.innerHTML = rooms.map(room => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${room.number}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(room.price)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.capacity} người</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <select onchange="updateRoomStatus(${room.id}, this.value)" class="text-sm border border-gray-300 rounded px-2 py-1 ${getRoomStatusColor(room.status)}">
                    <option value="available" ${room.status === 'available' ? 'selected' : ''}>Có sẵn</option>
                    <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>Đã đặt</option>
                    <option value="maintenance" ${room.status === 'maintenance' ? 'selected' : ''}>Bảo trì</option>
                </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewRoomBookings(${room.id})" class="text-blue-600 hover:text-blue-900">Xem đặt phòng</button>
            </td>
        </tr>
    `).join('');
}

function getRoomStatusColor(status) {
    const colors = {
        'available': 'bg-green-50 text-green-800',
        'occupied': 'bg-red-50 text-red-800',
        'maintenance': 'bg-yellow-50 text-yellow-800'
    };
    return colors[status] || 'bg-gray-50 text-gray-800';
}

async function updateRoomStatus(roomId, newStatus) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/rooms/${roomId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadAdminRooms();
            alert('Cập nhật trạng thái phòng thành công!');
        } else {
            const error = await response.json();
            alert(error.message || 'Có lỗi xảy ra');
            loadAdminRooms();
        }
    } catch (error) {
        alert('Lỗi kết nối server');
        loadAdminRooms();
    }
}

function viewRoomBookings(roomId) {
    alert(`Xem đặt phòng cho phòng ID: ${roomId}`);
}

// Load admin services
async function loadAdminServices() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/services`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAdminServices(data.services);
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

function displayAdminServices(services) {
    const grid = document.getElementById('adminServicesGrid');
    // Lưu services vào localStorage để sử dụng khi edit
    localStorage.setItem('adminServices', JSON.stringify(services));
    
    if (services.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-500">Chưa có dịch vụ nào</p></div>';
        return;
    }
    
    grid.innerHTML = services.map(service => `
        <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    ${getServiceIcon(service.category)}
                </div>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">${getCategoryName(service.category)}</span>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">${service.name}</h4>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">${service.description || 'Không có mô tả'}</p>
            <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-green-600">${formatCurrency(service.price)}</span>
            </div>
            <div class="flex space-x-2">
                <button onclick="editAdminService(${service.id})" class="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm">Sửa</button>
                <button onclick="deleteAdminService(${service.id})" class="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 text-sm">Xóa</button>
            </div>
        </div>
    `).join('');
}

function getServiceIcon(category) {
    const icons = {
        'food': '🍽️',
        'transport': '🚗',
        'spa': '💆',
        'laundry': '👕',
        'cleaning': '🧹',
        'other': '🛎️'
    };
    return icons[category] || '🛎️';
}

function getCategoryName(category) {
    const categories = {
        'food': 'Ăn uống',
        'transport': 'Vận chuyển',
        'spa': 'Spa & Massage',
        'laundry': 'Giặt ủi',
        'cleaning': 'Dọn dẹp',
        'other': 'Khác'
    };
    return categories[category] || category;
}

// Service modal functions
function showAddServiceModal() {
    document.getElementById('serviceModalTitle').textContent = 'Thêm dịch vụ mới';
    document.getElementById('serviceSubmitBtn').textContent = 'Thêm';
    document.getElementById('addServiceForm').reset();
    document.getElementById('addServiceModal').classList.remove('hidden');
}

function hideAddServiceModal() {
    document.getElementById('addServiceModal').classList.add('hidden');
    document.getElementById('addServiceForm').reset();
}

function editAdminService(serviceId) {
    // Tìm dịch vụ từ danh sách hiện tại
    const services = JSON.parse(localStorage.getItem('adminServices') || '[]');
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Điền thông tin vào form
    document.getElementById('serviceName').value = service.name;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceCategory').value = service.category;
    document.getElementById('serviceDescription').value = service.description || '';
    
    // Thay đổi tiêu đề và nút
    document.getElementById('serviceModalTitle').textContent = 'Sửa dịch vụ';
    document.getElementById('serviceSubmitBtn').textContent = 'Cập nhật';
    document.getElementById('serviceSubmitBtn').setAttribute('data-edit-id', serviceId);
    
    showAddServiceModal();
}

async function deleteAdminService(serviceId) {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/services/${serviceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadAdminServices();
            alert('Xóa dịch vụ thành công!');
        } else {
            const error = await response.json();
            alert(error.message || 'Có lỗi xảy ra');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
}

// Modal functions
function showAddInvoiceModal() {
    document.getElementById('addInvoiceModal').classList.remove('hidden');
}

function hideAddInvoiceModal() {
    document.getElementById('addInvoiceModal').classList.add('hidden');
    document.getElementById('addInvoiceForm').reset();
    
    // Reset lại tiêu đề và nút về trạng thái tạo mới
    document.querySelector('#addInvoiceModal h3').textContent = 'Tạo hóa đơn mới';
    const submitBtn = document.querySelector('#addInvoiceForm button[type="submit"]');
    submitBtn.textContent = 'Tạo hóa đơn';
    submitBtn.removeAttribute('data-edit-id');
}

// Service form handler
document.getElementById('addServiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    let price = parseInt(document.getElementById('servicePrice').value);
    
    // Đảm bảo giá tối thiểu 1000 VND và là số hợp lệ
    if (isNaN(price) || price < 1000) {
        alert('Giá dịch vụ phải tối thiểu 1,000 VND và là số hợp lệ');
        return;
    }
    
    const serviceData = {
        name: document.getElementById('serviceName').value,
        price: price,
        category: document.getElementById('serviceCategory').value,
        description: document.getElementById('serviceDescription').value
    };
    
    const submitBtn = e.target.querySelector('#serviceSubmitBtn');
    const editId = submitBtn.getAttribute('data-edit-id');
    
    try {
        let response;
        if (editId) {
            response = await fetch(`${API_URL}/services/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceData)
            });
        } else {
            response = await fetch(`${API_URL}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceData)
            });
        }
        
        if (response.ok) {
            hideAddServiceModal();
            loadAdminServices();
            alert(editId ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ thành công!');
            submitBtn.removeAttribute('data-edit-id');
        } else {
            const errorText = await response.text();
            console.error('Service API error:', response.status, errorText);
            alert(`Lỗi: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
});

// Form handlers
document.getElementById('addInvoiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const editId = submitBtn.getAttribute('data-edit-id');
    
    const formData = {
        booking_id: parseInt(document.getElementById('bookingId').value),
        customer_name: document.getElementById('customerNameInvoice').value,
        customer_phone: document.getElementById('customerPhone').value,
        payment_method: document.getElementById('paymentMethod').value,
        room_charges: parseFloat(document.getElementById('roomCharges').value),
        reason: document.getElementById('invoiceReason').value,
        services: []
    };
    
    try {
        let response;
        if (editId) {
            // Sửa hóa đơn
            response = await fetch(`${API_URL}/admin/invoices/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Tạo hóa đơn mới
            response = await fetch(`${API_URL}/admin/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            hideAddInvoiceModal();
            loadInvoices();
            alert(editId ? 'Cập nhật hóa đơn thành công!' : 'Tạo hóa đơn thành công!');
            submitBtn.removeAttribute('data-edit-id');
        } else {
            const error = await response.json();
            alert(error.message || 'Có lỗi xảy ra');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
});

// Delete functions
async function editInvoice(id) {
    // Tìm hóa đơn cần sửa
    const invoiceRows = document.querySelectorAll('#invoicesTableBody tr');
    let invoice = null;
    
    invoiceRows.forEach(row => {
        if (row.cells[0].textContent == id) {
            invoice = {
                id: id,
                customer_name: row.cells[1].textContent,
                room_charges: row.cells[3].textContent.replace(/[^0-9]/g, ''),
                service_charges: row.cells[4].textContent.replace(/[^0-9]/g, '')
            };
        }
    });
    
    if (!invoice) {
        alert('Không tìm thấy hóa đơn');
        return;
    }
    
    // Điền thông tin vào form
    document.getElementById('customerNameInvoice').value = invoice.customer_name;
    document.getElementById('customerPhone').value = invoice.customer_phone || '';
    document.getElementById('paymentMethod').value = invoice.payment_method || 'cash';
    document.getElementById('roomCharges').value = invoice.room_charges;
    document.getElementById('bookingId').value = id;
    
    // Thay đổi tiêu đề và nút
    document.querySelector('#addInvoiceModal h3').textContent = 'Sửa hóa đơn';
    const submitBtn = document.querySelector('#addInvoiceForm button[type="submit"]');
    submitBtn.textContent = 'Cập nhật';
    submitBtn.setAttribute('data-edit-id', id);
    
    showAddInvoiceModal();
}

async function deleteInvoice(id) {
    const reason = prompt('Nhập lý do xóa hóa đơn:');
    if (!reason) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/invoices/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
            loadInvoices();
            alert('Xóa hóa đơn thành công!');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
}

async function deleteCustomer(id) {
    const reason = prompt('Nhập lý do xóa tài khoản khách hàng:');
    if (!reason) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/customers/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
            loadCustomers();
            alert('Xóa tài khoản thành công!');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
}

// Utility functions
function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return '0 VND';
    let numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Nếu số quá nhỏ (< 1000), nhân với 1000 để có định dạng hợp lý
    if (numAmount < 1000 && numAmount > 0) {
        numAmount = numAmount * 1000;
    }
    
    return new Intl.NumberFormat('vi-VN').format(numAmount) + ' VND';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '⭐' : '☆';
    }
    return stars;
}

function getStatusColor(status) {
    const colors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ thanh toán',
        'paid': 'Đã thanh toán',
        'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
}

function getActionColor(action) {
    const colors = {
        'CREATE': 'border-green-400',
        'UPDATE': 'border-blue-400',
        'DELETE': 'border-red-400'
    };
    return colors[action] || 'border-gray-400';
}

function getActionText(action) {
    const texts = {
        'CREATE': 'Tạo',
        'UPDATE': 'Cập nhật',
        'DELETE': 'Xóa'
    };
    return texts[action] || action;
}

// Thông báo
let notificationDropdownOpen = false;

function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    notificationDropdownOpen = !notificationDropdownOpen;
    
    if (notificationDropdownOpen) {
        dropdown.classList.remove('hidden');
        loadNotifications();
    } else {
        dropdown.classList.add('hidden');
    }
}

async function loadNotifications() {
    const token = localStorage.getItem('token');
    try {
        console.log('Loading notifications from:', `${API_URL}/admin/notifications`);
        const response = await fetch(`${API_URL}/admin/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Notifications response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Notifications data:', data);
            console.log('Number of notifications:', data.notifications?.length);
            displayNotifications(data.notifications || []);
            updateNotificationBadge(data.notifications || []);
        } else {
            console.error('Failed to load notifications:', response.status);
            // Hiển thị thông báo mẫu nếu API lỗi
            const sampleNotifications = [
                {
                    id: 1,
                    title: 'Đặt phòng mới',
                    message: 'Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 103',
                    created_at: new Date().toISOString(),
                    read_status: false
                },
                {
                    id: 2,
                    title: 'Đánh giá mới',
                    message: 'Nhận được đánh giá 5 sao từ khách hàng',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    read_status: false
                }
            ];
            displayNotifications(sampleNotifications);
            updateNotificationBadge(sampleNotifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        // Hiển thị thông báo mẫu khi lỗi kết nối
        const sampleNotifications = [
            {
                id: 1,
                title: 'Đặt phòng mới',
                message: 'Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 103',
                created_at: new Date().toISOString(),
                read_status: false
            }
        ];
        displayNotifications(sampleNotifications);
        updateNotificationBadge(sampleNotifications);
    }
}





function handleSimpleNotificationClick(notificationId) {
    console.log('Simple notification clicked:', notificationId);
    alert(`Bạn đã click vào thông báo #${notificationId}`);
    
    // Đánh dấu đã đọc bằng cách thay đổi màu
    const buttons = document.querySelectorAll('#notificationList button');
    buttons.forEach(btn => {
        if (btn.onclick.toString().includes(notificationId)) {
            btn.classList.remove('bg-blue-50', 'font-medium');
            btn.classList.add('bg-white');
            // Xóa dấu chấm xanh
            const dot = btn.querySelector('.bg-blue-500');
            if (dot) dot.remove();
        }
    });
    
    // Cập nhật badge
    updateSimpleBadge();
}

function updateSimpleBadge() {
    const unreadCount = document.querySelectorAll('#notificationList .bg-blue-500').length;
    const badge = document.getElementById('notificationBadge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function handleNotificationClick(notificationId) {
    console.log('Notification clicked:', notificationId);
    markAsRead(notificationId);
}

async function markAsRead(notificationId) {
    const token = localStorage.getItem('token');
    console.log('Marking notification as read:', notificationId);
    
    try {
        const response = await fetch(`${API_URL}/admin/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Mark as read response:', response.status);
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
        loadNotifications();
    }
}

// Đóng dropdown khi click bên ngoài
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notificationDropdown');
    const button = e.target.closest('button');
    
    if (!dropdown.contains(e.target) && button?.onclick !== toggleNotifications) {
        dropdown.classList.add('hidden');
        notificationDropdownOpen = false;
    }
});

// Dropdown menu functions
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isHidden = dropdown.classList.contains('hidden');
    
    // Đóng tất cả dropdown khác
    closeAllDropdowns();
    
    // Toggle dropdown hiện tại
    if (isHidden) {
        dropdown.classList.remove('hidden');
        // Trên mobile, scroll đến dropdown
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                dropdown.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('[id$="-dropdown"]').forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
}

// Đóng dropdown khi click bên ngoài
document.addEventListener('click', (e) => {
    const notificationDropdown = document.getElementById('notificationDropdown');
    const isDropdownClick = e.target.closest('.relative');
    const isNotificationClick = e.target.closest('button')?.onclick === toggleNotifications;
    
    // Đóng notification dropdown
    if (!notificationDropdown.contains(e.target) && !isNotificationClick) {
        notificationDropdown.classList.add('hidden');
        notificationDropdownOpen = false;
    }
    
    // Đóng menu dropdown nếu click bên ngoài
    if (!isDropdownClick) {
        closeAllDropdowns();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Dashboard initializing...');
    console.log('Using API URL:', API_URL);
    
    checkAuth();
    showTab('revenue'); // Hiển thị tab doanh thu đầu tiên
    loadRealNotifications(); // Load thông báo thực
    
    // Tự động cập nhật thông báo mỗi 30 giây
    setInterval(loadRealNotifications, 30000);
    
    // Handle period change for revenue
    const periodSelect = document.getElementById('revenuePeriod');
    const customInputs = document.getElementById('customDateInputs');
    
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customInputs.classList.remove('hidden');
                // Set default values
                document.getElementById('revenueYear').value = new Date().getFullYear();
                document.getElementById('revenueMonth').value = new Date().getMonth() + 1;
            } else {
                customInputs.classList.add('hidden');
            }
        });
    }
});

// Hệ thống thông báo mới
let notificationModalOpen = false;
let realNotifications = [];

function toggleNotificationModal() {
    const modal = document.getElementById('notificationModal');
    notificationModalOpen = !notificationModalOpen;
    
    if (notificationModalOpen) {
        modal.classList.remove('hidden');
        loadRealNotifications();
    } else {
        modal.classList.add('hidden');
    }
}

async function loadRealNotifications() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            realNotifications = data.notifications || [];
            displayNotifications();
            updateNotificationBadge();
        } else {
            // Nếu API lỗi, hiển thị thông báo từ bookings gần đây
            loadBookingNotifications();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        loadBookingNotifications();
    }
}

async function loadBookingNotifications() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const bookings = data.bookings || [];
            
            // Tạo thông báo từ bookings gần đây
            realNotifications = bookings.slice(0, 10).map((booking, index) => {
                const createdTime = new Date(booking.created_at);
                const now = new Date();
                const diffMinutes = Math.floor((now - createdTime) / (1000 * 60));
                
                let timeText = '';
                if (diffMinutes < 60) {
                    timeText = `${diffMinutes} phút trước`;
                } else if (diffMinutes < 1440) {
                    timeText = `${Math.floor(diffMinutes / 60)} giờ trước`;
                } else {
                    timeText = `${Math.floor(diffMinutes / 1440)} ngày trước`;
                }
                
                let type = 'booking';
                let title = 'Đặt phòng mới';
                let icon = 'fas fa-calendar-check';
                
                if (booking.status === 'checked_in') {
                    type = 'checkin';
                    title = 'Check-in thành công';
                    icon = 'fas fa-key';
                } else if (booking.status === 'checked_out') {
                    type = 'checkout';
                    title = 'Check-out hoàn tất';
                    icon = 'fas fa-door-open';
                } else if (booking.status === 'cancelled') {
                    type = 'booking';
                    title = 'Hủy đặt phòng';
                    icon = 'fas fa-calendar-times';
                }
                
                return {
                    id: booking.id,
                    type: type,
                    title: title,
                    message: `Khách ${booking.customer_name} - Phòng ${booking.room_number} (${formatDate(booking.check_in)} - ${formatDate(booking.check_out)})`,
                    time: timeText,
                    icon: icon,
                    booking_id: booking.id
                };
            });
            
            displayNotifications();
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Error loading booking notifications:', error);
    }
}

function displayNotifications() {
    const container = document.getElementById('notificationContainer');
    
    if (realNotifications.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">Không có thông báo mới</div>';
        return;
    }
    
    container.innerHTML = realNotifications.map(notification => `
        <div class="notification-item ${notification.type}">
            <div class="notification-icon ${notification.type}">
                <i class="${notification.icon}"></i>
            </div>
            <div class="flex-1">
                <div class="font-bold text-gray-900 text-lg mb-2">${notification.title}</div>
                <div class="text-gray-700 text-base mb-2 leading-relaxed">${notification.message}</div>
                <div class="text-gray-500 text-sm mb-3">${notification.time}</div>
                <div>
                    <button class="action-btn view" onclick="viewNotification(${notification.id})">Xem chi tiết</button>
                    <button class="action-btn resolve" onclick="resolveNotification(${notification.id})">Giải quyết</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    const unreadCount = realNotifications.length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function viewNotification(id) {
    // Chuyển đến tab bookings và hiển thị booking tương ứng
    showTab('bookings');
    toggleNotificationModal();
    alert(`Xem chi tiết booking #${id}`);
}

function resolveNotification(id) {
    // Xóa thông báo khỏi danh sách
    realNotifications = realNotifications.filter(n => n.id !== id);
    displayNotifications();
    updateNotificationBadge();
    alert(`Đã giải quyết thông báo #${id}`);
}

function displayBookingDetail(booking) {
    const container = document.getElementById('bookingDetailContent');
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Thông tin khách hàng -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-user mr-2 text-blue-600"></i>
                    Thông tin khách hàng
                </h4>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-sm font-medium text-gray-600">Họ tên:</span>
                        <p class="text-gray-900">${booking.customer_name}</p>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-600">Điện thoại:</span>
                        <p class="text-gray-900">${booking.customer_phone}</p>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-600">Email:</span>
                        <p class="text-gray-900">${booking.customer_email || 'Không có'}</p>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-600">Số người:</span>
                        <p class="text-gray-900 font-semibold text-blue-600">${booking.guests || booking.guest_count || 'Không xác định'} người</p>
                    </div>
                </div>
            </div>

            <!-- Thông tin phòng -->
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-bed mr-2 text-green-600"></i>
                    Thông tin phòng
                </h4>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-sm font-medium text-gray-600">Số phòng:</span>
                        <p class="text-gray-900 font-semibold">${booking.room_number}</p>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-600">Loại phòng:</span>
                        <p class="text-gray-900">${booking.room_type || booking.room_name || 'Không xác định'}</p>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-600">Ngày nhận:</span>
                        <p class="text-gray-900">${formatDate(booking.check_in)}</p>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-600">Ngày trả:</span>
                        <p class="text-gray-900">${formatDate(booking.check_out)}</p>
                    </div>
                </div>
            </div>

            <!-- Dịch vụ -->
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-concierge-bell mr-2 text-yellow-600"></i>
                    Dịch vụ đã chọn
                </h4>
                <div id="bookingServices">
                    ${booking.services && booking.services.length > 0 ? 
                        booking.services.map(service => `
                            <div class="flex justify-between items-center py-2 border-b border-yellow-200 last:border-b-0">
                                <div>
                                    <span class="font-medium">${service.name}</span>
                                    <span class="text-sm text-gray-600 ml-2">(x${service.quantity || 1})</span>
                                </div>
                                <span class="font-semibold text-yellow-700">${formatCurrency(service.price * (service.quantity || 1))}</span>
                            </div>
                        `).join('') 
                        : '<p class="text-gray-500 italic">Không có dịch vụ nào</p>'
                    }
                </div>
            </div>

            <!-- Tổng kết -->
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-calculator mr-2 text-blue-600"></i>
                    Tổng kết
                </h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Tiền phòng:</span>
                        <span class="font-semibold">${formatCurrency(booking.room_total || booking.total_amount)}</span>
                    </div>
                    ${booking.service_total ? `
                        <div class="flex justify-between">
                            <span>Tiền dịch vụ:</span>
                            <span class="font-semibold">${formatCurrency(booking.service_total)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-blue-200">
                        <span>Tổng cộng:</span>
                        <span>${formatCurrency(booking.total_amount)}</span>
                    </div>
                </div>
            </div>

            <!-- Trạng thái -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-gray-600"></i>
                    Trạng thái
                </h4>
                <div class="flex items-center space-x-4">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${getStatusSelectColor(booking.status)}">
                        ${getStatusText(booking.status)}
                    </span>
                    <span class="text-sm text-gray-600">Tạo lúc: ${formatDateTime(booking.created_at)}</span>
                </div>
            </div>
        </div>
    `;
}

function hideBookingDetailModal() {
    document.getElementById('bookingDetailModal').classList.add('hidden');
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Xác nhận',
        'checked_in': 'Nhận phòng',
        'checked_out': 'Trả phòng',
        'cancelled': 'Hủy',
        'paid': 'Đã thanh toán'
    };
    return texts[status] || status;
}

// Revenue functions
async function loadRevenueSummary() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/revenue/summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('todayRevenue').textContent = formatCurrency(data.today);
            document.getElementById('monthRevenue').textContent = formatCurrency(data.month);
            document.getElementById('yearRevenue').textContent = formatCurrency(data.year);
        }
    } catch (error) {
        console.error('Error loading revenue summary:', error);
    }
}

async function loadRevenueData() {
    const token = localStorage.getItem('token');
    const period = document.getElementById('revenuePeriod').value;
    const year = document.getElementById('revenueYear').value;
    const month = document.getElementById('revenueMonth').value;
    
    let url = `${API_URL}/admin/revenue?period=${period}`;
    if (period === 'custom' && year) {
        url += `&year=${year}`;
        if (month) {
            url += `&month=${month}`;
        }
    } else if (period === 'year') {
        url += `&year=${new Date().getFullYear()}`;
    }
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRevenueData(data);
        }
    } catch (error) {
        console.error('Error loading revenue data:', error);
    }
}

function displayRevenueData(data) {
    const { summary, dailyRevenue, roomTypeRevenue, topCustomers } = data;
    
    // Update summary stats
    document.getElementById('totalRevenue').textContent = formatCurrency(summary.totalRevenue);
    document.getElementById('totalBookings').textContent = summary.totalBookings;
    document.getElementById('serviceRevenue').textContent = formatCurrency(summary.serviceRevenue);
    
    const avgRevenue = summary.totalBookings > 0 ? summary.totalRevenue / summary.totalBookings : 0;
    document.getElementById('avgRevenue').textContent = formatCurrency(avgRevenue);
    
    // Display daily revenue
    const dailyTable = document.getElementById('dailyRevenueTable');
    dailyTable.innerHTML = dailyRevenue.map(day => `
        <tr>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(day.date)}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">${formatCurrency(day.revenue)}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${day.bookings}</td>
        </tr>
    `).join('');
    
    // Display room type revenue
    const roomTypeContainer = document.getElementById('roomTypeRevenue');
    const maxRevenue = Math.max(...roomTypeRevenue.map(r => r.revenue));
    
    roomTypeContainer.innerHTML = roomTypeRevenue.map(room => {
        const percentage = maxRevenue > 0 ? (room.revenue / maxRevenue) * 100 : 0;
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-900">${room.room_type}</span>
                        <span class="text-sm font-bold text-green-600">${formatCurrency(room.revenue)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${room.bookings} booking</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Display top customers
    const customersTable = document.getElementById('topCustomersTable');
    customersTable.innerHTML = topCustomers.map((customer, index) => `
        <tr>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-medium text-blue-600">${index + 1}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">${customer.customer_name}</span>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${customer.customer_phone}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">${formatCurrency(customer.total_spent)}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${customer.booking_count}</td>
        </tr>
    `).join('');
}



// Đóng modal khi click bên ngoài
document.addEventListener('click', (e) => {
    const modal = document.getElementById('notificationModal');
    const bookingModal = document.getElementById('bookingDetailModal');
    
    if (e.target === modal) {
        toggleNotificationModal();
    }
    if (e.target === bookingModal) {
        hideBookingDetailModal();
    }
});
