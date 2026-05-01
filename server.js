import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

// Fallback to index.html for SPA-like behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
