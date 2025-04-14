const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const { convertImageToJP2 } = require('./imgProcessingJP2');
const { convertPdf } = require('./docProcessingPDF');

const app = express();


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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/files');
  }
});

const upload = multer({ storage: storage }).single('file');

app.post('/', async (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      // Handle possible multer errors
      console.error(err);
      return res.status(500).json({ error: `Error uploading file: ${err.message}` });
    }

    // At this point, we have access to req.body and req.file
    console.log(req.body.uuid);
    const uuid = req.body.uuid;

    if (req.file) {
      // Define the new filename with the UUID
      let ext = path.extname(req.file.originalname);
      let newFilename = `${uuid}${ext}`;
      let oldPath = req.file.path;
      let newPath = path.join('/files', newFilename);
      const outputDir = path.join(__dirname, 'files_processed');

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      try {
        if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
            await convertImageToJP2(oldPath, path.join(outputDir, `${uuid}.jp2`));
        } else if (extension === '.pdf') {
          await convertPdf(filePath, outputDir, baseName);
        } else {
            return res.status(400).send('Unsupported file format');
        }

        res.status(200).send('Files processed successfully');
      } catch (error) {
          console.error(error);
          res.status(500).send('Internal server error');
      } finally {
          fs.unlinkSync(oldPath);  // Clean up the original uploaded file
      }

      // Rename the file
      fs.rename(oldPath, newPath, function(err) {
        if (err) {
          console.error('Error renaming file', err);
          return res.status(500).json({ error: `Error renaming file: ${err.message}` });
        }

        // Respond with success after renaming the file
        res.json({
          message: `File uploaded and renamed successfully.`,
          file: { ...req.file, filename: newFilename, path: newPath }
        });

        // Make sure to handle other necessary cleanups or database updates as needed
      });
    } else {
      // Handle case where no file is uploaded
      res.status(400).json({ error: 'No file uploaded.' });
    }
  });
});

app.use('/files', express.static('/files'));

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

app.listen(3001, () => console.log('Api started on port 3001 (internal)'));
