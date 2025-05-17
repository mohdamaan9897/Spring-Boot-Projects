import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { isAuthenticated, logout } from '../services/auth';

const Navbar = () => {
  const handleLogout = () => {
    logout();
    window.location.href = '/login'; // Force refresh to clear state
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {isAuthenticated() ? (
          <>
            <Button color="inherit" component={Link} to="/products">
              Products
            </Button>
            <Button color="inherit" component={Link} to="/bills">
              Bills
            </Button>
            <Button component={Link} to="/bills/generate" color="inherit">
            Generate Bill
          </Button>
            <Button color="inherit" onClick={handleLogout} style={{ marginLeft: 'auto' }}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login" style={{ marginLeft: 'auto' }}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;