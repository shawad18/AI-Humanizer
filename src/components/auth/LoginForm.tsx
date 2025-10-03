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
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
  const { login, isLoading, socialLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
      onClose?.();
    } catch (err) {
      setError('Invalid email or password');
    }
  };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      await socialLogin(provider);
    } catch (err) {
      setError('Social login failed');
    }
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Sign in to your AI Humanizer account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
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
            autoFocus
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
            autoComplete="current-password"
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Link href="#" variant="body2" color="primary">
            Forgot your password?
          </Link>
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
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
          >
            GitHub
          </Button>
        </Box>

        <Typography variant="body2" align="center" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToRegister}
            color="primary"
            sx={{ textDecoration: 'none' }}
          >
            Sign up
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
};
