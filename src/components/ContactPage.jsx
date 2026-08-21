import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    try {
      // Send email directly to dhruv.bairagi27@gmail.com via FormSubmit AJAX endpoint
      await fetch('https://formsubmit.co/ajax/dhruv.bairagi27@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `FewPick Inquiry: ${formData.subject || 'New Message'}`,
          Name: formData.name,
          Contact: formData.email,
          Subject: formData.subject || 'General Inquiry',
          Message: formData.message
        })
      });
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="w-full max-w-[540px] mx-auto py-4 px-3 sm:px-4 animate-drop-in pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer border-none flex items-center justify-center transition-colors"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 m-0">Contact Us</h1>
          <p className="text-xs text-gray-400 font-medium m-0">Get in touch with the FewPick team</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
        {/* Contact Info Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email</span>
            <a href="mailto:dhruv.bairagi27@gmail.com" className="font-bold text-gray-900 no-underline hover:underline">
              dhruv.bairagi27@gmail.com
            </a>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">WhatsApp / Phone</span>
            <div className="flex flex-col gap-0.5">
              <a href="https://wa.me/919719214408" target="_blank" rel="noreferrer" className="font-bold text-gray-900 no-underline hover:underline">
                +91 97192 14408
              </a>
              <a href="https://wa.me/917440561006" target="_blank" rel="noreferrer" className="font-bold text-gray-900 no-underline hover:underline">
                +91 74405 61006
              </a>
            </div>
          </div>
        </div>

        {/* Form or Confirmation */}
        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center animate-drop-in">
            <CheckCircle2 size={40} className="text-green-600 mb-2.5" />
            <h3 className="text-base font-black text-gray-900 m-0 mb-1">Message Sent!</h3>
            <p className="text-xs text-gray-500 max-w-[280px] mb-6 leading-relaxed">
              Your message has been sent to <span className="font-semibold text-gray-800">dhruv.bairagi27@gmail.com</span>. We will reply as soon as possible.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer border-none transition-all"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Email or Phone</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="How should we contact you back?"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Order query, Feedback, Product request"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Message</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-gray-900 transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none shadow-sm mt-1 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
