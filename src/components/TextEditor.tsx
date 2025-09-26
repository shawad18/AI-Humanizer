import React, { useState } from 'react';
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
  const [isEditingHumanized, setIsEditingHumanized] = useState(false);
  const [tempHumanizedText, setTempHumanizedText] = useState(humanizedText);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setTempHumanizedText(humanizedText);
  }, [humanizedText]);

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
    onHumanizedTextChange(tempHumanizedText);
    setIsEditingHumanized(false);
  };

  const handleCancelEdit = () => {
    setTempHumanizedText(humanizedText);
    setIsEditingHumanized(false);
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
              <IconButton size="small" onClick={onEdit}>
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
          value={type === 'humanized' ? tempHumanizedText : text}
          onChange={(e) => {
            if (type === 'humanized') {
              setTempHumanizedText(e.target.value);
            } else if (onChange) {
              onChange(e.target.value);
            }
          }}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.6
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
              {type === 'original' ? 'Upload a document or paste text to get started...' : 'Humanized text will appear here...'}
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

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 300px)' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextPanel
            title="Original Text"
            text={originalText}
            onChange={onOriginalTextChange}
            type="original"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
          <Typography variant="body2" color="success.dark">
            ✓ Text has been humanized! You can edit the result, copy it, or download it as a file.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TextEditor;