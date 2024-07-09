import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou un autre service de votre choix
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};