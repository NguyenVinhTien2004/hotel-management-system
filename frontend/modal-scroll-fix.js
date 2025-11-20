// Auto-fix modal scroll issues
document.addEventListener('DOMContentLoaded', function() {
    // Fix tất cả modal hiện có
    fixExistingModals();
    
    // Theo dõi modal mới được tạo
    observeNewModals();
});

function fixExistingModals() {
    // Tìm tất cả modal
    const modals = document.querySelectorAll('.fixed.inset-0, [id*="modal"], [id*="Modal"]');
    
    modals.forEach(modal => {
        fixModalScroll(modal);
    });
}

function fixModalScroll(modal) {
    // Thêm overflow-y-auto cho modal backdrop
    modal.style.overflowY = 'auto';
    
    // Tìm modal content
    const modalContent = modal.querySelector('.bg-white, .modal-content');
    if (modalContent) {
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
    }
    
    // Tìm container flex
    const flexContainer = modal.querySelector('.flex.items-center.justify-center.min-h-screen');
    if (flexContainer) {
        flexContainer.style.padding = '20px 0';
        flexContainer.style.alignItems = 'flex-start';
    }
    
    // Fix cho mobile
    if (window.innerWidth <= 768) {
        if (modalContent) {
            modalContent.style.margin = '10px';
            modalContent.style.maxHeight = '95vh';
        }
    }
}

function observeNewModals() {
    // Theo dõi DOM changes để fix modal mới
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Kiểm tra nếu node là modal
                    if (node.classList && (
                        node.classList.contains('fixed') || 
                        node.id.includes('modal') || 
                        node.id.includes('Modal')
                    )) {
                        fixModalScroll(node);
                    }
                    
                    // Kiểm tra modal con
                    const childModals = node.querySelectorAll('.fixed.inset-0, [id*="modal"], [id*="Modal"]');
                    childModals.forEach(fixModalScroll);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Fix khi resize window
window.addEventListener('resize', function() {
    fixExistingModals();
});

// Export functions để có thể gọi từ bên ngoài
window.ModalScrollFix = {
    fixModal: fixModalScroll,
    fixAll: fixExistingModals
};