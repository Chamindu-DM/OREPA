// ============================================================================
// OREPA Backend - Email HTML Templates
// ============================================================================
//
// Styled email templates that match the OREPA website dark theme.
// All templates use inline CSS for maximum email client compatibility.
//
// Brand Colors:
//   - Navy:  #2E2D6B
//   - Gold:  #D4A843
//   - Black: #000000
//   - White: #ffffff
// ============================================================================

const LOGO_URL = 'https://orepa.lk/images/Orepa_logo_h.png';
const SITE_URL = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'https://orepa.lk';

/**
 * Base email wrapper with OREPA branding
 */
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OREPA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 30px 0 40px;">
              <a href="${SITE_URL}" style="text-decoration: none;">
                <img src="${LOGO_URL}" alt="OREPA" width="160" style="display: block; width: 160px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Content Card -->
          <tr>
            <td style="background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.08); padding: 50px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px 0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255, 255, 255, 0.35); line-height: 1.6;">
                Old Royalists' Engineering Professionals Association
              </p>
              <p style="margin: 0 0 8px; font-size: 11px; color: rgba(255, 255, 255, 0.25); line-height: 1.6;">
                This is an automated message from the OREPA Platform. Please do not reply to this email.
              </p>
              <p style="margin: 0; font-size: 11px; color: rgba(255, 255, 255, 0.2);">
                &copy; ${new Date().getFullYear()} OREPA. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Divider line used between sections
 */
const divider = '<hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 30px 0;" />';

// ============================================================================
// PASSWORD RESET EMAIL
// ============================================================================

const passwordResetEmail = ({ firstName, resetUrl }) => {
  const content = `
    <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: 300; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">
      Password Reset
    </h1>
    <p style="margin: 0 0 30px; font-size: 13px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">
      Account Recovery
    </p>

    ${divider}

    <p style="margin: 0 0 20px; font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
      Hello ${firstName},
    </p>
    <p style="margin: 0 0 30px; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.8;">
      We received a request to reset your password. Click the button below to set a new password. This link will expire in <strong style="color: #ffffff;">10 minutes</strong>.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0 30px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 13px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; transition: all 0.3s;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    ${divider}

    <p style="margin: 0 0 10px; font-size: 12px; color: rgba(255, 255, 255, 0.4); line-height: 1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.3); line-height: 1.6; word-break: break-all;">
      If the button doesn't work, copy and paste this URL into your browser:<br />
      <a href="${resetUrl}" style="color: rgba(255, 255, 255, 0.5); text-decoration: underline;">${resetUrl}</a>
    </p>
  `;

  return baseTemplate(content);
};

// ============================================================================
// REGISTRATION CONFIRMATION EMAIL
// ============================================================================

const registrationConfirmationEmail = ({ firstName, lastName }) => {
  const content = `
    <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: 300; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">
      Welcome
    </h1>
    <p style="margin: 0 0 30px; font-size: 13px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">
      Registration Received
    </p>

    ${divider}

    <p style="margin: 0 0 20px; font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
      Hello ${firstName},
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.8;">
      Thank you for registering on the OREPA Platform. Your account has been created and is currently <strong style="color: #ffffff;">pending administrator approval</strong>.
    </p>
    <p style="margin: 0 0 30px; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.8;">
      You will receive another email once your account has been reviewed and activated by one of our administrators.
    </p>

    ${divider}

    <!-- Account Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 8px 0;">
          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">Name</span><br />
          <span style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">${firstName} ${lastName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">Status</span><br />
          <span style="font-size: 14px; color: #D4A843;">Pending Approval</span>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content);
};

// ============================================================================
// ADMIN NOTIFICATION: NEW REGISTRATION
// ============================================================================

const adminNewRegistrationEmail = ({ firstName, lastName, email }) => {
  const adminUrl = `${SITE_URL}/admin`;

  const content = `
    <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: 300; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">
      New Registration
    </h1>
    <p style="margin: 0 0 30px; font-size: 13px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">
      Action Required
    </p>

    ${divider}

    <p style="margin: 0 0 20px; font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
      Hello Admin,
    </p>
    <p style="margin: 0 0 30px; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.8;">
      A new user has registered on the OREPA Platform and is awaiting your review.
    </p>

    <!-- Applicant Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.03); padding: 20px; margin-bottom: 30px;">
      <tr>
        <td style="padding: 8px 0;">
          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">Applicant</span><br />
          <span style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">${firstName} ${lastName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">Email</span><br />
          <span style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">${email}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em;">Status</span><br />
          <span style="font-size: 14px; color: #D4A843;">Pending Review</span>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0 20px;">
      <tr>
        <td align="center">
          <a href="${adminUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 13px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none;">
            Review Application
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content);
};

module.exports = {
  passwordResetEmail,
  registrationConfirmationEmail,
  adminNewRegistrationEmail,
};
