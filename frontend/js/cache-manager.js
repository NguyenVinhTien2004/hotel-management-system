// Cache Manager - Quản lý cache cho ứng dụng
class CacheManager {
    static async clearAllCaches() {
        try {
            // Clear Service Worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('✅ Cleared all Service Worker caches');
            }
            
            // Clear localStorage (except user data)
            const userToken = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            localStorage.clear();
            if (userToken) localStorage.setItem('token', userToken);
            if (userData) localStorage.setItem('user', userData);
            
            // Clear sessionStorage
            sessionStorage.clear();
            
            console.log('✅ Cleared browser storage');
            return true;
        } catch (error) {
            console.error('❌ Error clearing caches:', error);
            return false;
        }
    }
    
    static async forceRefreshPage() {
        // Clear caches first
        await this.clearAllCaches();
        
        // Force reload with cache bypass
        window.location.reload(true);
    }
    
    static addCacheBustingToUrl(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}_t=${Date.now()}`;
    }
    
    static async fetchWithCacheBusting(url, options = {}) {
        const cacheBustedUrl = this.addCacheBustingToUrl(url);
        
        // Add no-cache headers
        const headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...options.headers
        };
        
        return fetch(cacheBustedUrl, {
            ...options,
            headers
        });
    }
}

// Auto-refresh data every 30 seconds for active pages
class AutoRefresh {
    constructor(refreshCallback, interval = 30000) {
        this.refreshCallback = refreshCallback;
        this.interval = interval;
        this.intervalId = null;
        this.isActive = true;
        
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Listen for focus/blur events
        window.addEventListener('focus', () => this.resume());
        window.addEventListener('blur', () => this.pause());
    }
    
    start() {
        if (this.intervalId) return;
        
        this.intervalId = setInterval(() => {
            if (this.isActive && !document.hidden) {
                this.refreshCallback();
            }
        }, this.interval);
        
        console.log(`🔄 Auto-refresh started (${this.interval/1000}s interval)`);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Auto-refresh stopped');
        }
    }
    
    pause() {
        this.isActive = false;
        console.log('⏸️ Auto-refresh paused');
    }
    
    resume() {
        this.isActive = true;
        // Refresh immediately when resuming
        if (!document.hidden) {
            this.refreshCallback();
        }
        console.log('▶️ Auto-refresh resumed');
    }
}

// Export for use in other files
window.CacheManager = CacheManager;
window.AutoRefresh = AutoRefresh;