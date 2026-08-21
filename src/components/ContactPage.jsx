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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email</span>
            <a href="mailto:dhruv.bairagi27@gmail.com" className="font-extrabold text-gray-900 no-underline hover:underline text-xs break-all block">
              dhruv.bairagi27@gmail.com
            </a>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Instagram</span>
            <a href="https://instagram.com/bairagi_dhruv_" target="_blank" rel="noreferrer" className="font-extrabold text-pink-600 no-underline hover:underline flex items-center gap-1.5 text-xs break-all">
              <svg className="w-4 h-4 text-pink-600 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>bairagi_dhruv_</span>
            </a>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">WhatsApp / Phone</span>
            <div className="flex flex-col gap-0.5">
              <a href="https://wa.me/919719214408" target="_blank" rel="noreferrer" className="font-extrabold text-gray-900 no-underline hover:underline text-xs">
                +91 97192 14408
              </a>
              <a href="https://wa.me/917440561006" target="_blank" rel="noreferrer" className="font-bold text-gray-700 no-underline hover:underline text-xs">
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
