import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('EMAIL_USER or EMAIL_PASSWORD not set. Email not sent.');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"Grana 3D" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || "Para ver este correo, usa un cliente de correo compatible con HTML.",
        });

        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
