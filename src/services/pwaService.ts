// Progressive Web App Service with Offline Support and Mobile Features
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

interface PWADatabase extends DBSchema {
  documents: {
    key: string;
    value: {
      id: string;
      title: string;
      content: string;
      lastModified: string;
      synced: boolean;
      offline: boolean;
    };
  };
  settings: {
    key: string;
    value: any;
  };
  cache: {
    key: string;
    value: {
      url: string;
      data: any;
      timestamp: string;
      expiry: string;
    };
  };
}

export interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PWAService {
  private db: IDBPDatabase<PWADatabase> | null = null;
  private installPrompt: InstallPromptEvent | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: Array<{ action: string; data: any }> = [];

  constructor() {
    this.initializeDB();
    this.setupEventListeners();
    this.registerServiceWorker();
    this.setupInstallPrompt();
  }

  public async initialize(): Promise<void> {
    await this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    try {
      this.db = await openDB<PWADatabase>('ai-humanizer-db', 1, {
        upgrade(db) {
          // Documents store
          if (!db.objectStoreNames.contains('documents')) {
            db.createObjectStore('documents', { keyPath: 'id' });
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }

          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'url' });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  private setupEventListeners(): void {
    // Online/Offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.notifyConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyConnectionStatus('offline');
    });

    // Visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineData();
      }
    });

    // Handle app shortcuts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SHORTCUT_ACTION') {
          this.handleShortcutAction(event.data.action);
        }
      });
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailableNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as InstallPromptEvent;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.trackEvent('app_installed');
    });
  }

  // Installation Management
  public canInstall(): boolean {
    return this.installPrompt !== null;
  }

  public async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.trackEvent('install_accepted');
        return true;
      } else {
        this.trackEvent('install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  }

  private showInstallBanner(): void {
    // This would show a custom install banner
    const event = new CustomEvent('show-install-banner');
    window.dispatchEvent(event);
  }

  // Offline Data Management
  public async saveDocumentOffline(document: any): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.put('documents', {
        ...document,
        synced: this.isOnline,
        offline: !this.isOnline,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save document offline:', error);
    }
  }

  public async getOfflineDocuments(): Promise<any[]> {
    if (!this.db) return [];

    try {
      return await this.db.getAll('documents');
    } catch (error) {
      console.error('Failed to get offline documents:', error);
      return [];
    }
  }

  public async deleteOfflineDocument(id: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.delete('documents', id);
    } catch (error) {
      console.error('Failed to delete offline document:', error);
    }
  }

  // Settings Management
  public async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.put('settings', { key, value });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  }

  public async getSetting(key: string): Promise<any> {
    if (!this.db) return null;

    try {
      const result = await this.db.get('settings', key);
      return result?.value || null;
    } catch (error) {
      console.error('Failed to get setting:', error);
      return null;
    }
  }

  // Cache Management
  public async cacheData(url: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) return;

    try {
      const expiry = new Date(Date.now() + ttl).toISOString();
      await this.db.put('cache', {
        url,
        data,
        timestamp: new Date().toISOString(),
        expiry
      });
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  public async getCachedData(url: string): Promise<any> {
    if (!this.db) return null;

    try {
      const cached = await this.db.get('cache', url);
      if (!cached) return null;

      // Check if expired
      if (new Date() > new Date(cached.expiry)) {
        await this.db.delete('cache', url);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // Background Sync
  private async syncOfflineData(): Promise<void> {
    if (!this.db || !this.isOnline) return;

    try {
      // Sync unsynced documents
      const allDocs = await this.db.getAll('documents');
      const unsyncedDocs = allDocs.filter(doc => !doc.synced);
      
      for (const doc of unsyncedDocs) {
        try {
          // Attempt to sync with backend
          await this.syncDocumentToBackend(doc);
          
          // Mark as synced
          await this.db.put('documents', { ...doc, synced: true, offline: false });
        } catch (error) {
          console.error('Failed to sync document:', doc.id, error);
        }
      }

      // Process sync queue
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue.shift();
        if (item) {
          try {
            await this.processSyncQueueItem(item);
          } catch (error) {
            console.error('Failed to process sync queue item:', error);
            // Re-add to queue for retry
            this.syncQueue.push(item);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private async syncDocumentToBackend(document: any): Promise<void> {
    // This would sync with your actual backend API
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document)
    });

    if (!response.ok) {
      throw new Error('Failed to sync document');
    }
  }

  private async processSyncQueueItem(item: { action: string; data: any }): Promise<void> {
    // Process different types of sync actions
    switch (item.action) {
      case 'humanize':
        // Retry humanization request
        break;
      case 'detect':
        // Retry detection request
        break;
      case 'export':
        // Retry export request
        break;
      default:
        console.warn('Unknown sync action:', item.action);
    }
  }

  public addToSyncQueue(action: string, data: any): void {
    this.syncQueue.push({ action, data });
  }

  // Push Notifications
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public async showNotification(options: NotificationOptions): Promise<void> {
    if (!await this.requestNotificationPermission()) {
      return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/logo192.png',
        badge: options.badge || '/badge.png',
        tag: options.tag,
        data: options.data,
        actions: options.actions
      });
    } else {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo192.png'
      });
    }
  }

  private notifyConnectionStatus(status: 'online' | 'offline'): void {
    const event = new CustomEvent('connection-status-changed', {
      detail: { status, isOnline: this.isOnline }
    });
    window.dispatchEvent(event);

    if (status === 'offline') {
      this.showNotification({
        title: 'You\'re offline',
        body: 'Don\'t worry! You can continue working. Changes will sync when you\'re back online.',
        tag: 'offline-notification'
      });
    }
  }

  private showUpdateAvailableNotification(): void {
    this.showNotification({
      title: 'Update Available',
      body: 'A new version of AI Humanizer is available. Refresh to update.',
      tag: 'update-available',
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }

  private handleShortcutAction(action: string): void {
    const event = new CustomEvent('shortcut-action', { detail: { action } });
    window.dispatchEvent(event);
  }

  // Mobile-specific features
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  public async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Sharing failed:', error);
        return false;
      }
    }
    return false;
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  // Analytics and tracking
  private trackEvent(event: string, data?: any): void {
    // Track PWA-specific events
    console.log('PWA Event:', event, data);
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', event, {
        event_category: 'PWA',
        ...data
      });
    }
  }

  // Utility methods
  public getConnectionInfo(): any {
    return {
      isOnline: this.isOnline,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0
    };
  }

  public async clearCache(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.clear('cache');
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  public async getStorageUsage(): Promise<any> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          percentage: estimate.usage && estimate.quota ? 
            Math.round((estimate.usage / estimate.quota) * 100) : 0
        };
      } catch (error) {
        console.error('Failed to get storage usage:', error);
      }
    }
    return null;
  }

  public async shareFile(): Promise<void> {
    try {
      if ('share' in navigator) {
        await (navigator as any).share({
          title: 'AI Humanizer Document',
          text: 'Check out this document from AI Humanizer!',
          url: window.location.href
        });
      } else {
         // Fallback for browsers that don't support Web Share API
         await (navigator as any).clipboard.writeText(window.location.href);
         console.log('Link copied to clipboard');
       }
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  }
}

export const pwaService = new PWAService();
export default pwaService;