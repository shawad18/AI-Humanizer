import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Fade,
  Slide,
  Zoom,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Chip,
  Avatar,
  Rating
} from '@mui/material';
import {
  AutoFixHigh,
  Security,
  Speed,
  Psychology,
  TrendingUp,
  Star,
  PlayArrow,
  CheckCircle,
  ArrowForward,
  Language,
  School,
  Business,
  Science
} from '@mui/icons-material';

interface EnhancedHomepageProps {
  onGetStarted?: () => void;
}

export const EnhancedHomepage: React.FC<EnhancedHomepageProps> = ({ onGetStarted }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [animateStats, setAnimateStats] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === statsRef.current) {
              setAnimateStats(true);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Staggered card animations
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCards(prev => {
        if (prev.length < 6) {
          return [...prev, prev.length];
        }
        clearInterval(timer);
        return prev;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <AutoFixHigh />,
      title: 'AI-Powered Humanization',
      description: 'Transform AI-generated content into natural, human-like text that passes detection.',
      color: '#667eea'
    },
    {
      icon: <Security />,
      title: 'Advanced Detection Bypass',
      description: 'Sophisticated algorithms that ensure your content remains undetectable by AI scanners.',
      color: '#f093fb'
    },
    {
      icon: <Speed />,
      title: 'Lightning Fast Processing',
      description: 'Get humanized content in seconds with our optimized processing engine.',
      color: '#4facfe'
    },
    {
      icon: <Psychology />,
      title: 'Context-Aware Intelligence',
      description: 'Maintains meaning and context while adapting writing style and tone.',
      color: '#43e97b'
    },
    {
      icon: <Language />,
      title: 'Multi-Language Support',
      description: 'Works with content in multiple languages with native-level fluency.',
      color: '#fa709a'
    },
    {
      icon: <TrendingUp />,
      title: 'Quality Analytics',
      description: 'Real-time analysis and scoring of humanization quality and effectiveness.',
      color: '#fee140'
    }
  ];

  const stats = [
    { label: 'Content Processed', value: '2.5M+', icon: <AutoFixHigh /> },
    { label: 'Success Rate', value: '99.7%', icon: <CheckCircle /> },
    { label: 'Languages Supported', value: '25+', icon: <Language /> },
    { label: 'Happy Users', value: '50K+', icon: <Star /> }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Research Scientist',
      avatar: 'SC',
      rating: 5,
      text: 'This tool has revolutionized how I present my research. The humanized content feels completely natural.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Content Creator',
      avatar: 'MJ',
      rating: 5,
      text: 'Incredible results! My content now has a perfect human touch while maintaining all the key information.'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Academic Writer',
      avatar: 'ER',
      rating: 5,
      text: 'The quality is outstanding. It preserves the academic tone while making it completely undetectable.'
    }
  ];

  const useCases = [
    { icon: <School />, title: 'Academic Writing', description: 'Research papers, essays, and dissertations' },
    { icon: <Business />, title: 'Business Content', description: 'Reports, proposals, and marketing materials' },
    { icon: <Science />, title: 'Technical Documentation', description: 'Manuals, specifications, and guides' }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'><circle cx='50' cy='50' r='1' fill='white' opacity='0.1'/></pattern></defs><rect width='100' height='100' fill='url(%23grain)'/></svg>")`,
            opacity: 0.3,
          },
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                      lineHeight: 1.2
                    }}
                  >
                    Transform AI Text into
                    <Box component="span" sx={{ display: 'block', color: '#FFE082' }}>
                      Human Perfection
                    </Box>
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 4,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      lineHeight: 1.6
                    }}
                  >
                    The most advanced AI humanization tool that makes your content 
                    undetectable while preserving meaning and quality.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onGetStarted}
                      startIcon={<PlayArrow />}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      Watch Demo
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Slide direction="left" in timeout={1200}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <Paper
                    elevation={24}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      maxWidth: 400,
                      width: '100%',
                      animation: 'float 6s ease-in-out infinite',
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' },
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      AI Detection Score
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Before Humanization
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={95}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#ffebee',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#f44336',
                            borderRadius: 4,
                          }
                        }}
                      />
                      <Typography variant="caption" color="error">
                        95% AI Detected
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        After Humanization
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={2}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e8f5e8',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#4caf50',
                            borderRadius: 4,
                          }
                        }}
                      />
                      <Typography variant="caption" color="success.main">
                        2% AI Detected - Human-like!
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Powerful Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to create perfectly humanized content that passes any AI detection test
          </Typography>
        </Box>

        <Grid spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Zoom in={visibleCards.includes(index)} timeout={500}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                    borderRadius: 3,
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${feature.color}, ${feature.color}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: 'white',
                        fontSize: '2rem',
                        animation: 'float 3s ease-in-out infinite',
                        animationDelay: `${index * 0.2}s`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        ref={statsRef}
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid spacing={4}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Fade in={animateStats} timeout={1000 + index * 200}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        fontSize: '3rem',
                        color: '#667eea',
                        mb: 1,
                        animation: animateStats ? 'pulse 2s ease-in-out infinite' : 'none',
                        animationDelay: `${index * 0.2}s`,
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                          '100%': { transform: 'scale(1)' },
                        }
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: 700, color: '#333', mb: 1 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Perfect For Every Use Case
          </Typography>
        </Box>

        <Grid spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.15)',
                  }
                }}
              >
                <Box
                  sx={{
                    fontSize: '3rem',
                    color: '#667eea',
                    mb: 2,
                    animation: 'float 4s ease-in-out infinite',
                    animationDelay: `${index * 0.5}s`,
                  }}
                >
                  {useCase.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {useCase.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {useCase.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ background: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              What Our Users Say
            </Typography>
          </Box>

          <Grid spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'white',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          mr: 2
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2
            }}
          >
            Ready to Humanize Your Content?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4
            }}
          >
            Join thousands of users who trust AI Humanizer for their content needs
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onGetStarted}
            endIcon={<ArrowForward />}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              px: 6,
              py: 2,
              borderRadius: 3,
              fontSize: '1.2rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            Start Humanizing Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};