import React, { useState } from 'react';
import {
  Box,
  Container,
  Toolbar,
  AppBar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

const resolveIpfsUrl = (url) => {
  if (!url) return undefined;
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return url;
};

const DashboardHeader = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const displayName = user?.username || 'User';
  const displayEmail = user?.email || (user?.username ? `${user.username.toLowerCase()}@synq.com` : '');
  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = resolveIpfsUrl(user?.profilePic);

  return (
    <AppBar
      position="static"
      sx={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          {/* Brand Logo & Title */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              component="img"
              src="/favicon.svg"
              alt="TrustGrid Logo"
              sx={{ width: 32, height: 32, display: 'block' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#f8fafc' }}>
              TrustGrid
            </Typography>
          </Box>

          {/* Profile Dropdown Navbar Action */}
          <Box display="flex" alignItems="center">
            <Box
              onClick={handleClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                px: 1.5,
                py: 0.75,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                },
              }}
            >
              <Avatar
                src={avatarUrl}
                alt={displayName}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#3b82f6',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </Avatar>
              <Box display={{ xs: 'none', sm: 'block' }} textAlign="left">
                <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600, lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11, display: 'block', lineHeight: 1 }}>
                  {displayEmail}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon
                sx={{
                  color: '#94a3b8',
                  fontSize: 18,
                  transform: open ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  minWidth: 230,
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2.5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                  overflow: 'visible',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.25,
                    borderRadius: 1.5,
                    mx: 0.75,
                    my: 0.25,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={avatarUrl} alt={displayName} sx={{ width: 40, height: 40, bgcolor: '#3b82f6', fontWeight: 700 }}>
                  {userInitial}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700, noWrap: true }}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', noWrap: true }}>
                    {displayEmail}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <MenuItem
                onClick={() => {
                  handleClose();
                  onLogout();
                }}
                sx={{
                  color: '#ef4444',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#ef4444', minWidth: 32 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default DashboardHeader;
