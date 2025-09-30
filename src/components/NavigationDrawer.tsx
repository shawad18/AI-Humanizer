import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Typography,
  Toolbar,
  ListItemButton
} from '@mui/material';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationDrawerProps {
  menuItems: MenuItem[];
  currentView: string;
  onViewChange: (view: string) => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ 
  menuItems,
  currentView,
  onViewChange
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AI Humanizer
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => onViewChange(item.id)}
              selected={currentView === item.id}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default NavigationDrawer;