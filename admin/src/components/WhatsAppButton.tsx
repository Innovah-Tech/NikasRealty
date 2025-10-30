import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppButton = () => {
  const phoneNumber = '254710132320';
  const message = encodeURIComponent("Hello, I'd like to inquire about a property.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </a>
  );
};
