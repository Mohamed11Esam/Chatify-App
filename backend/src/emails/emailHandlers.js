
import { createWelcomeEmailTemplate } from './emailTemplates.js';
import { sendMail, sender } from './../lib/mailer.js';

const isValidEmail = (value) => {
    if (!value || typeof value !== 'string') return false;
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const sendWelcomeEmail = async (email, name, clientURL) => {
    const html = createWelcomeEmailTemplate(name, clientURL);

    // Build a safe `from` value. Resend requires either 'name <email@domain>' or plain email.
    let fromValue = null;
    if (sender && isValidEmail(sender.email)) {
        const displayName = sender.name && typeof sender.name === 'string' && sender.name.trim().length > 0
            ? sender.name.replace(/\r?\n/g, ' ') // sanitize newlines
            : 'Chatify';
        fromValue = `${displayName} <${sender.email.trim()}>`;
    } else if (process.env.DEFAULT_FROM && isValidEmail(process.env.DEFAULT_FROM)) {
        fromValue = process.env.DEFAULT_FROM.trim();
    } else if (process.env.FALLBACK_EMAIL && isValidEmail(process.env.FALLBACK_EMAIL)) {
        fromValue = process.env.FALLBACK_EMAIL.trim();
    } else {
        // Last resort fallback - a non-routable example domain to avoid accidental delivery
        fromValue = 'Chatify <no-reply@example.com>';
        console.warn('Using fallback from email. Set a valid sender in ./lib/resend.js or DEFAULT_FROM env var to avoid this.');
    }

    try {
        const result = await sendMail({
            from: fromValue,
            to: email,
            subject: process.env.NODE_ENV === 'development' ? 'Welcome to Chatify (development)' : 'Welcome to Chatify',
            html,
        });

        if (!result) {
            console.warn('Mailer skipped sending (no transporter).');
            return null;
        }

        if (result.previewUrl) {
            console.log('Email preview URL:', result.previewUrl);
            return { info: result.info, previewUrl: result.previewUrl };
        }

        console.log('Welcome email sent successfully:', result.info);
        return result.info;
    } catch (err) {
        console.error('Error sending welcome email:', err);
        throw new Error('Failed to send welcome email');
    }
};
