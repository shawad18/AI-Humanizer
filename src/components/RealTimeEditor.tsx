// Real-Time Collaborative Text Editor with Live AI Detection
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  Paper,
  Alert,
  LinearProgress,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Psychology as AiIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { websocketService, CursorPosition } from '../services/websocketService';
import { advancedDetectionService } from '../services/advancedDetectionService';

interface RealTimeEditorProps {
  documentId: string;
  initialText?: string;
  onTextChange?: (text: string) => void;
  onAIDetectionResult?: (result: any) => void;
  readOnly?: boolean;
}

interface CollaboratorInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  lastSeen: string;
}

interface AIDetectionHighlight {
  start: number;
  end: number;
  confidence: number;
  type: 'high' | 'medium' | 'low';
}

const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const RealTimeEditor: React.FC<RealTimeEditorProps> = ({
  documentId,
  initialText = '',
  onTextChange,
  onAIDetectionResult,
  readOnly = false
}) => {
  const [text, setText] = useState(initialText);
  const [collaborators, setCollaborators] = useState<Map<string, CollaboratorInfo>>(new Map());
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [aiDetectionResults, setAiDetectionResults] = useState<AIDetectionHighlight[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorPosition = useRef<number>(0);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await websocketService.connect(documentId);
        websocketService.joinDocument(documentId);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    initializeConnection();

    // Set up event listeners
    websocketService.on('connection_established', () => {
      setConnectionStatus('connected');
    });

    websocketService.on('connection_lost', () => {
      setConnectionStatus('disconnected');
    });

    websocketService.on('user_joined', handleUserJoined);
    websocketService.on('user_left', handleUserLeft);
    websocketService.on('text_change', handleRemoteTextChange);
    websocketService.on('cursor_update', handleCursorUpdate);
    websocketService.on('ai_detection_result', handleAIDetectionResult);

    return () => {
      websocketService.leaveDocument(documentId);
      websocketService.off('user_joined', handleUserJoined);
      websocketService.off('user_left', handleUserLeft);
      websocketService.off('text_change', handleRemoteTextChange);
      websocketService.off('cursor_update', handleCursorUpdate);
      websocketService.off('ai_detection_result', handleAIDetectionResult);
    };
  }, [documentId]);

  const handleUserJoined = useCallback((user: any) => {
    const color = COLLABORATOR_COLORS[collaborators.size % COLLABORATOR_COLORS.length];
    setCollaborators(prev => new Map(prev.set(user.id, {
      ...user,
      color,
      isActive: true,
      lastSeen: new Date().toISOString()
    })));
  }, [collaborators.size]);

  const handleUserLeft = useCallback((user: any) => {
    setCollaborators(prev => {
      const newMap = new Map(prev);
      newMap.delete(user.id);
      return newMap;
    });
    setCursors(prev => {
      const newMap = new Map(prev);
      newMap.delete(user.id);
      return newMap;
    });
  }, []);

  const handleRemoteTextChange = useCallback((change: any) => {
    // Apply operational transformation here
    setText(change.text);
    if (onTextChange) {
      onTextChange(change.text);
    }
  }, [onTextChange]);

  const handleCursorUpdate = useCallback((cursor: CursorPosition) => {
    setCursors(prev => new Map(prev.set(cursor.userId, cursor)));
  }, []);

  const handleAIDetectionResult = useCallback((result: any) => {
    setIsDetecting(false);
    setAiDetectionResults(result.highlights || []);
    if (onAIDetectionResult) {
      onAIDetectionResult(result);
    }
  }, [onAIDetectionResult]);

  const handleTextChangeLocal = useCallback((newText: string) => {
    setText(newText);
    
    // Send change to other collaborators
    if (!readOnly) {
      websocketService.sendTextChange(documentId, {
        text: newText,
        timestamp: new Date().toISOString()
      });
    }

    // Trigger AI detection with debounce
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    detectionTimeoutRef.current = setTimeout(() => {
      if (newText.trim().length > 50) {
        setIsDetecting(true);
        websocketService.requestAIDetection(documentId, newText);
      }
    }, 1000);

    if (onTextChange) {
      onTextChange(newText);
    }
  }, [documentId, readOnly, onTextChange]);

  const handleCursorPositionChange = useCallback(() => {
    if (textFieldRef.current && !readOnly) {
      const position = textFieldRef.current.selectionStart || 0;
      lastCursorPosition.current = position;

      const user = JSON.parse(localStorage.getItem('ai-humanizer-user') || '{}');
      const cursorData: CursorPosition = {
        userId: user.id || 'anonymous',
        userName: user.name || 'Anonymous',
        position,
        selection: textFieldRef.current.selectionStart !== textFieldRef.current.selectionEnd 
          ? { start: textFieldRef.current.selectionStart || 0, end: textFieldRef.current.selectionEnd || 0 }
          : undefined,
        color: user.color || '#1976d2'
      };

      websocketService.sendCursorPosition(documentId, cursorData);
    }
  }, [documentId, readOnly]);

  const renderCollaborators = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Collaborators:
      </Typography>
      {Array.from(collaborators.values()).map(collaborator => (
        <Tooltip key={collaborator.id} title={`${collaborator.name} (${collaborator.email})`}>
          <Badge
            color={collaborator.isActive ? 'success' : 'default'}
            variant="dot"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: collaborator.color,
                fontSize: '0.875rem'
              }}
            >
              {collaborator.name.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </Tooltip>
      ))}
      {collaborators.size === 0 && (
        <Typography variant="body2" color="text.secondary">
          No other collaborators
        </Typography>
      )}
    </Box>
  );

  const renderConnectionStatus = () => {
    const statusConfig = {
      connecting: { color: 'warning', text: 'Connecting...', icon: <EditIcon /> },
      connected: { color: 'success', text: 'Connected', icon: <EyeIcon /> },
      disconnected: { color: 'error', text: 'Disconnected', icon: <WarningIcon /> }
    };

    const config = statusConfig[connectionStatus];

    return (
      <Chip
        icon={config.icon}
        label={config.text}
        color={config.color as any}
        size="small"
        sx={{ mb: 1 }}
      />
    );
  };

  const renderAIDetectionStatus = () => {
    if (isDetecting) {
      return (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AiIcon color="primary" />
            <Typography variant="body2">Analyzing text for AI patterns...</Typography>
          </Box>
          <LinearProgress />
        </Box>
      );
    }

    if (aiDetectionResults.length > 0) {
      const highRisk = aiDetectionResults.filter(r => r.type === 'high').length;
      const mediumRisk = aiDetectionResults.filter(r => r.type === 'medium').length;

      return (
        <Alert 
          severity={highRisk > 0 ? 'warning' : mediumRisk > 0 ? 'info' : 'success'}
          sx={{ mb: 2 }}
        >
          AI Detection: {highRisk > 0 && `${highRisk} high-risk sections`}
          {mediumRisk > 0 && ` ${mediumRisk} medium-risk sections`}
          {highRisk === 0 && mediumRisk === 0 && 'Text appears human-written'}
        </Alert>
      );
    }

    return null;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Real-Time Collaborative Editor</Typography>
        {renderConnectionStatus()}
      </Box>

      {renderCollaborators()}
      {renderAIDetectionStatus()}

      <TextField
        inputRef={textFieldRef}
        fullWidth
        multiline
        rows={20}
        value={text}
        onChange={(e) => handleTextChangeLocal(e.target.value)}
        onSelect={handleCursorPositionChange}
        onKeyUp={handleCursorPositionChange}
        onClick={handleCursorPositionChange}
        placeholder="Start typing to collaborate in real-time..."
        disabled={readOnly || connectionStatus === 'disconnected'}
        sx={{
          '& .MuiInputBase-root': {
            position: 'relative',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: 1.5,
          }
        }}
      />

      {/* Cursor overlays would be rendered here in a real implementation */}
      {cursors.size > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Active cursors: {cursors.size}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RealTimeEditor;