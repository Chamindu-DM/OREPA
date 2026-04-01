const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'OREPA Platform'} <${process.env.EMAIL_FROM}>`,
      to: typeof options.email === 'string' ? [options.email] : options.email, // handles string or array of emails
      subject: options.subject,
      text: options.message,
      html: options.html, // Optional HTML body
    });

    if (error) {
      console.error('Error returned from Resend API:', error);
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    console.log('Message sent via Resend: %j', data);
    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
};

module.exports = sendEmail;
