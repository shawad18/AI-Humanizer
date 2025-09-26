import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Key as KeyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Description as DocsIcon,
} from '@mui/icons-material';
import { ApiEndpoints } from '../api/endpoints';

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
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ApiDocumentation: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [apiKey, setApiKey] = useState('ai_hum_demo_key_123456789012345');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);

  const documentation = ApiEndpoints.getApiDocumentation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testEndpoint = async (endpoint: any) => {
    setSelectedEndpoint(endpoint.path);
    
    // Mock API response for demo
    const mockResponse = {
      success: true,
      data: {
        message: `Mock response for ${endpoint.path}`,
        timestamp: new Date().toISOString(),
        ...(endpoint.path === '/humanize' && {
          originalText: 'This is AI-generated text.',
          humanizedText: 'This represents naturally written content.',
          analysis: {
            aiDetectionScore: 0.15,
            readabilityScore: 85.2,
            improvements: ['Enhanced natural flow', 'Reduced AI patterns']
          }
        }),
        ...(endpoint.path === '/detect' && {
          results: [
            { provider: 'GPTZero', score: 0.23, confidence: 0.89 },
            { provider: 'Originality', score: 0.18, confidence: 0.92 }
          ],
          consensus: { score: 0.205, classification: 'Human-Written' }
        })
      },
      version: documentation.version
    };

    setTestResponse(mockResponse);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <DocsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            AI Humanizer API Documentation
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Version {documentation.version} • RESTful API for text humanization and AI detection
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="API documentation tabs">
          <Tab label="Overview" />
          <Tab label="Endpoints" />
          <Tab label="Authentication" />
          <Tab label="Rate Limits" />
          <Tab label="Testing" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Base URL</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                {documentation.baseUrl}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Authentication</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {documentation.authentication.description}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Rate Limits</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {documentation.rateLimits.default}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Quick Start
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Get started with the AI Humanizer API in minutes. All endpoints require authentication via API key.
        </Alert>

        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Example Request
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <pre style={{ 
              backgroundColor: '#1e1e1e', 
              color: '#d4d4d4', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px',
              fontFamily: 'Monaco, Consolas, monospace'
            }}>
{`curl -X POST "${documentation.baseUrl}/humanize" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "text": "This is AI-generated text that needs humanization.",
    "settings": {
      "creativity": 0.7,
      "formality": 0.5,
      "tone": "neutral"
    },
    "options": {
      "includeAnalysis": true,
      "detectAI": true
    }
  }'`}
            </pre>
            <Tooltip title="Copy to clipboard">
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
                onClick={() => copyToClipboard(`curl -X POST "${documentation.baseUrl}/humanize" ...`)}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          API Endpoints
        </Typography>
        
        {documentation.endpoints.map((endpoint: any, index: number) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Chip 
                  label={endpoint.method || 'POST'} 
                  color={getMethodColor(endpoint.method || 'POST') as any}
                  size="small"
                />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  {endpoint.path}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  {endpoint.description}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {endpoint.description}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Parameters
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(endpoint.parameters || {}).map(([param, details]: [string, any]) => (
                        <TableRow key={param}>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{param}</TableCell>
                          <TableCell>
                            <Chip label={details.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={details.required ? 'Yes' : 'No'} 
                              color={details.required ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{details.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {endpoint.example && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Example Request
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '14px',
                        fontFamily: 'Monaco, Consolas, monospace',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {JSON.stringify(endpoint.example, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>
          Authentication
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Keep your API key secure!</strong> Never expose it in client-side code or public repositories.
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <KeyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">API Key Authentication</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Include your API key in the <code>X-API-Key</code> header with every request.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Header Format:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                X-API-Key: your_api_key_here
              </Typography>
            </Paper>

            <Typography variant="subtitle2" gutterBottom>
              Test API Key:
            </Typography>
            <TextField
              fullWidth
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Copy API key">
                    <IconButton onClick={() => copyToClipboard(apiKey)}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom>
          Error Responses
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status Code</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(documentation.errorCodes).map(([code, description]) => (
                <TableRow key={code}>
                  <TableCell>
                    <Chip label={code} color="error" size="small" />
                  </TableCell>
                  <TableCell>{String(description)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>
          Rate Limits
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          {Object.entries(documentation.rateLimits).map(([type, limit]) => (
            <Card key={type}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {type} Limits
                </Typography>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {String(limit).split(' ')[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {String(limit).split(' ').slice(1).join(' ')}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Rate limits are enforced per API key. When you exceed the limit, you'll receive a 429 status code with retry information.
        </Alert>

        <Typography variant="h6" gutterBottom>
          Rate Limit Headers
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Header</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace' }}>X-RateLimit-Limit</TableCell>
                <TableCell>The maximum number of requests allowed per time window</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace' }}>X-RateLimit-Remaining</TableCell>
                <TableCell>The number of requests remaining in the current time window</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace' }}>X-RateLimit-Reset</TableCell>
                <TableCell>The time when the rate limit resets (Unix timestamp)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace' }}>Retry-After</TableCell>
                <TableCell>Seconds to wait before making another request (when rate limited)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h5" gutterBottom>
          API Testing
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Test API endpoints directly from this interface. Responses are mocked for demonstration purposes.
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mb: 4 }}>
          {documentation.endpoints.slice(0, 4).map((endpoint: any, index: number) => (
            <Card key={index}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={endpoint.method || 'POST'} 
                    color={getMethodColor(endpoint.method || 'POST') as any}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {endpoint.path}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {endpoint.description}
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => testEndpoint(endpoint)}
                  disabled={selectedEndpoint === endpoint.path}
                >
                  {selectedEndpoint === endpoint.path ? 'Testing...' : 'Test Endpoint'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        {testResponse && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <pre style={{ 
                margin: 0, 
                fontSize: '14px',
                fontFamily: 'Monaco, Consolas, monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default ApiDocumentation;