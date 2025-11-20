// ===== ANIMATION JAVASCRIPT FOR KHÁCH SẠN CÂY DỪA =====

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupIntersectionObserver();
    setupFormAnimations();
    setupNotificationSystem();
});

// Initialize basic animations
function initializeAnimations() {
    // Add page transition animation
    document.body.classList.add('page-transition');
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Setup loading states
    setupLoadingStates();
}

// Intersection Observer for scroll animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateOnScroll = document.querySelectorAll('.card-hover, .stagger-item');
    animateOnScroll.forEach(el => observer.observe(el));
}

// Form animations and interactions
function setupFormAnimations() {
    // Input focus animations
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.add('input-focus');
            this.parentElement.classList.add('animate-pulse');
        });
        
        input.addEventListener('blur', function() {
            this.classList.remove('input-focus');
            this.parentElement.classList.remove('animate-pulse');
        });
        
        // Add error shake animation for invalid inputs
        input.addEventListener('invalid', function() {
            this.classList.add('error-shake');
            setTimeout(() => this.classList.remove('error-shake'), 500);
        });
    });

    // Form submission animations
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('animate-pulse');
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...';
            }
        });
    });
}

// Loading states
function setupLoadingStates() {
    // Show loading spinner for async operations
    window.showLoading = function(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = '<div class="loading-spinner"></div>';
            element.classList.add('animate-pulse');
        }
    };

    window.hideLoading = function(element, content = '') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove('animate-pulse');
            element.innerHTML = content;
        }
    };
}

// Notification system with animations
function setupNotificationSystem() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }

    window.showNotification = function(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.className = `notification ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">×</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
        
        return notification;
    };
}

// Button click animations
document.addEventListener('click', function(e) {
    if (e.target.matches('button, .btn, a[class*="btn"]')) {
        const button = e.target;
        
        // Add click animation
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 200);
        
        // Create ripple effect
        createRippleEffect(e, button);
    }
});

// Ripple effect for buttons
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    // Add ripple keyframes if not exists
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Smooth page transitions
function setupPageTransitions() {
    // Intercept navigation links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href]');
        if (link && link.href && !link.href.startsWith('javascript:') && !link.target) {
            e.preventDefault();
            
            // Add exit animation
            document.body.style.opacity = '0';
            document.body.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        }
    });
}

// Counter animation for numbers
function animateCounter(element, start, end, duration = 1000) {
    const startTime = performance.now();
    const startValue = parseInt(start) || 0;
    const endValue = parseInt(end) || 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString('vi-VN');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Auto-animate counters when they come into view
function setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const endValue = element.getAttribute('data-counter');
                animateCounter(element, 0, endValue);
                counterObserver.unobserve(element);
            }
        });
    });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// Typing animation for text
function typeWriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Parallax scrolling effect
function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Image lazy loading with fade-in animation
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('animate-fade-in');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Enhanced modal animations
function enhanceModals() {
    const modals = document.querySelectorAll('[data-modal]');
    
    modals.forEach(modal => {
        const openBtn = document.querySelector(`[data-modal-open="${modal.id}"]`);
        const closeBtn = modal.querySelector('[data-modal-close]');
        
        if (openBtn) {
            openBtn.addEventListener('click', () => openModal(modal));
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });
}

function openModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('modal-backdrop');
    
    setTimeout(() => {
        modal.classList.add('show');
        const content = modal.querySelector('.modal-content');
        if (content) content.classList.add('show');
    }, 10);
}

function closeModal(modal) {
    modal.classList.remove('show');
    const content = modal.querySelector('.modal-content');
    if (content) content.classList.remove('show');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-backdrop');
    }, 300);
}

// Initialize all enhanced features
document.addEventListener('DOMContentLoaded', function() {
    setupCounterAnimations();
    setupParallaxEffect();
    setupLazyLoading();
    enhanceModals();
    setupPageTransitions();
});

// Export functions for global use
window.AnimationUtils = {
    showNotification,
    animateCounter,
    typeWriter,
    openModal,
    closeModal,
    showLoading,
    hideLoading
};