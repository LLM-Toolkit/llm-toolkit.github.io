/**
 * Service Worker Registration for Performance Optimization
 * Handles caching strategies and offline functionality
 */

class ServiceWorkerManager {
    constructor() {
        this.swPath = '/sw.js';
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                this.registerServiceWorker();
            });
        }
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register(this.swPath);
            
            console.log('ServiceWorker registration successful:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available, notify user
                        this.showUpdateNotification();
                    }
                });
            });

        } catch (error) {
            console.log('ServiceWorker registration failed:', error);
        }
    }

    showUpdateNotification() {
        // Simple update notification
        if (confirm('New content is available. Refresh to update?')) {
            window.location.reload();
        }
    }
}

// Initialize service worker manager
new ServiceWorkerManager();