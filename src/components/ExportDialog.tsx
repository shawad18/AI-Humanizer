import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Download,
  Description,
  Code,
  PictureAsPdf,
  Article,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { ExportService, ExportOptions, ExportData } from '../services/exportService';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  exportData: ExportData;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  exportData
}) => {
  const [format, setFormat] = useState<'txt' | 'docx' | 'pdf' | 'html'>('txt');
  const [filename, setFilename] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const supportedFormats = ExportService.getSupportedFormats();

  const getFormatIcon = (formatValue: string) => {
    switch (formatValue) {
      case 'txt':
        return <Description />;
      case 'html':
        return <Code />;
      case 'docx':
        return <Article />;
      case 'pdf':
        return <PictureAsPdf />;
      default:
        return <Description />;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const options: ExportOptions = {
        format,
        filename: filename || undefined,
        includeMetadata,
        includeAnalysis
      };

      await ExportService.exportText(exportData, options);
      setExportSuccess(true);
      
      // Auto-close dialog after successful export
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
      setExportSuccess(false);
    }
  };

  const generateDefaultFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `humanized-text-${timestamp}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Download color="primary" />
          <Typography variant="h6">Export Document</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {exportSuccess && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ mb: 2 }}
          >
            Document exported successfully!
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Export your humanized text in your preferred format
          </Typography>
        </Box>

        {/* Format Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Export Format</InputLabel>
          <Select
            value={format}
            label="Export Format"
            onChange={(e) => setFormat(e.target.value as any)}
          >
            {supportedFormats.map((fmt) => (
              <MenuItem key={fmt.value} value={fmt.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  {getFormatIcon(fmt.value)}
                  <Box>
                    <Typography variant="body2">{fmt.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fmt.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filename Input */}
        <TextField
          fullWidth
          label="Filename (optional)"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder={generateDefaultFilename()}
          helperText="Leave empty to use auto-generated filename"
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Export Options */}
        <Typography variant="subtitle2" gutterBottom>
          Export Options
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
              />
            }
            label="Include metadata (timestamp, settings)"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeAnalysis}
                onChange={(e) => setIncludeAnalysis(e.target.checked)}
                disabled={!exportData.detectionResult}
              />
            }
            label="Include analysis results"
          />
          {!exportData.detectionResult && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              No analysis data available
            </Typography>
          )}
        </Box>

        {/* Preview Information */}
        <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>What will be exported:</strong>
          </Typography>
          <List dense sx={{ mt: 1 }}>
            <ListItem sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Humanized text" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            {includeAnalysis && exportData.originalText && (
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Original text" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
            {includeMetadata && (
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Export metadata and settings" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
            {includeAnalysis && exportData.detectionResult && (
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="AI detection and quality analysis" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
          </List>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isExporting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting || !exportData.humanizedText}
          startIcon={isExporting ? <CircularProgress size={16} /> : <Download />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;