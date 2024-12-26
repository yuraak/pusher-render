const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Dynamic proxy handler
app.post('/proxy', (req, res, next) => {
    const { target, data } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target URL is required' });
    }

    const proxy = createProxyMiddleware({
        target,
        changeOrigin: true,
        selfHandleResponse: true, // Allows intercepting the response
        onProxyReq: (proxyReq) => {
            if (data) {
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.write(JSON.stringify(data));
                proxyReq.end();
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            let body = '';
            proxyRes.on('data', (chunk) => {
                body += chunk.toString();
            });

            proxyRes.on('end', () => {
                res.status(proxyRes.statusCode).send(body);
            });
        },
    });

    proxy(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});