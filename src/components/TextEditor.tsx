import React, { useState } from 'react';
import { securityService } from '../services/securityService';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ContentCopy,
  Download,
  Refresh,
  Edit,
  Save
} from '@mui/icons-material';
import { saveAs } from 'file-saver';

interface TextEditorProps {
  originalText: string;
  humanizedText: string;
  onOriginalTextChange: (text: string) => void;
  onHumanizedTextChange: (text: string) => void;
  isProcessing: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  originalText,
  humanizedText,
  onOriginalTextChange,
  onHumanizedTextChange,
  isProcessing
}) => {
  const [isEditingHumanized, setIsEditingHumanized] = useState(false);  const [tempHumanizedText, setTempHumanizedText] = useState(humanizedText);
  const [tempOriginalText, setTempOriginalText] = useState(originalText);
  // Keep a backup of the humanized text when entering edit mode so Cancel can restore it
  const [humanizedBackup, setHumanizedBackup] = useState(humanizedText);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setTempHumanizedText(humanizedText);
  }, [humanizedText]);

  React.useEffect(() => {
    setTempOriginalText(originalText);
  }, [originalText]);

  const handleCopyToClipboard = async (text: string, type: 'original' | 'humanized') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  };

  const handleSaveEdit = () => {
    // Changes are already synced live; just exit edit mode
    setIsEditingHumanized(false);
  };

  const handleCancelEdit = () => {
    // Restore backup to both temp and parent state
    setTempHumanizedText(humanizedBackup);
    onHumanizedTextChange(humanizedBackup);
    setIsEditingHumanized(false);
  };
  const handlePaste = (e: React.ClipboardEvent, type: 'original' | 'humanized') => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    
    // Sanitize and clean up the pasted text while preserving basic formatting
    const sanitized = securityService.sanitizeInput(pastedText);
    const cleanedText = sanitized
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (type === 'original') {
      setTempOriginalText(cleanedText);
    } else if (type === 'humanized') {
      setTempHumanizedText(cleanedText);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getSentenceCount = (text: string) => {
    return text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const TextPanel = ({ 
    title, 
    text, 
    onChange, 
    isEditable = false, 
    isEditing = false,
    onEdit,
    onSave,
    onCancel,
    type 
  }: {
    title: string;
    text: string;
    onChange?: (text: string) => void;
    isEditable?: boolean;
    isEditing?: boolean;
    onEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    type: 'original' | 'humanized';
  }) => (
    <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditable && !isEditing && (
            <Tooltip title="Edit text">
              <IconButton size="small" onClick={() => {
                // When entering edit mode, capture current visible value as backup
                if (type === 'humanized') {
                  setHumanizedBackup(text);
                }
                onEdit && onEdit();
              }}>
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          {isEditing && (
            <>
              <Tooltip title="Save changes">
                <IconButton size="small" onClick={onSave} color="primary">
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton size="small" onClick={onCancel}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Copy to clipboard">
            <IconButton 
              size="small" 
              onClick={() => handleCopyToClipboard(text, type)}
              color={copySuccess === type ? 'success' : 'default'}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download as .txt">
            <IconButton 
              size="small" 
              onClick={() => handleDownload(text, `${type}-text.txt`)}
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Words: {getWordCount(text)} | Sentences: {getSentenceCount(text)} | Characters: {getCharacterCount(text)}
        </Typography>
      </Box>

      {isEditing ? (
        <TextField
          fullWidth
          multiline
          rows={20}
          value={type === 'humanized' ? tempHumanizedText : (type === 'original' ? tempOriginalText : text)}
          onChange={(e) => {
            if (type === 'humanized') {
              const val = e.target.value;
              setTempHumanizedText(val);
              // Sync edits to parent so Export uses current text even during editing
              onHumanizedTextChange(val);
            } else if (type === 'original') {
              setTempOriginalText(e.target.value);
            } else if (onChange) {
              onChange(e.target.value);
            }
          }}
          onPaste={(e) => handlePaste(e, type)}
          placeholder={type === 'original' ? 'Start typing or paste your text here to humanize it...' : 'Edit your humanized text here...'}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: type === 'original' ? 'Georgia, serif' : 'monospace',
              fontSize: '14px',
              lineHeight: 1.6,
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              }
            },
            '& .MuiInputBase-input': {
              '&::placeholder': {
                color: 'text.secondary',
                opacity: 0.7,
                fontStyle: 'italic'
              }
            }
          }}
        />
      ) : (
        <Box
          sx={{
            minHeight: '400px',
            maxHeight: '500px',
            overflow: 'auto',
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            backgroundColor: 'background.paper',
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap'
          }}
        >
          {text || (
            <Typography color="text.secondary" fontStyle="italic">
              {type === 'original' ? 'Click the edit button to start typing, paste your text, or upload a document...' : 'Humanized text will appear here...'}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Document Editor
        </Typography>
        {isProcessing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Humanizing text...
            </Typography>
          </Box>
        )}
      </Box>

      {copySuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {copySuccess === 'original' ? 'Original' : 'Humanized'} text copied to clipboard!
        </Alert>
      )}

      <Grid spacing={2} sx={{ height: 'calc(100vh - 300px)' }}>
        <Grid size={{ xs: 12 }}>
          <TextPanel
            title="Humanized Text"
            text={isEditingHumanized ? tempHumanizedText : humanizedText}
            isEditable={true}
            isEditing={isEditingHumanized}
            onEdit={() => setIsEditingHumanized(true)}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            type="humanized"
          />
        </Grid>
      </Grid>

      {humanizedText && !isEditingHumanized && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            ✓ Text has been humanized. You can edit, copy, or download the result.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TextEditor;