import os
import smtplib
import random
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# In-memory OTP store: { email: { otp, name, expires } }
otp_store: dict = {}

OTP_EXPIRY_SECONDS = 600  # 10 minutes


def _get_smtp_credentials():
    sender = os.getenv("SMTP_EMAIL", "")
    password = os.getenv("SMTP_PASSWORD", "")
    return sender, password


def send_otp_email(email: str, name: str) -> dict:
    """Generates a 6-digit OTP, stores it, and sends a styled HTML email."""
    otp = str(random.randint(100000, 999999))
    otp_store[email] = {
        "otp": otp,
        "name": name,
        "expires": time.time() + OTP_EXPIRY_SECONDS,
    }

    sender_email, sender_password = _get_smtp_credentials()
    if not sender_email or not sender_password:
        return {"success": False, "error": "SMTP credentials not configured. Add SMTP_EMAIL and SMTP_PASSWORD to .env"}

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="520" cellpadding="0" cellspacing="0"
              style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid #334155;">
              <!-- Header -->
              <tr>
                <td align="center"
                  style="background:linear-gradient(135deg,#0891b2,#1d4ed8);padding:36px 40px;">
                  <div style="font-size:36px;">💧</div>
                  <h1 style="color:#ffffff;margin:10px 0 4px;font-size:24px;font-weight:700;">AquaAI Portal</h1>
                  <p style="color:#bae6fd;margin:0;font-size:14px;">Email Verification</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="color:#94a3b8;font-size:15px;margin:0 0 12px;">Hi <strong style="color:#e2e8f0;">{name}</strong>,</p>
                  <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;">
                    Use the verification code below to complete your AquaAI account setup.
                    This code expires in <strong style="color:#e2e8f0;">10 minutes</strong>.
                  </p>
                  <!-- OTP Box -->
                  <div style="text-align:center;margin:0 0 28px;">
                    <div style="display:inline-block;background:#0f172a;border:2px solid #0891b2;
                      border-radius:16px;padding:20px 48px;">
                      <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#22d3ee;">
                        {otp}
                      </span>
                    </div>
                  </div>
                  <p style="color:#64748b;font-size:13px;margin:0;">
                    If you did not request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#0f172a;padding:20px 40px;text-align:center;">
                  <p style="color:#475569;font-size:12px;margin:0;">
                    © 2025 AquaAI · Water Quality Intelligence Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "AquaAI — Your Verification Code"
    msg["From"] = f"AquaAI <{sender_email}>"
    msg["To"] = email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
        print(f"[EmailService] OTP sent to {email}")
        return {"success": True}
    except smtplib.SMTPAuthenticationError:
        return {"success": False, "error": "Gmail authentication failed. Make sure you're using an App Password (not your regular password)."}
    except Exception as e:
        print(f"[EmailService] Error: {e}")
        return {"success": False, "error": str(e)}


def verify_otp(email: str, otp: str) -> dict:
    """Validates the OTP for a given email."""
    record = otp_store.get(email)
    if not record:
        return {"success": False, "error": "No verification code found. Please sign up again."}
    if time.time() > record["expires"]:
        otp_store.pop(email, None)
        return {"success": False, "error": "Code expired. Please request a new one."}
    if record["otp"] != otp.strip():
        return {"success": False, "error": "Incorrect code. Please try again."}
    otp_store.pop(email, None)
    return {"success": True, "name": record["name"]}
