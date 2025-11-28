const VerificationHtml = (name: string, verificationCode: string) => {
  return `
  <div style="font-family:Roboto,Arial; max-width:500px; margin:auto; padding:20px; border:1px solid #d0d7de; border-radius:10px;">
      <h2 style="text-align:center; color:#0a66c2;">Email Verification</h2>

      <p style="color:#333;">Hi <strong>${name}</strong>,</p>
      <p style="color:#333;">Please enter the following verification code:</p>

      <div style="text-align:center; margin:20px 0;">
          <span style="display:inline-block; font-size:30px; font-weight:600; color:#0a66c2; padding:10px 20px; border:2px solid #0a66c2; border-radius:8px; letter-spacing:5px;">
              ${verificationCode}
          </span>
      </div>

      <p style="color:#555;">If this wasn’t you, kindly ignore the email.</p>
      <p style="margin-top:30px; color:#777;">Best regards,<br>Your App Team</p>
  </div>
  `
}

const PasswordResetHtml = (name: string, verificationCode: string) => {
  return `
  <div style="font-family:Roboto,Arial; max-width:500px; margin:auto; padding:20px; border:1px solid #d0d7de; border-radius:10px;">
      <h2 style="text-align:center; color:#0a66c2;">Password Reset</h2>

      <p style="color:#333;">Hi <strong>${name}</strong>,</p>
      <p style="color:#333;">You requested to reset your password. Please use the following code:</p>

      <div style="text-align:center; margin:20px 0;">
          <span style="display:inline-block; font-size:30px; font-weight:600; color:#0a66c2; padding:10px 20px; border:2px solid #0a66c2; border-radius:8px; letter-spacing:5px;">
              ${verificationCode}
          </span>
      </div>

      <p style="color:#555;">If this wasn’t you, kindly ignore the email.</p>
      <p style="margin-top:30px; color:#777;">Best regards,<br>Your App Team</p>
  </div>
  `
}

export {
    VerificationHtml,
    PasswordResetHtml
}