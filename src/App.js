import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import DGHDynamicMain from './components/dynamic/DGHDynamicMain';
import DGHStaticMain from './components/static/DGHStaticMain';

const Home = () => (
    <Container>
        <Box textAlign="center" mt={4}>
            <Typography variant="h3" gutterBottom>
                Welcome to DGH Pusher
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Choose your approach:
            </Typography>
            <Box mt={4}>
                <Button 
                    component={Link} 
                    to="/dynamic" 
                    variant="contained" 
                    color="primary" 
                    style={{ margin: '10px' }}
                >
                    Dynamic Approach
                </Button>
                <Button 
                    component={Link} 
                    to="/static" 
                    variant="contained" 
                    color="secondary" 
                    style={{ margin: '10px' }}
                >
                    Static Approach
                </Button>
            </Box>
        </Box>
    </Container>
);

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dynamic" element={<DGHDynamicMain />} />
                <Route path="/static" element={<DGHStaticMain />} />
            </Routes>
        </Router>
    );
};

export default App;