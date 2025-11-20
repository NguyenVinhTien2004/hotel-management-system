// PWA Install Prompt Handler
let deferredPrompt;
let installButton;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: Install prompt available');
    
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button
    showInstallButton();
});

// Show install button
function showInstallButton() {
    // Create install button if not exists
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.innerHTML = '📱 Cài đặt App';
        installButton.className = 'pwa-install-btn';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #52c41a;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
            z-index: 1000;
            animation: bounce 2s infinite;
        `;
        
        installButton.addEventListener('click', installPWA);
        document.body.appendChild(installButton);
    }
    
    installButton.style.display = 'block';
}

// Install PWA function
async function installPWA() {
    if (!deferredPrompt) {
        console.log('PWA: No install prompt available');
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA: User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        hideInstallButton();
    } else {
        console.log('PWA: User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    deferredPrompt = null;
}

// Hide install button
function hideInstallButton() {
    if (installButton) {
        installButton.style.display = 'none';
    }
}

// Listen for app installed event
window.addEventListener('appinstalled', (evt) => {
    console.log('PWA: App was installed');
    hideInstallButton();
    
    // Show success message
    if (window.AnimationUtils && window.AnimationUtils.showNotification) {
        window.AnimationUtils.showNotification('App đã được cài đặt thành công! 🎉', 'success');
    }
});

// Check if app is already installed
function isAppInstalled() {
    // Check if running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// Hide install button if app is already installed
if (isAppInstalled()) {
    console.log('PWA: App is already installed');
} else {
    console.log('PWA: App is not installed, showing install option');
}

// iOS Safari install instructions
function showIOSInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isAppInstalled()) {
        const iosPrompt = document.createElement('div');
        iosPrompt.innerHTML = `
            <div style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #52c41a;
                color: white;
                padding: 15px;
                text-align: center;
                font-size: 14px;
                z-index: 1001;
            ">
                📱 Để cài đặt app: Nhấn nút Share <span style="font-size: 18px;">⬆️</span> rồi chọn "Add to Home Screen"
                <button onclick="this.parentElement.remove()" style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(iosPrompt);
        
        // Auto hide after 10 seconds
        setTimeout(() => {
            if (iosPrompt.parentElement) {
                iosPrompt.remove();
            }
        }, 10000);
    }
}

// Show iOS instructions after page load
window.addEventListener('load', () => {
    setTimeout(showIOSInstallInstructions, 2000);
});

// Export functions for global use
window.PWAInstaller = {
    install: installPWA,
    isInstalled: isAppInstalled,
    showInstallButton,
    hideInstallButton
};