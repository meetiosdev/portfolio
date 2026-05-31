const express = require('express');
const nodemailer = require('nodemailer');
const { supabase } = require('../services/supabaseService');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper to check Gmail credentials
const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Gmail outreach credentials (GMAIL_USER or GMAIL_APP_PASSWORD) are not configured in backend/.env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

/**
 * GET /api/outreach/next-pending
 * Fetches the first pending recruiter in the queue from Supabase
 */
router.get('/next-pending', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client is not initialized. Please verify credentials.' });
    }

    const { data, error } = await supabase
      .from('recruiters')
      .select('id, name, email, company, status')
      .eq('status', 'pending')
      .order('id', { ascending: true })
      .limit(1);

    if (error) {
      // Friendly message if they haven't run the SQL schema script yet
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return res.status(404).json({
          error: 'Recruiters table not found. Have you created the table in Supabase? Please run the SQL schema script provided in the implementation plan.',
          sqlRequired: true
        });
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ message: 'No pending recruiters found in queue!', recruiter: null });
    }

    return res.status(200).json({ recruiter: data[0] });
  } catch (error) {
    console.error('Error fetching next recruiter:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/outreach/single-send
 * Sends an email immediately and updates recruiter status
 */
router.post('/single-send', verifyToken, async (req, res) => {
  const { id, email, subject, body } = req.body;

  if (!id || !email || !subject || !body) {
    return res.status(400).json({ error: 'Missing required parameters: id, email, subject, and body are required.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client is not initialized.' });
    }

    // 1. Get/Verify Nodemailer transporter
    let transporter;
    try {
      transporter = getTransporter();
    } catch (envError) {
      console.error('Nodemailer configuration error:', envError.message);
      return res.status(500).json({ error: envError.message });
    }

    // 2. Draft & send the email
    const mailOptions = {
      from: `"Swaraj (Portfolio Outreach)" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      text: body
      // We can add html support if needed later, but text is excellent and highly deliverable for plain outreach!
    };

    let sendSuccess = false;
    let mailErrorMsg = '';

    try {
      await transporter.sendMail(mailOptions);
      sendSuccess = true;
      console.log(`Email successfully sent to ${email} (Recruiter ID: ${id})`);
    } catch (mailError) {
      console.error(`Failed to send email to ${email}:`, mailError);
      mailErrorMsg = mailError.message || 'Mail server error';
    }

    // 3. Update status in Supabase database
    if (sendSuccess) {
      const { error: dbError } = await supabase
        .from('recruiters')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id);

      if (dbError) {
        console.error(`Email sent to ${email} but failed to update status to 'sent' in Supabase:`, dbError);
        return res.status(500).json({
          message: 'Email was sent successfully, but updating status in Supabase database failed.',
          error: dbError.message
        });
      }

      return res.status(200).json({ success: true, message: `Email successfully sent to ${email}!` });
    } else {
      // Mark as failed in Supabase so it can be debugged or retried later
      const { error: dbError } = await supabase
        .from('recruiters')
        .update({
          status: 'failed'
        })
        .eq('id', id);

      if (dbError) {
        console.error(`Email failed to send and also failed to update status to 'failed' in Supabase:`, dbError);
      }

      return res.status(500).json({
        error: `Failed to deliver email. Status updated to failed. Reason: ${mailErrorMsg}`
      });
    }
  } catch (error) {
    console.error('Error during manual email send:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
