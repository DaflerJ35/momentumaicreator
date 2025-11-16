/**
 * Email Service - Send emails via SMTP
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter = null;

// Initialize email transporter if SMTP is configured
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an email
 */
async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!transporter) {
    logger.warn('SMTP not configured, email not sent.', { to, subject });
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Momentum AI'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
      replyTo,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email', { to, subject, error: error.message, stack: error.stack });
    return { success: false, error: error.message };
  }
}

/**
 * Send team invitation email
 */
async function sendTeamInvitation({ to, teamName, inviterName, teamId, inviteLink }) {
  const subject = `You've been invited to join ${teamName} on Momentum AI`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Team Invitation</h2>
        <p>Hello,</p>
        <p><strong>${inviterName}</strong> has invited you to join the team <strong>${teamName}</strong> on Momentum AI.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${inviteLink}" class="button">Accept Invitation</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${inviteLink}</p>
        <div class="footer">
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>© ${new Date().getFullYear()} Momentum AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `
Team Invitation

Hello,

${inviterName} has invited you to join the team ${teamName} on Momentum AI.

Accept the invitation by visiting: ${inviteLink}

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Momentum AI. All rights reserved.
  `;

  return await sendEmail({ to, subject, html, text });
}

/**
 * Send referral invitation email
 */
async function sendReferralInvitation({ to, referrerName, referralLink }) {
  const subject = `${referrerName} invited you to try Momentum AI`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>You've been invited to Momentum AI</h2>
        <p>Hello,</p>
        <p><strong>${referrerName}</strong> thinks you'd love Momentum AI - an AI-powered content creation platform.</p>
        <p>Join using their referral link to get started:</p>
        <a href="${referralLink}" class="button">Join Momentum AI</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${referralLink}</p>
        <div class="footer">
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>© ${new Date().getFullYear()} Momentum AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `
You've been invited to Momentum AI

Hello,

${referrerName} thinks you'd love Momentum AI - an AI-powered content creation platform.

Join using their referral link: ${referralLink}

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Momentum AI. All rights reserved.
  `;

  return await sendEmail({ to, subject, html, text });
}

module.exports = {
  sendEmail,
  sendTeamInvitation,
  sendReferralInvitation,
};

