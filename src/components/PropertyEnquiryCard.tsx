import { useState, useMemo } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { APP_CONFIG, THEME_CONFIG } from '@/config/constants';
import { sanitizeText, sanitizePhone } from '@/utils/sanitize';
import { validateName, validatePhone } from '@/utils/validate';

interface PropertyEnquiryCardProps {
  propertyName?: string;
  propertyId?: string;
}

const TIME_OPTIONS = [
  'Morning (9:00 AM - 12:00 PM)',
  'Early Afternoon (12:00 PM - 3:00 PM)',
  'Late Afternoon (3:00 PM - 6:00 PM)',
  'Evening (6:00 PM - 8:00 PM)',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

const PropertyEnquiryCard = ({ propertyName, propertyId }: PropertyEnquiryCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyUse: '',
    budget: '',
    selectedDay: '',
    selectedTime: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate dynamic day options for the next 14 days + flexible option
  const dayOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const label =
        i === 0
          ? `Today (${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`
          : i === 1
          ? `Tomorrow (${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`
          : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const value = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      options.push({ value, label });
    }
    options.push({ value: 'Flexible / Any Day', label: 'Flexible / Any Day' });
    return options;
  }, []);

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
      const showingDateTime = [formData.selectedDay, formData.selectedTime].filter(Boolean).join(' at ');

      // Save to database
      try {
        const { requestsService } = await import('@/services/firestore/requests');
        await requestsService.create({
          name: sanitizedName,
          phone: sanitizedPhone,
          message: [
            sanitizedPropertyUse ? `Property Use: ${sanitizedPropertyUse}` : '',
            sanitizedBudget ? `Budget: ${sanitizedBudget}` : '',
            showingDateTime ? `Preferred Day & Time: ${showingDateTime}` : '',
            sanitizedMessage ? `Notes: ${sanitizedMessage}` : '',
          ].filter(Boolean).join('\n'),
          property: propertyName || 'General Showing Request',
        });

        const { emailService } = await import('@/services/emailService');
        await emailService.sendNotification({
          name: sanitizedName,
          phone: sanitizedPhone,
          message: `Property Use: ${sanitizedPropertyUse || 'N/A'}\nBudget: ${sanitizedBudget || 'N/A'}\nShowing Day & Time: ${showingDateTime || 'N/A'}\nNotes: ${sanitizedMessage || 'N/A'}`,
          type: `Showing Request${propertyId ? ` (${propertyId})` : ''}${propertyName ? `: ${propertyName}` : ''}`,
        });
      } catch (dbErr) {
        console.error('Error logging showing request to database:', dbErr);
      }

      // Format WhatsApp message
      const propertyUrl = propertyId
        ? `${window.location.origin}/properties/${propertyId}`
        : null;

      const lines = [
        `*REQUEST A SHOWING*`,
        propertyName ? `*Property:* ${propertyName}` : null,
        propertyUrl ? `*Property Link:* ${propertyUrl}` : null,
        `*Name:* ${sanitizedName}`,
        `*Phone:* ${sanitizedPhone}`,
        sanitizedPropertyUse ? `*Property Use:* ${sanitizedPropertyUse}` : null,
        sanitizedBudget ? `*Budget:* ${sanitizedBudget}` : null,
        showingDateTime ? `*Preferred Date & Time:* ${showingDateTime}` : null,
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
    <div className="bg-[#141416] rounded-3xl p-6 sm:p-7 shadow-2xl text-white font-montserrat max-w-md mx-auto transition-all duration-300 border border-[#DA9100]/40">
      {/* Header Title & Subtitle */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Request A Showing
        </h2>
        <div className="w-3 h-3 rounded-full bg-[#DA9100] shadow-[0_0_10px_#DA9100]" />
      </div>
      <p className="text-xs sm:text-sm font-normal text-stone-300 leading-relaxed mb-6">
        Click the button below to open the viewing form. Your enquiry will be prepared directly for WhatsApp.
      </p>

      {/* Main Action Button (Toggles Form using Nikas Realty Gold) */}
      <button
        type="button"
        onClick={() => setShowForm((prev) => !prev)}
        style={
          showForm
            ? { background: THEME_CONFIG.gradientGold, color: '#1c1917' }
            : {}
        }
        className={`w-full font-extrabold text-sm sm:text-base tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-300 shadow-md cursor-pointer mb-3 flex items-center justify-center ${
          showForm
            ? 'shadow-luxury text-stone-950 border border-[#DA9100]'
            : 'bg-white hover:bg-stone-100 text-stone-900'
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
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all"
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
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all"
            />
          </div>

          {/* Property Use Dropdown */}
          <div>
            <select
              value={formData.propertyUse}
              onChange={(e) => setFormData({ ...formData, propertyUse: e.target.value })}
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all cursor-pointer"
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
              className="w-full h-12 bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl px-4 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all"
            />
          </div>

          {/* Day & Time Selection via Dropdown Menus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Preferred Day Dropdown */}
            <div>
              <select
                value={formData.selectedDay}
                onChange={(e) => setFormData({ ...formData, selectedDay: e.target.value })}
                className="w-full h-12 bg-[#f4f6f4] text-gray-900 font-medium text-sm rounded-xl px-3 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all cursor-pointer"
              >
                <option value="" disabled className="text-gray-400">
                  Select Day
                </option>
                {dayOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Time Dropdown */}
            <div>
              <select
                value={formData.selectedTime}
                onChange={(e) => setFormData({ ...formData, selectedTime: e.target.value })}
                className="w-full h-12 bg-[#f4f6f4] text-gray-900 font-medium text-sm rounded-xl px-3 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all cursor-pointer"
              >
                <option value="" disabled className="text-gray-400">
                  Select Time
                </option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t} className="text-gray-900">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message / preferred viewing instructions */}
          <div>
            <textarea
              placeholder="Message / preferred viewing instructions"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full bg-[#f4f6f4] text-gray-900 placeholder:text-gray-400 font-medium text-sm rounded-xl p-4 border-none focus:outline-none focus:ring-2 focus:ring-[#DA9100] transition-all resize-none"
            />
          </div>

          {/* Send Enquiry on WhatsApp Button (Nikas Realty Gold Gradient) */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ background: THEME_CONFIG.gradientGold }}
            className="w-full hover:brightness-105 text-stone-950 font-extrabold text-sm sm:text-base tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-200 shadow-luxury cursor-pointer flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5 fill-stone-950/20" />
            {isSubmitting ? 'PREPARING...' : 'SEND ENQUIRY ON WHATSAPP'}
          </button>
        </form>
      )}

      {/* Secondary Call Button */}
      <button
        type="button"
        onClick={handleCallClick}
        className="w-full bg-stone-900/90 border border-[#DA9100]/60 hover:bg-[#DA9100]/20 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        <Phone className="w-4 h-4 text-[#DA9100]" />
        CALL NIKAS REALTY
      </button>
    </div>
  );
};

export default PropertyEnquiryCard;



