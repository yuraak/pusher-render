const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/proxy', (req, res) => {
    const { target } = req.body;
    if (!target) {
        return res.status(400).send('Target URL is required.');
    }

    const proxy = createProxyMiddleware({
        target,
        changeOrigin: true,
        onProxyRes: (proxyRes) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        },
    });

    proxy(req, res, (err) => {
        if (err) {
            console.error('Proxy error:', err);
            res.status(500).send('Proxy error');
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});