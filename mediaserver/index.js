const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const path = require('path');
const fs = require('fs');

// Array of allowed origins
const allowedDomains = [
  'https://app.ikarosarchaeology.com',
  'https://app-dev.ikarosarchaeology.com',
];

// CORS options setup
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (allowedDomains.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // Reflect the request Origin in the CORS response if it's in the allowed list
  } else {
    corsOptions = { origin: false }; // Disable CORS for this request if the Origin is not in the allowed list
  }
  callback(null, corsOptions); // Callback expects two parameters: error and options
};

app.use(cors(corsOptionsDelegate));

app.use('/', express.static('/files'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '3dhop')));

app.get('/3dviewer', (req, res) => {
  res.sendFile(path.join(__dirname, '3dhop', 'start.html'));
});
//app.use('/3dviewer', express.static(path.join(__dirname, '3dhop')));

// Proxy endpoint that forwards requests to an external URL
app.use('/redirect', createProxyMiddleware({
  router: function(req) {
    // Obtain the target URL from a query parameter or a header
    const targetUrl = req.query.url || req.get('X-Target-URL');
    return targetUrl;
  },
  changeOrigin: true,
  pathRewrite: {
    '^/redirect/': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
    // You can modify the proxy request here (e.g., set or remove headers)
  },
  onError: (err, req, res) => {
    // Handle errors
    res.status(500).send('Proxy Error');
  }
}));


app.listen(3001, () => console.log('Mediaserver started on port 3001 (internal)'));
