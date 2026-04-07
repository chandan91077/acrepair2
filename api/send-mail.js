const nodemailer = require('nodemailer');

function json(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return json(res, 405, { success: false, message: 'Method not allowed' });
  }

  try {
    const { name, phone, email, service, source } = req.body || {};

    if (!name || !phone || !email || !service) {
      return json(res, 400, { success: false, message: 'Missing required form fields' });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const ownerEmail = process.env.OWNER_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass || !ownerEmail) {
      return json(res, 500, {
        success: false,
        message: 'Server mail configuration missing (SMTP_USER/SMTP_PASS/OWNER_EMAIL)'
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const ownerHtml = `
      <h2>New AC Service Request</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Mobile:</b> ${phone}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Service:</b> ${service}</p>
      <p><b>Source:</b> ${source || 'Website Form'}</p>
      <p><b>Submitted At:</b> ${submittedAt}</p>
    `;

    const customerHtml = `
      <h2>Krishna AC Service - Request Received</h2>
      <p>Hello ${name},</p>
      <p>We received your request for <b>${service}</b>.</p>
      <p>Our team will contact you shortly on <b>${phone}</b>.</p>
      <p>Thank you for choosing Krishna AC Service.</p>
    `;

    await transporter.sendMail({
      from: smtpUser,
      to: ownerEmail,
      subject: `New AC Service Booking - ${name}`,
      html: ownerHtml,
      replyTo: email
    });

    await transporter.sendMail({
      from: smtpUser,
      to: email,
      subject: 'We received your AC service request',
      html: customerHtml
    });

    return json(res, 200, { success: true, message: 'Mail sent successfully' });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error && error.message ? error.message : 'Mail send failed'
    });
  }
};
