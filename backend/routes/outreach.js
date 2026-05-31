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

  // Explicit SMTP configuration using Port 465 (SSL) to bypass firewalls
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465 (SSL)
    auth: {
      user,
      pass
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 10000,     // 10 seconds
    tls: {
      rejectUnauthorized: false // avoids SSL handshake blocks on cloud platforms
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
  const { email, name, subject, body } = req.body;

  if (!email || !subject || !body) {
    return res.status(400).json({ error: 'Missing required parameters: email, subject, and body are required.' });
  }

  try {
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
      from: `"Swarajmeet Singh" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      text: body
    };

    let sendSuccess = false;
    let mailErrorMsg = '';

    try {
      await transporter.sendMail(mailOptions);
      sendSuccess = true;
      console.log(`Email successfully sent to ${email}`);
    } catch (mailError) {
      console.error(`Failed to send email to ${email}:`, mailError);
      mailErrorMsg = mailError.message || 'Mail server error';
    }

    // 3. Update/Log status in Supabase database for historical tracking (non-blocking)
    if (sendSuccess) {
      if (supabase) {
        supabase
          .from('recruiters')
          .upsert(
            {
              email: email,
              name: name || 'Manual Entry',
              company: 'Manual Entry',
              status: 'sent',
              sent_at: new Date().toISOString()
            },
            { onConflict: 'email' }
          )
          .then(({ error: dbError }) => {
            if (dbError) {
              console.error(`Email sent to ${email} but failed to log history in Supabase:`, dbError);
            } else {
              console.log(`Email outreach to ${email} logged in Supabase.`);
            }
          })
          .catch(dbCatchError => {
            console.error(`Unexpected database error logging outreach to Supabase:`, dbCatchError);
          });
      }

      return res.status(200).json({ success: true, message: `Email successfully sent to ${email}!`, senderEmail: process.env.GMAIL_USER });
    } else {
      // Non-blocking log database status to failed if send fails
      if (supabase) {
        supabase
          .from('recruiters')
          .upsert(
            {
              email: email,
              name: name || 'Manual Entry',
              company: 'Manual Entry',
              status: 'failed'
            },
            { onConflict: 'email' }
          )
          .then(({ error: dbError }) => {
            if (dbError) {
              console.error(`Failed to log 'failed' status to Supabase:`, dbError);
            }
          })
          .catch(() => {});
      }

      return res.status(500).json({
        error: `Failed to deliver email. Reason: ${mailErrorMsg}`
      });
    }
  } catch (error) {
    console.error('Error during manual email send:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
