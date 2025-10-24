import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  IconButton,
  Collapse,
  Paper,
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from 'react-router-dom';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Memories', path: '/memories' },
  { name: 'EventFlow', path: '/eventflow' },
  { name: 'Registration', path: '/register' },
];

function ResponsiveAppBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: 'rgba(0,0,0,1)', boxShadow: 'none', zIndex: 1201 }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Left: Logo Text */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'grey', width: 40, height: 40, mr: 1 }} />
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  color: '#e0e0e0',
                  letterSpacing: '0.5px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                Silver Jubilee
              </Typography>

            </Box>

            {/* Center Circle Logo (Desktop only) */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%) translateY(25%)',
                backgroundColor: 'black',
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
              }}
            >
              <Avatar
                src="/assets/ARCNavBarLogo.png"
                sx={{
                  width: 80,
                  height: 80,
                  transition: 'transform 0.2s ease-in-out', // Smooth transition for scaling
                  '&:hover': {
                    transform: 'scale(1.05)', // Scale to 110% on hover
                  },
                }}
              />            </Box>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {pages.map((page) => (
                <Link key={page.name} to={page.path} style={{ textDecoration: 'none' }}>
                  <Button
                    sx={{
                      color: 'white',
                      fontWeight: location.pathname === page.path ? 'bold' : 'normal',
                      borderBottom:
                        location.pathname === page.path ? '2px solid #ff6b6b' : 'none',
                      borderRadius: 0,
                      px: 1,
                      '&:hover': {
                        borderBottom: '2px solid #ff6b6b',
                      },
                    }}
                  >
                    {page.name}
                  </Button>
                </Link>
              ))}
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Dropdown Menu */}
      <Collapse
        in={mobileOpen}
        timeout={300}
        sx={{
          transition: 'height 300ms ease-in-out',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            zIndex: 1200,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(8px)',
            pt: 2,
            pb: 4,
            px: 2,
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            position: 'relative',
            top: 0,
          }}
        >
          {pages.map((page) => (
            <Link
              key={page.name}
              to={page.path}
              style={{ textDecoration: 'none', width: '100%' }}
              onClick={() => setMobileOpen(false)}
            >
              <Button
                fullWidth
                sx={{
                  color: 'white',
                  fontWeight: location.pathname === page.path ? 'bold' : 'normal',
                  borderBottom:
                    location.pathname === page.path ? '2px solid #ff6b6b' : 'none',
                  borderRadius: 0,
                  py: 1.2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {page.name}
              </Button>
            </Link>
          ))}
        </Paper>
      </Collapse>
    </>
  );
}

export default ResponsiveAppBar;