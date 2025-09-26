import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  AvatarGroup,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Menu,
  MenuItem,
  Alert
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Chat as ChatIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Circle as CircleIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  cursor?: {
    position: number;
    selection?: { start: number; end: number };
  };
  lastSeen: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system';
}

interface CollaborationPanelProps {
  documentId: string;
  isOwner: boolean;
  onTextChange?: (text: string, userId: string) => void;
  onCursorChange?: (position: number, userId: string) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  documentId,
  isOwner,
  onTextChange,
  onCursorChange
}) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate real-time collaboration data
  useEffect(() => {
    // Mock collaborators data
    const mockCollaborators: Collaborator[] = [
      {
        id: user?.id || '1',
        name: user?.name || 'You',
        email: user?.email || 'you@example.com',
        role: 'owner',
        status: 'online',
        lastSeen: new Date()
      },
      {
        id: '2',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'editor',
        status: 'online',
        cursor: { position: 150, selection: { start: 145, end: 160 } },
        lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        id: '3',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'viewer',
        status: 'away',
        lastSeen: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      }
    ];

    setCollaborators(mockCollaborators);

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: '2',
        userName: 'Alice Johnson',
        message: 'I\'ve made some edits to the introduction. What do you think?',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'message'
      },
      {
        id: '2',
        userId: 'system',
        userName: 'System',
        message: 'Bob Smith joined the document',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        type: 'system'
      },
      {
        id: '3',
        userId: user?.id || '1',
        userName: user?.name || 'You',
        message: 'Looks good! I\'ll review the rest of the document.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'message'
      }
    ];

    setChatMessages(mockMessages);
  }, [user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return <AdminIcon fontSize="small" />;
      case 'editor': return <EditIcon fontSize="small" />;
      case 'viewer': return <VisibilityIcon fontSize="small" />;
    }
  };

  const handleInviteCollaborator = () => {
    if (inviteEmail.trim()) {
      // Simulate adding a new collaborator
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'offline',
        lastSeen: new Date()
      };

      setCollaborators(prev => [...prev, newCollaborator]);
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        message: `${newCollaborator.name} was invited to the document`,
        timestamp: new Date(),
        type: 'system'
      };
      
      setChatMessages(prev => [...prev, systemMessage]);
      
      setInviteEmail('');
      setShowInviteDialog(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.id || '1',
        userName: user?.name || 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'message'
      };

      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleCollaboratorMenuClick = (event: React.MouseEvent<HTMLElement>, collaborator: Collaborator) => {
    setAnchorEl(event.currentTarget);
    setSelectedCollaborator(collaborator);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCollaborator(null);
  };

  const handleChangeRole = (newRole: 'editor' | 'viewer') => {
    if (selectedCollaborator) {
      setCollaborators(prev => 
        prev.map(c => 
          c.id === selectedCollaborator.id 
            ? { ...c, role: newRole }
            : c
        )
      );
      handleMenuClose();
    }
  };

  const handleRemoveCollaborator = () => {
    if (selectedCollaborator) {
      setCollaborators(prev => prev.filter(c => c.id !== selectedCollaborator.id));
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        message: `${selectedCollaborator.name} was removed from the document`,
        timestamp: new Date(),
        type: 'system'
      };
      
      setChatMessages(prev => [...prev, systemMessage]);
      handleMenuClose();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Collaboration
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setShowChat(!showChat)}
              color={showChat ? 'primary' : 'default'}
            >
              <Badge badgeContent={chatMessages.filter(m => m.type === 'message').length} color="error">
                <ChatIcon />
              </Badge>
            </IconButton>
            {isOwner && (
              <IconButton size="small" onClick={() => setShowInviteDialog(true)}>
                <PersonAddIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Active Collaborators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup max={4}>
            {collaborators.filter(c => c.status === 'online').map(collaborator => (
              <Tooltip key={collaborator.id} title={`${collaborator.name} (${collaborator.role})`}>
                <Avatar
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: `2px solid ${getStatusColor(collaborator.status)}`
                  }}
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
          <Typography variant="body2" color="text.secondary">
            {collaborators.filter(c => c.status === 'online').length} online
          </Typography>
        </Box>
      </Box>

      {/* Collaborators List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List dense>
          {collaborators.map(collaborator => (
            <ListItem
              key={collaborator.id}
              secondaryAction={
                isOwner && collaborator.id !== user?.id && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleCollaboratorMenuClick(e, collaborator)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <CircleIcon 
                      sx={{ 
                        color: getStatusColor(collaborator.status),
                        fontSize: 12
                      }} 
                    />
                  }
                >
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {collaborator.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {collaborator.name}
                      {collaborator.id === user?.id && ' (You)'}
                    </Typography>
                    <Chip
                      icon={getRoleIcon(collaborator.role)}
                      label={collaborator.role}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {collaborator.status === 'online' 
                      ? 'Active now' 
                      : `Last seen ${formatLastSeen(collaborator.lastSeen)}`
                    }
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Panel */}
      {showChat && (
        <Paper sx={{ mt: 1, height: 300, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Chat
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
            {chatMessages.map(message => (
              <Box key={message.id} sx={{ mb: 1 }}>
                {message.type === 'system' ? (
                  <Alert severity="info" sx={{ py: 0 }}>
                    <Typography variant="caption">
                      {message.message}
                    </Typography>
                  </Alert>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" fontWeight="bold">
                        {message.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {message.message}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
            <div ref={chatEndRef} />
          </Box>
          
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <IconButton size="small" onClick={handleSendMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onClose={() => setShowInviteDialog(false)}>
        <DialogTitle>Invite Collaborator</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
            margin="normal"
          >
            <MenuItem value="editor">Editor - Can edit the document</MenuItem>
            <MenuItem value="viewer">Viewer - Can only view the document</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInviteDialog(false)}>Cancel</Button>
          <Button onClick={handleInviteCollaborator} variant="contained">
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collaborator Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedCollaborator?.role !== 'owner' && (
          <>
            <MenuItem onClick={() => handleChangeRole('editor')}>
              <EditIcon sx={{ mr: 1 }} />
              Make Editor
            </MenuItem>
            <MenuItem onClick={() => handleChangeRole('viewer')}>
              <VisibilityIcon sx={{ mr: 1 }} />
              Make Viewer
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={handleRemoveCollaborator} sx={{ color: 'error.main' }}>
          <BlockIcon sx={{ mr: 1 }} />
          Remove Access
        </MenuItem>
      </Menu>
    </Box>
  );
};