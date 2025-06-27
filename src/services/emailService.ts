import nodemailer from 'nodemailer';

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: 'alinsafawi19@gmail.com', // Replace with your Gmail address
    pass: process.env['EMAIL_PASSWORD'] // This should be your Gmail app password
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3B82F6; margin: 0;">Telmeez</h1>
              <p style="color: #6B7280; margin: 10px 0 0 0;">Your verification code</p>
            </div>
            
            <div style="background: #F8FAFC; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">Verification Code</h2>
              <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; border: 2px solid #E5E7EB;">
                <span style="font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 8px;">${verificationCode}</span>
              </div>
              <p style="color: #6B7280; margin: 20px 0 0 0; font-size: 14px;">
                This code will expire in 10 minutes
              </p>
            </div>
            
            <div style="background: #EFF6FF; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #1F2937; margin: 0 0 10px 0; font-size: 16px;">Need help?</h3>
              <p style="color: #6B7280; margin: 0; font-size: 14px;">
                If you didn't request this code or need assistance, please contact us at 
                <a href="mailto:contact@telmeezlb.com" style="color: #3B82F6;">contact@telmeezlb.com</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #6B7280; font-size: 12px;">
              <p>This email was sent from your Gmail account</p>
              <p>© 2024 Telmeez. All rights reserved.</p>
            </div>
          </div>
        `
      },
      ar: {
        subject: 'رمز التحقق الخاص بك من Telmeez',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3B82F6; margin: 0;">Telmeez</h1>
              <p style="color: #6B7280; margin: 10px 0 0 0;">رمز التحقق الخاص بك</p>
            </div>
            
            <div style="background: #F8FAFC; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">رمز التحقق</h2>
              <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; border: 2px solid #E5E7EB;">
                <span style="font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 8px;">${verificationCode}</span>
              </div>
              <p style="color: #6B7280; margin: 20px 0 0 0; font-size: 14px;">
                سينتهي هذا الرمز خلال 10 دقائق
              </p>
            </div>
            
            <div style="background: #EFF6FF; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #1F2937; margin: 0 0 10px 0; font-size: 16px;">تحتاج مساعدة؟</h3>
              <p style="color: #6B7280; margin: 0; font-size: 14px;">
                إذا لم تطلب هذا الرمز أو تحتاج إلى مساعدة، يرجى الاتصال بنا على 
                <a href="mailto:contact@telmeezlb.com" style="color: #3B82F6;">contact@telmeezlb.com</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #6B7280; font-size: 12px;">
              <p>تم إرسال هذا البريد الإلكتروني من حساب Gmail الخاص بك</p>
              <p>© 2024 Telmeez. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        `
      },
      fr: {
        subject: 'Votre code de vérification Telmeez',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3B82F6; margin: 0;">Telmeez</h1>
              <p style="color: #6B7280; margin: 10px 0 0 0;">Votre code de vérification</p>
            </div>
            
            <div style="background: #F8FAFC; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">Code de vérification</h2>
              <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; border: 2px solid #E5E7EB;">
                <span style="font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 8px;">${verificationCode}</span>
              </div>
              <p style="color: #6B7280; margin: 20px 0 0 0; font-size: 14px;">
                Ce code expirera dans 10 minutes
              </p>
            </div>
            
            <div style="background: #EFF6FF; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #1F2937; margin: 0 0 10px 0; font-size: 16px;">Besoin d'aide ?</h3>
              <p style="color: #6B7280; margin: 0; font-size: 14px;">
                Si vous n'avez pas demandé ce code ou avez besoin d'aide, veuillez nous contacter à 
                <a href="mailto:contact@telmeezlb.com" style="color: #3B82F6;">contact@telmeezlb.com</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #6B7280; font-size: 12px;">
              <p>Cet e-mail a été envoyé depuis votre compte Gmail</p>
              <p>© 2024 Telmeez. Tous droits réservés.</p>
            </div>
          </div>
        `
      }
    };

    const template = emailTemplates[language as keyof typeof emailTemplates] || emailTemplates.en;

    const mailOptions = {
      from: '"Telmeez" <alinsafawi19@gmail.com>', // Replace with your Gmail address
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
      console.error('Connection timeout - check smtp.gmail.com accessibility');
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