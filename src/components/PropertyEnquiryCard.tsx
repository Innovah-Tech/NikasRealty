import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/utils/sanitize';
import { validateName, validateEmail, validatePhone, validateMessage } from '@/utils/validate';

interface PropertyEnquiryCardProps {
  propertyName: string;
  propertyId?: string;
}

const AGENT_PHONE = '+254700437505';
const WHATSAPP_NUMBER = '254700437505';

const PropertyEnquiryCard = ({ propertyName, propertyId }: PropertyEnquiryCardProps) => {
  const defaultMessage = `Hello,\n\nI'm interested in:\n${propertyName}`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      toast.error(nameValidation.error || 'Invalid name');
      return;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'Invalid phone number');
      return;
    }

    const emailValidation = validateEmail(formData.email, false);
    if (!emailValidation.valid) {
      toast.error(emailValidation.error || 'Invalid email');
      return;
    }

    const messageValidation = validateMessage(formData.message);
    if (!messageValidation.valid) {
      toast.error(messageValidation.error || 'Invalid message');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = {
        name: sanitizeText(formData.name),
        email: formData.email ? sanitizeEmail(formData.email) : undefined,
        phone: sanitizePhone(formData.phone),
        message: sanitizeText(formData.message),
        property: propertyName,
      };

      const { requestsService } = await import('@/services/firestore/requests');
      await requestsService.create(sanitizedData);

      try {
        const { emailService } = await import('@/services/emailService');
        await emailService.sendNotification({
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          message: sanitizedData.message,
          type: `Property Enquiry${propertyId ? ` (${propertyId})` : ''}: ${propertyName}`,
        });
      } catch (e) {
        console.error('Enquiry email notification failed:', e);
      }

      toast.success("Enquiry sent successfully! We'll get back to you soon.");
      setFormData({ name: '', email: '', phone: '', message: defaultMessage });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error('Failed to send enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const message = formData.message || defaultMessage;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="shadow-luxury border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold">Contact Me</CardTitle>
        <p className="text-sm text-muted-foreground">Schedule a showing?</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
            <Input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
            <Input
              type="tel"
              placeholder="+254 700 000 000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => window.open(`tel:${AGENT_PHONE}`, '_self')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call +254 700437505
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
              onClick={openWhatsApp}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gradient-gold text-secondary font-semibold h-11"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Sending...' : 'Send Enquiry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyEnquiryCard;
