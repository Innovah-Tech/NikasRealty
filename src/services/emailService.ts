import emailjs from '@emailjs/browser';

// Credentials provided by the user
const SERVICE_ID = 'service_1ni5j53';
const TEMPLATE_ID = 'template_hdxwxdk';
const PUBLIC_KEY = 'l-oQJJUqo0l1E_iAv';

export interface EmailData {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    property_title?: string;
    type: 'Property Request' | 'Newsletter Subscription' | 'Contact Message';
}

export const emailService = {
    /**
     * Sends an email notification using EmailJS
     */
    async sendNotification(data: EmailData) {
        try {
            const templateParams = {
                name: data.name || 'Not Provided',
                email: data.email || 'Not Provided',
                phone: data.phone || 'Not Provided',
                message: data.message || 'No message content.',
                property_title: data.property_title || 'N/A',
                submission_type: data.type,
            };

            const response = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            console.log('Email successfully sent!', response.status, response.text);
            return response;
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
};
