import nodemailer from 'nodemailer';

// Create transporter for Titan Email
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 465,
  secure: true, // use SSL/TLS
  auth: {
    user: 'contact@telmeezlb.com', // Titan Email address
    pass: process.env['EMAIL_PASSWORD'] // This should be your Titan Email password
  }
});

// Generate a 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email: string, verificationCode: string, language: string = 'en'): Promise<boolean> => {
  try {
    // Check if EMAIL_PASSWORD is configured
    if (!process.env['EMAIL_PASSWORD']) {
      console.error('EMAIL_PASSWORD environment variable is not set');
      return false;
    }

    // Email templates based on language
    const emailTemplates = {
      en: {
        subject: 'Your Telmeez Verification Code',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Telmeez Verification Code</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <img src="https://telmeezlb.com/assets/logo-aMd6LOzs.png" alt="Telmeez" style="width: 140px; height: auto; margin-bottom: 20px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Verification Code</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Please enter this code to verify your account</p>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 40px;">
                          <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Your verification code is:</h2>
                          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; display: inline-block; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: 700; color: #4c51bf; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${verificationCode}</span>
                          </div>
                          <p style="color: #718096; margin: 25px 0 0 0; font-size: 15px; font-weight: 500;">
                            ⏰ This code will expire in <strong>10 minutes</strong>
                          </p>
                        </div>
                        
                        <div style="background: #f7fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
                          <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💡 Need Help?</h3>
                          <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                            Having trouble with the verification process? Our support team is here to help you complete your account setup.
                          </p>
                          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                            <a href="mailto:contact@telmeezlb.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">Email Us</a>
                            <a href="tel:+96170123456" style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">Call Us</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #2d3748; padding: 30px 40px; text-align: center;">
                        <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 13px;">
                          This email was sent to verify your Telmeez account
                        </p>
                        <p style="color: #718096; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} Telmeez. All rights reserved. | 
                          <a href="https://telmeezlb.com" style="color: #a0aec0; text-decoration: none;">telmeezlb.com</a>
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      },
      ar: {
        subject: 'رمز التحقق الخاص بك من Telmeez',
        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>رمز التحقق من Telmeez</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <img src="https://telmeezlb.com/assets/logo-aMd6LOzs.png" alt="Telmeez" style="width: 140px; height: auto; margin-bottom: 20px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">رمز التحقق</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">يرجى إدخال هذا الرمز للتحقق من حسابك</p>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 40px;">
                          <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">رمز التحقق الخاص بك هو:</h2>
                          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; display: inline-block; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: 700; color: #4c51bf; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${verificationCode}</span>
                          </div>
                          <p style="color: #718096; margin: 25px 0 0 0; font-size: 15px; font-weight: 500;">
                            ⏰ سينتهي هذا الرمز خلال <strong>10 دقائق</strong>
                          </p>
                        </div>
                        
                        <div style="background: #f7fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
                          <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💡 تحتاج مساعدة؟</h3>
                          <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                            تواجه مشكلة في عملية التحقق؟ فريق الدعم لدينا هنا لمساعدتك في إكمال إعداد حسابك.
                          </p>
                          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                            <a href="mailto:contact@telmeezlb.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">راسلنا</a>
                            <a href="tel:+96170123456" style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">اتصل بنا</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #2d3748; padding: 30px 40px; text-align: center;">
                        <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 13px;">
                          تم إرسال هذا البريد الإلكتروني للتحقق من حساب Telmeez الخاص بك
                        </p>
                        <p style="color: #718096; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} Telmeez. جميع الحقوق محفوظة. | 
                          <a href="https://telmeezlb.com" style="color: #a0aec0; text-decoration: none;">telmeezlb.com</a>
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      },
      fr: {
        subject: 'Votre code de vérification Telmeez',
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code de vérification Telmeez</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <img src="https://telmeezlb.com/assets/logo-aMd6LOzs.png" alt="Telmeez" style="width: 140px; height: auto; margin-bottom: 20px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Code de vérification</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Veuillez saisir ce code pour vérifier votre compte</p>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 40px;">
                          <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Votre code de vérification est :</h2>
                          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; display: inline-block; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: 700; color: #4c51bf; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${verificationCode}</span>
                          </div>
                          <p style="color: #718096; margin: 25px 0 0 0; font-size: 15px; font-weight: 500;">
                            ⏰ Ce code expirera dans <strong>10 minutes</strong>
                          </p>
                        </div>
                        
                        <div style="background: #f7fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
                          <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💡 Besoin d'aide ?</h3>
                          <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                            Vous avez des difficultés avec le processus de vérification ? Notre équipe de support est là pour vous aider à finaliser la configuration de votre compte.
                          </p>
                          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                            <a href="mailto:contact@telmeezlb.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">Nous écrire</a>
                            <a href="tel:+96170123456" style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">Nous appeler</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #2d3748; padding: 30px 40px; text-align: center;">
                        <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 13px;">
                          Cet e-mail a été envoyé pour vérifier votre compte Telmeez
                        </p>
                        <p style="color: #718096; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} Telmeez. Tous droits réservés. | 
                          <a href="https://telmeezlb.com" style="color: #a0aec0; text-decoration: none;">telmeezlb.com</a>
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      }
    };

    const template = emailTemplates[language as keyof typeof emailTemplates] || emailTemplates.en;

    const mailOptions = {
      from: '"Telmeez" <contact@telmeezlb.com>', // Titan Email address
      to: email,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    
    // Provide specific error messages for common issues
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check EMAIL_PASSWORD in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check internet connection and firewall');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timeout - check smtp.titan.email accessibility');
    }
    
    return false;
  }
};

// Verify transporter connection
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}; 