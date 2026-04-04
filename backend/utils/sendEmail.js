const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS requires secure: false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send an email notification
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"RoamHaven" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (err) {
    // We log the error but do NOT throw — email failure shouldn't crash the booking flow
    console.error("📧 Email sending failed:", err.message);
  }
};

/**
 * Booking Approved Email — sent to guest when host approves their request
 */
const sendBookingApprovedEmail = (guestEmail, guestName, homeName, checkIn, checkOut, totalPrice) => {
  return sendEmail({
    to: guestEmail,
    subject: `🎉 Your Booking at "${homeName}" has been Approved!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Booking Approved! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Great news, ${guestName}!</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            The host has approved your booking request for <strong>${homeName}</strong>. Please complete the payment to confirm your stay.
          </p>

          <!-- Details Card -->
          <div style="background: #f8f9ff; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px; color: #333;">📋 Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">🏠 Property</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${homeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">📅 Check-In</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">📅 Check-Out</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; border-top: 1px solid #e0e0e0;">💰 Total Price</td>
                <td style="padding: 8px 0; color: #667eea; font-weight: 700; text-align: right; font-size: 18px; border-top: 1px solid #e0e0e0;">₹${totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/bookings" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Complete Payment →
            </a>
          </div>

          <p style="color: #999; font-size: 13px; text-align: center;">
            Please complete your payment soon to secure your booking.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} RoamHaven. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Booking Rejected Email — sent to guest when host rejects their request
 */
const sendBookingRejectedEmail = (guestEmail, guestName, homeName, checkIn, checkOut) => {
  return sendEmail({
    to: guestEmail,
    subject: `Booking Update for "${homeName}"`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Booking Not Approved</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Hi ${guestName}, we have an update.</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Unfortunately, the host was unable to approve your booking request for <strong>${homeName}</strong> for the dates 
            <strong>${new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> to 
            <strong>${new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
          </p>

          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            This could be due to scheduling conflicts or property availability. Don't worry — there are plenty of other amazing stays waiting for you!
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/homes" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Explore Other Homes →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} RoamHaven. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Payment Confirmed Email — sent to guest when payment succeeds
 */
const sendPaymentConfirmationEmail = (guestEmail, guestName, homeName, checkIn, checkOut, totalPrice) => {
  return sendEmail({
    to: guestEmail,
    subject: `✅ Payment Successful - Booking Confirmed for "${homeName}"!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Booking Confirmed! ✅</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">You're all set, ${guestName}!</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We have successfully received your payment of <strong>₹${totalPrice.toLocaleString('en-IN')}</strong>. Your stay at <strong>${homeName}</strong> is now fully confirmed.
          </p>

          <!-- Details Card -->
          <div style="background: #f8f9ff; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px; color: #333;">🧳 Your Trip Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">🏠 Property</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${homeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">📅 Check-In</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">📅 Check-Out</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; border-top: 1px solid #e0e0e0;">Status</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 700; text-align: right; border-top: 1px solid #e0e0e0;">PAID & CONFIRMED</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/bookings" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              View My Trips →
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px; text-align: center; margin-top: 20px;">
            Pack your bags and get ready for a great stay! If you have any questions, you can contact the host via the RoamHaven Inbox.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} RoamHaven. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendBookingApprovedEmail, sendBookingRejectedEmail, sendPaymentConfirmationEmail };
