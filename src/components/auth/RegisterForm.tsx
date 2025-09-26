import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: 'error' | 'warning' | 'success';
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onClose }) => {
  const { register, isLoading } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('One lowercase letter');

    if (/\d/.test(password)) score += 1;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('One special character');

    let color: 'error' | 'warning' | 'success' = 'error';
    if (score >= 4) color = 'success';
    else if (score >= 2) color = 'warning';

    return { score, feedback, color };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
      onClose?.();
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleSocialRegister = (provider: 'google' | 'github') => {
    // In a real implementation, this would handle OAuth
    console.log(`Register with ${provider}`);
    setError('Social registration not implemented yet');
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join AI Humanizer and start creating better content
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="name"
            autoFocus
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="email"
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

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
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Cancel sx={{ fontSize: 12, color: 'error.main' }} />
                      {item}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="new-password"
            error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
            helperText={
              formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                ? 'Passwords do not match'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                  {formData.confirmPassword !== '' && formData.password === formData.confirmPassword && (
                    <CheckCircle sx={{ color: 'success.main', ml: 1 }} />
                  )}
                </InputAdornment>
              )
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="#" color="primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" color="primary">
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mt: 2, mb: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !acceptTerms}
            sx={{ mt: 2, mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Or continue with
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialRegister('google')}
            disabled={isLoading}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleSocialRegister('github')}
            disabled={isLoading}
          >
            GitHub
          </Button>
        </Box>

        <Typography variant="body2" align="center" color="text.secondary">
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToLogin}
            color="primary"
            sx={{ textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
};