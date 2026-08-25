import React from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Share2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ReferEarnPage.css';

export default function ReferEarnPage() {
  const navigate = useNavigate();

  const whatsappNumber = "919719214408";
  const shareText = "Hey! Order snacks & essentials on FewPick 🚀 No small cart fees & open till 2 AM!";
  const whatsappClaimText = encodeURIComponent("Hi FewPick! My friend just placed an order. Here is their name to claim my free ₹20 item: ");
  const whatsappClaimUrl = `https://wa.me/${whatsappNumber}?text=${whatsappClaimText}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\nCheck it out here: " + window.location.origin)}`;

  return (
    <div className="refer-page-wrapper">
      {/* Top Header */}
      <div className="refer-nav-bar">
        <button onClick={() => navigate('/')} className="refer-back-btn">
          <ArrowLeft size={18} />
        </button>
        <span className="refer-nav-title">Referral Reward</span>
        <div className="refer-header-spacer" />
      </div>

      {/* Main Premium Card / Voucher Ticket */}
      <div className="refer-hero-ticket">
        <div className="ticket-glow-bg" />

        {/* Big Amount & Title */}
        <div className="ticket-main-content">
          <div className="amount-display">
            <span className="currency">₹</span>
            <span className="amount">20</span>
            <span className="tag">FREE ITEM</span>
          </div>
          <h2 className="ticket-heading">Get Free ₹20 Item On Your Next Order</h2>
          <p className="ticket-subtext">
            Refer a new friend &amp; get a free ₹20 item on their 1st order!
          </p>
        </div>

        {/* Ticket Cutout Line */}
        <div className="ticket-divider">
          <div className="notch left-notch" />
          <div className="dashed-line" />
          <div className="notch right-notch" />
        </div>

        {/* Quick Share Action Inside Ticket */}
        <div className="ticket-bottom">
          <span className="share-label">Share FewPick with Friends:</span>
          <div className="share-btn-group">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ticket-share-wa"
            >
              <Share2 size={15} />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3-Step Process */}
      <div className="process-card">
        <h3 className="process-heading">
          <span>How It Works</span>
        </h3>

        <div className="timeline-container">
          <div className="timeline-item">
            <div className="timeline-node">1</div>
            <div className="timeline-info">
              <h4>New Friend Places 1st Order</h4>
              <p>Your friend places their first order on FewPick.</p>
            </div>
          </div>

          <div className="timeline-line" />

          <div className="timeline-item active-node">
            <div className="timeline-node highlight">
              <MessageCircle size={14} />
            </div>
            <div className="timeline-info">
              <div className="step-title-row">
                <h4>Send Us Their Name</h4>
                <span className="verify-badge">WhatsApp</span>
              </div>
              <p>
                WhatsApp us your friend's name after they order.
              </p>
            </div>
          </div>

          <div className="timeline-line" />

          <div className="timeline-item">
            <div className="timeline-node">3</div>
            <div className="timeline-info">
              <h4>Get Free ₹20 Item</h4>
              <p>We will add a free ₹20 item to your next order.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary WhatsApp CTA */}
      <div className="cta-wrapper">
        <a
          href={whatsappClaimUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="main-whatsapp-claim-btn"
        >
          <MessageCircle size={20} />
          <span>Message Us on WhatsApp</span>
          <ArrowRight size={18} />
        </a>

        <div className="guarantee-row">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Instant verification on WhatsApp</span>
        </div>
      </div>
    </div>
  );
}
