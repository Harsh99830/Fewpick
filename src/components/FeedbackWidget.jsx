import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FeedbackWidget({ hasCart = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const modalRef = useRef(null);

  // Lock background scroll & handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Save feedback into Supabase table
      const { error: dbError } = await supabase.from('feedback').insert([
        {
          rating: rating || null,
          message: message,
          email: email || null
        }
      ]);

      if (dbError) {
        console.error('Error saving feedback to Supabase:', dbError.message);
      }

      // 2. Send email notification to solvers.real@gmail.com
      await fetch('https://formsubmit.co/ajax/solvers.real@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `FewPick Feedback ${rating ? `(${rating}/5★)` : ''}`,
          StarRating: rating ? `${rating} / 5` : 'Not rated',
          UserEmail: email || 'Anonymous',
          Message: message,
          SubmittedAt: new Date().toLocaleString()
        })
      });
    } catch (err) {
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setRating(0);
        setMessage('');
        setEmail('');
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Trigger Button - fixed at right-4 */}
      <div className="fixed bottom-4 right-4 z-[990]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/90 hover:bg-black text-white rounded-full shadow-lg backdrop-blur-xs transition-all cursor-pointer border border-white/10 active:scale-95 text-xs font-semibold"
          aria-label="Feedback"
        >
          <MessageSquare size={14} />
          <span>Feedback</span>
        </button>
      </div>

      {/* Simple Feedback Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-black/30 flex items-center justify-center p-4 animate-drop-in">
          <div
            ref={modalRef}
            className="w-full max-w-[360px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 m-0">Send Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            {isSubmitted ? (
              <div className="p-6 text-center flex flex-col items-center justify-center animate-drop-in">
                <CheckCircle2 size={32} className="text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-gray-900 m-0">Feedback Sent!</h4>
                <p className="text-xs text-gray-500 m-0 mt-1">Thank you for helping us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3.5">
                {/* Star Rating */}
                <div className="flex justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 border-none bg-transparent cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={22}
                        className={`transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Message Input */}
                <div>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your feedback or suggestion..."
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-400 rounded-xl p-3 text-xs text-gray-800 outline-none transition-all placeholder:text-gray-400 resize-none font-sans"
                  />
                </div>

                {/* Optional Email Input */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional)"
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-400 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none transition-all placeholder:text-gray-400 font-sans"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 transition-all mt-0.5"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
