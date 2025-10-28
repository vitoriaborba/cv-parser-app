import React from 'react';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import Logo from './components/Logo';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'black' }}>
        <Toolbar>
          <Logo />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <HomePage />
      </Container>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          whiteSpace: 'pre-line' // This allows line breaks in toast messages
        }}
      />
    </Box>
  );
}

export default App;