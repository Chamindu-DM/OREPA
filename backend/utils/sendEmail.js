const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const { data, error } = await resend.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'OREPA Platform'} <${process.env.EMAIL_FROM}>`,
    to: typeof options.email === 'string' ? [options.email] : options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  return data;
};

module.exports = sendEmail;
