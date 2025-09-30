// WebSocket Service for Real-Time Collaboration
import { API_CONFIG, WS_CONFIG } from '../config/api';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
  documentId?: string;
}

export interface CollaborationEvent {
  type: 'cursor_move' | 'text_change' | 'user_join' | 'user_leave' | 'ai_detection' | 'selection_change';
  data: any;
  userId: string;
  timestamp: string;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  selection?: { start: number; end: number };
  color: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Initialize event listener maps
    const eventTypes = [
      'connection_established',
      'connection_lost',
      'message_received',
      'collaboration_event',
      'ai_detection_result',
      'user_joined',
      'user_left',
      'cursor_update',
      'text_change',
      'error'
    ];

    eventTypes.forEach(type => {
      this.eventListeners.set(type, new Set());
    });
  }

  public connect(documentId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('ai-humanizer-token');
        const wsUrl = `${API_CONFIG.CURRENT.WS_URL}${documentId ? `?documentId=${documentId}` : ''}${token ? `&token=${token}` : ''}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          this.emit('connection_established', { documentId });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('connection_lost', { code: event.code, reason: event.reason });
          
          if (!event.wasClean && this.reconnectAttempts < WS_CONFIG.maxReconnectAttempts) {
            this.scheduleReconnect(documentId);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.stopHeartbeat();
    this.clearReconnectTimer();
  }

  private scheduleReconnect(documentId?: string) {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${WS_CONFIG.maxReconnectAttempts})`);
      this.connect(documentId);
    }, WS_CONFIG.reconnectInterval);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          payload: {},
          timestamp: new Date().toISOString()
        });
      }
    }, WS_CONFIG.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    this.emit('message_received', message);

    switch (message.type) {
      case 'collaboration_event':
        this.handleCollaborationEvent(message.payload);
        break;
      case 'ai_detection_result':
        this.emit('ai_detection_result', message.payload);
        break;
      case 'user_joined':
        this.emit('user_joined', message.payload);
        break;
      case 'user_left':
        this.emit('user_left', message.payload);
        break;
      case 'cursor_update':
        this.emit('cursor_update', message.payload);
        break;
      case 'text_change':
        this.emit('text_change', message.payload);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleCollaborationEvent(event: CollaborationEvent) {
    this.emit('collaboration_event', event);
    this.emit(event.type, event.data);
  }

  public send(message: WebSocketMessage) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Event system
  public on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Collaboration-specific methods
  public joinDocument(documentId: string) {
    this.send({
      type: 'join_document',
      payload: { documentId },
      timestamp: new Date().toISOString(),
      documentId
    });
  }

  public leaveDocument(documentId: string) {
    this.send({
      type: 'leave_document',
      payload: { documentId },
      timestamp: new Date().toISOString(),
      documentId
    });
  }

  public sendTextChange(documentId: string, change: any) {
    this.send({
      type: 'text_change',
      payload: change,
      timestamp: new Date().toISOString(),
      documentId
    });
  }

  public sendCursorPosition(documentId: string, position: CursorPosition) {
    this.send({
      type: 'cursor_position',
      payload: position,
      timestamp: new Date().toISOString(),
      documentId
    });
  }

  public requestAIDetection(documentId: string, text: string) {
    this.send({
      type: 'ai_detection_request',
      payload: { text },
      timestamp: new Date().toISOString(),
      documentId
    });
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;