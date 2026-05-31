require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const outreachRoutes = require('./routes/outreach');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from /frontend/admin
app.use('/', express.static(path.join(__dirname, '../frontend/admin')));

// Serve outreach single_email page
app.get('/single_email', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/single_email.html'));
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/outreach', outreachRoutes);

// Fallback for SPA routing if needed (though admin is mostly a single page)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
