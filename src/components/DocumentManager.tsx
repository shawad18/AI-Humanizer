import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Tooltip,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  FileCopy as FileCopyIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useDocuments, Document } from '../contexts/DocumentContext';

interface DocumentManagerProps {
  onDocumentSelect: (document: Document) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ onDocumentSelect }) => {
  const {
    documents,
    createDocument,
    deleteDocument,
    duplicateDocument,
    shareDocument,
    exportDocument,
    searchDocuments,
    getFolders
  } = useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const folders = getFolders();

  const filteredDocuments = useMemo(() => {
    let docs = searchQuery ? searchDocuments(searchQuery) : documents;
    
    if (selectedFolder !== 'all') {
      docs = docs.filter(doc => doc.folder === selectedFolder);
    }

    return docs.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [documents, searchQuery, selectedFolder, sortBy, searchDocuments]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, doc: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      const newDoc = createDocument(newDocTitle.trim());
      onDocumentSelect(newDoc);
      setNewDocTitle('');
      setShowNewDocDialog(false);
      setMessage({ type: 'success', text: 'Document created successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteDocument = async () => {
    if (selectedDoc) {
      await deleteDocument(selectedDoc.id);
      setShowDeleteDialog(false);
      handleMenuClose();
      setMessage({ type: 'success', text: 'Document deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDuplicateDocument = async () => {
    if (selectedDoc) {
      const duplicatedDoc = await duplicateDocument(selectedDoc.id);
      onDocumentSelect(duplicatedDoc);
      handleMenuClose();
      setMessage({ type: 'success', text: 'Document duplicated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleShareDocument = async () => {
    if (selectedDoc && shareEmail.trim()) {
      try {
        await shareDocument(selectedDoc.id, shareEmail.trim());
        setShareEmail('');
        setShowShareDialog(false);
        handleMenuClose();
        setMessage({ type: 'success', text: 'Document shared successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to share document' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleExportDocument = async (format: 'txt' | 'pdf' | 'docx' | 'latex') => {
    if (selectedDoc) {
      try {
        await exportDocument(selectedDoc.id, format);
        handleMenuClose();
        setMessage({ type: 'success', text: `Document exported as ${format.toUpperCase()}!` });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to export document' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDocumentIcon = (doc: Document) => {
    if (doc.humanizedContent) return '✨';
    if (doc.originalContent) return '📝';
    return '📄';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            My Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewDocDialog(true)}
          >
            New Document
          </Button>
        </Box>

        {/* Search and Filters */}
        <Grid spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Folder</InputLabel>
              <Select
                value={selectedFolder}
                label="Folder"
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <MenuItem value="all">All Documents</MenuItem>
                {folders.map(folder => (
                  <MenuItem key={folder} value={folder}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" />
                      {folder}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <MenuItem value="updated">Last Updated</MenuItem>
                <MenuItem value="created">Date Created</MenuItem>
                <MenuItem value="title">Title</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Document List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredDocuments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first document to get started'
              }
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNewDocDialog(true)}
              >
                Create Document
              </Button>
            )}
          </Paper>
        ) : (
          <List>
            {filteredDocuments.map((doc, index) => (
              <React.Fragment key={doc.id}>
                <ListItem
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemButton onClick={() => onDocumentSelect(doc)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6" sx={{ minWidth: 24 }}>
                      {getDocumentIcon(doc)}
                    </Typography>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight="medium" noWrap>
                        {doc.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(doc.updatedAt)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {doc.author}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          {doc.metadata.wordCount} words
                        </Typography>
                      </Box>
                      
                      {doc.tags.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {doc.tags.slice(0, 3).map(tag => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {doc.tags.length > 3 && (
                            <Chip label={`+${doc.tags.length - 3}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {doc.collaborators.length > 0 && (
                        <Tooltip title={`${doc.collaborators.length} collaborators`}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {doc.collaborators.length}
                          </Avatar>
                        </Tooltip>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, doc);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  </ListItemButton>
                </ListItem>
                {index < filteredDocuments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedDoc && onDocumentSelect(selectedDoc)}>
          <EditIcon sx={{ mr: 1 }} />
          Open
        </MenuItem>
        <MenuItem onClick={handleDuplicateDocument}>
          <FileCopyIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => setShowShareDialog(true)}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleExportDocument('txt')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export as TXT
        </MenuItem>
        <MenuItem onClick={() => handleExportDocument('pdf')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportDocument('docx')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export as DOCX
        </MenuItem>
        <MenuItem onClick={() => handleExportDocument('latex')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export as LaTeX
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setShowDeleteDialog(true)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* New Document Dialog */}
      <Dialog open={showNewDocDialog} onClose={() => setShowNewDocDialog(false)}>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Document Title"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            margin="normal"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewDocDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateDocument} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDoc?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share "{selectedDoc?.title}" with others
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Email Address"
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)}>Cancel</Button>
          <Button onClick={handleShareDocument} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};