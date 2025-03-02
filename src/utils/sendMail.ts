import nodemailer from 'nodemailer';
import ApiError from './ApiError';

export const sendEmail = async (to: string, resetCode: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    const mailOptions = {
      from: '"Meow" <meowappepf@gmail.com>',
      to: to,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :</p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; background: #f3f3f3; padding: 10px; border-radius: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>Ce code est valable pendant 10 minutes. Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
          <p>Cordialement,</p>
          <p><strong>L'équipe MEOW</strong> Miaou Woof Woof</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’e-mail :', error);
    throw new ApiError(500, 'Impossible d’envoyer l’e-mail.');
  }
};
