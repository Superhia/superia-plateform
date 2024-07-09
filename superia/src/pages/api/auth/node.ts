import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Load environment variables from .env file
dotenv.config();

// Define the SMTP transport options
const smtpOptions: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};

// Create a reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpOptions);

// Function to send email
async function sendEmail(to: string, subject: string, text: string, html: string) {
    let info = await transporter.sendMail({
        from: `"Example Team" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
    });

    console.log('Message sent: %s', info.messageId);
}

// Example usage
sendEmail('recipient@example.com', 'Hello', 'Hello world?', '<b>Hello world?</b>').catch(console.error);
