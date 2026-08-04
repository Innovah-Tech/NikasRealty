import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/config/constants';
import { sanitizeText, sanitizePhone } from '@/utils/sanitize';
import { validateName, validatePhone } from '@/utils/validate';

interface PropertyEnquiryCardProps {
  propertyName?: string;
  propertyId?: string;
}

const PropertyEnquiryCard = ({ propertyName, propertyId }: PropertyEnquiryCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyUse: '',
    budget: '',
    dateTime: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      toast.error(nameValidation.error || 'Please enter a valid name');
      return;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedName = sanitizeText(formData.name);
      const sanitizedPhone = sanitizePhone(formData.phone);
      const sanitizedPropertyUse = sanitizeText(formData.propertyUse);
      const sanitizedBudget = sanitizeText(formData.budget);
      const sanitizedMessage = sanitizeText(formData.message);

      // Save to database
      try {
        const { requestsService } = await import('@/services/firestore/requests');
        await requestsService.create({
          name: sanitizedName,
          phone: sanitizedPhone,
          message: [
            sanitizedPropertyUse ? `Property Use: ${sanitizedPropertyUse}` : '',
            sanitizedBudget ? `Budget: ${sanitizedBudget}` : '',
            formData.dateTime ? `Preferred Showing Date & Time: ${formData.dateTime}` : '',
            sanitizedMessage ? `Notes: ${sanitizedMessage}` : '',
          ].filter(Boolean).join('\n'),
          property: propertyName || 'General Showing Request',
        });

        const { emailService } = await import('@/services/emailService');
        await emailService.sendNotification({
          name: sanitizedName,
          phone: sanitizedPhone,
          message: `Property Use: ${sanitizedPropertyUse || 'N/A'}\nBudget: ${sanitizedBudget || 'N/A'}\nShowing Date & Time: ${formData.dateTime || 'N/A'}\nNotes: ${sanitizedMessage || 'N/A'}`,
          type: `Showing Request${propertyId ? ` (${propertyId})` : ''}${propertyName ? `: ${propertyName}` : ''}`,
        });
      } catch (dbErr) {
        console.error('Error logging showing request to database:', dbErr);
      }

      // Format WhatsApp message
      const formattedDate = formData.dateTime
        ? new Date(formData.dateTime).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      const lines = [
        `*REQUEST A SHOWING*`,
        propertyName ? `*Property:* ${propertyName}` : null,
        `*Name:* ${sanitizedName}`,
        `*Phone:* ${sanitizedPhone}`,
        sanitizedPropertyUse ? `*Property Use:* ${sanitizedPropertyUse}` : null,
        sanitizedBudget ? `*Budget:* ${sanitizedBudget}` : null,
        formattedDate ? `*Preferred Date & Time:* ${formattedDate}` : null,
        sanitizedMessage ? `*Instructions:* ${sanitizedMessage}` : null,
      ].filter(Boolean);

      const whatsappText = encodeURIComponent(lines.join('\n'));
      window.open(`${APP_CONFIG.whatsappUrl}?text=${whatsappText}`, '_blank');

      toast.success('Showing request prepared! Opening WhatsApp...');
    } catch (err) {
      console.error('Error submitting showing request:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallClick = () => {
    window.open(`tel:${APP_CONFIG.phone}`, '_self');
  };

  return (
    <div className="bg-[#054932] rounded-3xl p-6 sm:p-7 shadow-2xl text-white font-montserrat max-w-md mx-auto transition-all duration-300">
      {/* Header Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
        Request A Showing
      </h2>
      <p className="text-xs sm:text-sm font-normal text-emerald-100/90 leading-relaxed mb-6">
        Click the button below to open the viewing form. Your enquiry will be prepared directly for WhatsApp.
      </p>

      {/* Main Action Button (Toggles Form) */}
      <button
        type="button"
        onClick={() => setShowForm((prev) => !prev)}
        className={`w-full font-extrabold text-sm sm:text-base tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-300 shadow-md cursor-pointer mb-3 flex items-center justify-center ${
          showForm
            ? 'bg-[#c23866] hover:bg-[#b02f58] text-white'
            : 'bg-white hover:bg-emerald-50 text-[#054932]'
        }`}
      >
        REQUEST A SHOWING
      </button>

      {/* Form Section (Revealed on Click) */}
      {showForm && (
        <form onSubmit={handleWhatsAppSubmit} className="space-y-3 mt-4 mb-3">
          {/* Your Name */}
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
            />
          </div>

          {/* Phone Number */}
          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
            />
          </div>

          {/* Property Use Dropdown */}
          <div>
            <select
              value={formData.propertyUse}
              onChange={(e) => setFormData({ ...formData, propertyUse: e.target.value })}
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer invalid:text-gray-400"
            >
              <option value="" disabled className="text-gray-400">
                Property Use
              </option>
              <option value="Residential" className="text-gray-900">Residential</option>
              <option value="Commercial" className="text-gray-900">Commercial</option>
              <option value="Investment" className="text-gray-900">Investment</option>
              <option value="Land / Plot" className="text-gray-900">Land / Plot</option>
              <option value="Vacation / Shortlet" className="text-gray-900">Vacation / Shortlet</option>
              <option value="Other" className="text-gray-900">Other</option>
            </select>
          </div>

          {/* Budget / Price Range */}
          <div>
            <input
              type="text"
              placeholder="Budget / Price Range"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
            />
          </div>

          {/* Date & Time Picker showing both Day and Time */}
          <div>
            <input
              type="datetime-local"
              placeholder="mm/dd/yyyy --:-- --"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer"
            />
          </div>

          {/* Message / preferred viewing instructions */}
          <div>
            <textarea
              placeholder="Message / preferred viewing instructions"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl p-4 border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
            />
          </div>

          {/* Send Enquiry on WhatsApp Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#22c55e] hover:bg-[#1fb858] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5 fill-white/20" />
            {isSubmitting ? 'PREPARING...' : 'SEND ENQUIRY ON WHATSAPP'}
          </button>
        </form>
      )}

      {/* Secondary Call Button */}
      <button
        type="button"
        onClick={handleCallClick}
        className="w-full bg-[#054932]/80 border border-white/25 hover:bg-white/10 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        <Phone className="w-4 h-4" />
        CALL NIKAS REALTY
      </button>
    </div>
  );
};

export default PropertyEnquiryCard;

