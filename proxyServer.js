const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dynamic Proxy
app.post('/proxy', (req, res) => {
    const { target, path, method = 'GET', headers = {}, body = {} } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target URL is required.' });
    }

    const proxy = createProxyMiddleware({
        target: target,
        changeOrigin: true,
        pathRewrite: path ? { '^/proxy': path } : undefined,
        onProxyReq: (proxyReq) => {
            if (method !== 'GET' && Object.keys(body).length > 0) {
                const bodyString = JSON.stringify(body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
                proxyReq.write(bodyString);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            let responseBody = '';
            proxyRes.on('data', (chunk) => {
                responseBody += chunk;
            });
            proxyRes.on('end', () => {
                res.status(proxyRes.statusCode).send(responseBody);
            });
        },
    });

    proxy(req, res, (err) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Internal Proxy Error' });
    });
});

// Start Proxy Server
const PORT = process.env.PROXY_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});