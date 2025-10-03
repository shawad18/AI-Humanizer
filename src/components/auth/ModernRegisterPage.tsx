import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Alert,
  Fade,
  Slide,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  GitHub,
  LinkedIn,
  AutoFixHigh,
  Email,
  Lock,
  Person,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface ModernRegisterPageProps {
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: 'error' | 'warning' | 'success';
}

export const ModernRegisterPage: React.FC<ModernRegisterPageProps> = ({
  onSwitchToLogin,
  onRegisterSuccess
}) => {
  const { register, isLoading, socialRegister } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('One lowercase letter');

    if (/\d/.test(password)) score++;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('One special character');

    let color: 'error' | 'warning' | 'success' = 'error';
    if (score >= 4) color = 'success';
    else if (score >= 2) color = 'warning';

    return { score, feedback, color };
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordStrength = getPasswordStrength(formData.password);
    if (passwordStrength.score < 3) {
      setError('Password is too weak');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
      onRegisterSuccess?.();
      navigate('/app');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

    const handleSocialRegister = async (provider: string) => {
    setError('');
    try {
      await socialRegister(provider as 'google' | 'github' | 'linkedin');
      onRegisterSuccess?.();
      navigate('/app');
    } catch (err) {
      setError('Social registration failed');
    }
  };

  const handleSwitchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const socialProviders = [
    { name: 'google', icon: <Google />, color: '#db4437' },
    { name: 'github', icon: <GitHub />, color: '#333' },
    { name: 'linkedin', icon: <LinkedIn />, color: '#0077b5' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Slide direction="down" in timeout={1000}>
                <Box>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <AutoFixHigh sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Join AI Humanizer
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ opacity: 0.8 }}
                  >
                    Create your account and start humanizing content
                  </Typography>
                </Box>
              </Slide>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Registration Form */}
            <Slide direction="up" in timeout={1200}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  margin="normal"
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                      }
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                      }
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#667eea' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                      }
                    }
                  }}
                />

                {/* Password Strength Indicator */}
                {formData.password && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password strength:
                      </Typography>
                      <Box sx={{ ml: 1, flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(passwordStrength.score / 5) * 100}
                          color={passwordStrength.color}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Box>
                    {passwordStrength.feedback.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {passwordStrength.feedback.map((item, index) => (
                          <Typography
                            key={index}
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            • {item}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  margin="normal"
                  required
                  error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                  helperText={
                    formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#667eea' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        {formData.confirmPassword !== '' && formData.password === formData.confirmPassword && (
                          <CheckCircle sx={{ color: 'success.main', ml: 1 }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                      }
                    }
                  }}
                />

                {/* Terms and Conditions */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      sx={{
                        color: '#667eea',
                        '&.Mui-checked': {
                          color: '#667eea',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" sx={{ color: '#667eea' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" sx={{ color: '#667eea' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mt: 2, mb: 1 }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || !acceptTerms}
                  sx={{
                    mt: 3,
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>
            </Slide>

            {/* Social Registration */}
            <Slide direction="up" in timeout={1400}>
              <Box>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or continue with
                  </Typography>
                </Divider>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                  {socialProviders.map((provider) => (
                    <IconButton
                      key={provider.name}
                      onClick={() => handleSocialRegister(provider.name)}
                      sx={{
                        width: 50,
                        height: 50,
                        border: '2px solid',
                        borderColor: provider.color,
                        color: provider.color,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: provider.color,
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${provider.color}40`,
                        }
                      }}
                    >
                      {provider.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Slide>

            {/* Login Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={handleSwitchToLogin}
                  sx={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};
