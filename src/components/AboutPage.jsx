import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, Clock3, MapPin, ShoppingBasket, Smartphone, PackageCheck } from 'lucide-react';
import heroBag from '../assets/about-grocery-bag.png';
import whyIllustration from '../assets/about-why-illustration.png';
import scooter from '/hero-grocery-bag.png';
import './AboutPage.css';

const features = [
  { icon: ShoppingBasket, tone: 'blue', title: 'No Minimum Order', copy: <>Order just one item.<br />No minimum order required.</> },
  { icon: Bike, tone: 'green', title: 'Flat ₹10 Delivery', copy: <>Just ₹10 for delivery<br />on every order.<br />No hidden charges.</> },
  { icon: Clock3, tone: 'purple', title: 'Open Till 2 AM', copy: <>Need something<br />late at night?<br />We’re open till 2 AM.</> },
  { icon: MapPin, tone: 'orange', title: 'Made for Your Area', copy: <>We deliver within 1 km,<br />so your essentials<br />reach you quickly.</> },
];

const steps = [
  { number: '01', tone: 'blue', title: 'Pick what you need', copy: <>Choose your everyday<br />essentials from our store.</>, graphic: 'basket' },
  { number: '02', tone: 'green', title: 'Place your order', copy: <>No minimum order.<br />Order as little as you need.</>, graphic: 'phone' },
  { number: '03', tone: 'purple', title: 'We deliver it', copy: <>Your order will deliver in<br />20-25 min.</>, graphic: 'scooter' },
];

function StepGraphic({ type }) {
  if (type === 'basket') return <div className="ap-step-basket"><ShoppingBasket size={48} /><span className="ap-basket-bottle">▰</span><span className="ap-basket-pack">▰</span></div>;
  if (type === 'phone') return <div className="ap-step-phone"><Smartphone size={66} /><i>●</i><i>●</i><i>●</i><PackageCheck className="ap-phone-check" size={26} /></div>;
  return <img className="ap-step-scooter" src={scooter} alt="Delivery rider on a scooter" />;
}

export default function AboutPage() {
  const navigate = useNavigate();
  const goHome = () => navigate('/');
  return <div className="ap-page">

    <section className="ap-hero">
      <div className="ap-hero-copy"><h1>Need just one<br /><em>item?</em><br />We’ll deliver it.</h1><p>Fewpick is your local store for everyday essentials.<br />Order one item or a full bag. No minimum order,<br /> flat ₹10 rider’s effort, and we’re open till 2 AM.</p><div className="ap-action-row"><button className="ap-dark-button" onClick={goHome}>Explore Essentials <ArrowRight size={17} /></button></div></div>
      <div className="ap-hero-art" aria-label="A bag of grocery essentials"><div className="ap-hero-circle" /><span className="ap-spark ap-spark-one" /><span className="ap-spark ap-spark-two" /><span className="ap-spark ap-spark-three" /><img src={heroBag} alt="Fewpick grocery bag with snacks and water" /><aside className="ap-delivery-card"><div className="ap-delivery-icon"><Bike size={22} /></div><div><small>Delivered in</small><strong>20-25 minutes</strong><p className="ap-card-time">Quick delivery</p></div></aside></div>
    </section>
    <section className="ap-features"><div className="ap-rule-label"><span /> <p>WHAT MAKES US DIFFERENT</p> <span /></div><div className="ap-feature-grid">{features.map(({ icon: Icon, tone, title, copy }) => <article className="ap-feature-card" key={title}><div className={`ap-feature-icon ${tone}`}><Icon size={30} /></div><h2>{title}</h2><p>{copy}</p><i className={tone} /></article>)}</div></section>
    <section className="ap-why"><div className="ap-why-art"><img src={whyIllustration} alt="A shopper thinking about a few essential items" /></div><div className="ap-why-copy"><p className="ap-eyebrow">WHY WE BUILT FEWPICK</p><h2>Sometimes you just<br />need <em>one thing.</em></h2><p>Forgot your chips? Need a cold drink? Running out of milk?</p><p>You shouldn’t have to add ₹100 worth of products just<br /> to place an order.<br /> Most grocery delivery platforms are built around bigger<br /> carts. <b>Fewpick is built for the small things you need <br /> right now.</b></p></div></section>
    <section className="ap-how"><div className="ap-rule-label"><span /> <p>HOW FEWPICK WORKS</p> <span /></div><div className="ap-steps">{steps.map((step, index) => <React.Fragment key={step.number}><article className="ap-step"><b className={step.tone}>{step.number}</b><div className={`ap-step-graphic ${step.tone}`}><StepGraphic type={step.graphic} /></div><h3>{step.title}</h3><p>{step.copy}</p></article>{index < steps.length - 1 && <div className="ap-step-connector"><span /> <ArrowRight size={20} /></div>}</React.Fragment>)}</div></section>
    <div className="ap-cta-simple">
      <button className="ap-dark-button" onClick={goHome}>
        Explore Essentials <ArrowRight size={17} />
      </button>
    </div>
  </div>;
}
