import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DGHDynamicMain from './components/dynamic/DGHDynamicMain';
import DGHStaticMain from './components/static/DGHStaticMain';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dynamic" element={<DGHDynamicMain />} />
                <Route path="/static" element={<DGHStaticMain />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

const Home = () => (
    <div>
        <h1>Welcome to DGH Pusher</h1>
        <nav>
            <a href="/dynamic">Dynamic Approach</a>
            <a href="/static">Static Approach</a>
        </nav>
    </div>
);

export default App;