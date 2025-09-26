import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Description,
  PictureAsPdf,
  TextFields
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DocumentUploaderProps {
  onTextExtracted: (text: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onTextExtracted }) => {
  const [tabValue, setTabValue] = useState(0);
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to extract text from Word document');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      throw new Error('Failed to extract text from PDF document');
    }
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setUploadedFile(file);

    try {
      let extractedText = '';

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword') {
        extractedText = await extractTextFromWord(file);
      } else if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload a Word document, PDF, or text file.');
      }

      if (extractedText.trim()) {
        onTextExtracted(extractedText);
      } else {
        setError('No text found in the uploaded document.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onTextExtracted]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handlePastedTextSubmit = () => {
    if (pastedText.trim()) {
      onTextExtracted(pastedText);
      setError(null);
    } else {
      setError('Please enter some text to humanize.');
    }
  };

  const getSupportedFormats = () => [
    { icon: <Description />, label: 'Word (.docx, .doc)' },
    { icon: <PictureAsPdf />, label: 'PDF (.pdf)' },
    { icon: <TextFields />, label: 'Text (.txt)' }
  ];

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Upload File" />
        <Tab label="Paste Text" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          {isProcessing ? (
            <Box>
              <CircularProgress size={24} sx={{ mb: 2 }} />
              <Typography variant="body2">Processing document...</Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop your document here' : 'Drag & drop or click to upload'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your AI-generated document for humanization
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {getSupportedFormats().map((format, index) => (
                  <Chip
                    key={index}
                    icon={format.icon}
                    label={format.label}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {uploadedFile && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" color="success.dark">
              ✓ Uploaded: {uploadedFile.name}
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TextField
          fullWidth
          multiline
          rows={8}
          placeholder="Paste your AI-generated text here..."
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handlePastedTextSubmit}
          disabled={!pastedText.trim()}
          fullWidth
        >
          Process Text
        </Button>
      </TabPanel>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default DocumentUploader;