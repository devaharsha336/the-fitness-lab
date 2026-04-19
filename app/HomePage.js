import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';
import Marquee from 'react-fast-marquee';
import {
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Dumbbell,
  Flame,
  Heart,
  Zap,
  Bike,
  Star,
  Menu,
  X,
  Send,
  Clock,
  Users,
  Award,
  ArrowRight,
  Lock,
} from 'lucide-react';

// Helper to open external links - bypasses iframe restrictions
function openExternal(url) {
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) {
      // Fallback: navigate top-level window
      window.top.location.href = url;
    }
  };
}

const HERO_BG = "https://customer-assets.emergentagent.com/job_electro-fit/artifacts/4u4ace1v_hero_banner.jpg";

// Intersection observer hook for scroll animations
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = '', delay = '' }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${delay} ${className}`}>
      {children}
    </div>
  );
}

// -- NAVBAR --
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '#classes', label: 'Classes' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="font-heading text-2xl md:text-3xl tracking-tighter text-white" data-testid="nav-logo">
          THE FITNESS<span className="text-[#E6FF00]"> LAB</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm uppercase tracking-[0.15em] text-zinc-400 hover:text-[#E6FF00] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#hero"
            data-testid="nav-join-button"
            className="bg-[#E6FF00] text-black font-bold text-sm uppercase tracking-wider px-6 py-2.5 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(230,255,0,0.3)] transition-all duration-300"
          >
            Join Now
          </a>
          <Link
            to="/login"
            data-testid="nav-owner-login"
            className="flex items-center gap-2 text-sm text-zinc-400 border border-white/10 px-4 py-2.5 hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300"
          >
            <Lock size={14} /> Owner Login
          </Link>
        </div>
        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-4 animate-fade-in">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-base uppercase tracking-wider text-zinc-300 hover:text-[#E6FF00] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#hero"
            className="bg-[#E6FF00] text-black font-bold text-center uppercase tracking-wider px-6 py-3 mt-2"
            onClick={() => setMenuOpen(false)}
          >
            Join Now
          </a>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-zinc-400 border border-white/10 px-6 py-3 hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all"
            onClick={() => setMenuOpen(false)}
          >
            <Lock size={14} /> Owner Login
          </Link>
        </div>
      )}
    </nav>
  );
}

// -- HERO SECTION --
function HeroSection() {
  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-start overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="Gym"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-0 w-full">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-4 animate-fade-in-up opacity-0 delay-100">
            Premium Fitness Experience
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tighter text-white animate-fade-in-up opacity-0 delay-200">
            THE<br />FITNESS<br /><span className="text-[#E6FF00]">LAB</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 mt-6 max-w-md tracking-wide animate-fade-in-up opacity-0 delay-300">
            Where science meets sweat. Transform your body with world-class training, cutting-edge equipment, and relentless discipline.
          </p>
          <div className="flex flex-wrap gap-4 mt-8 animate-fade-in-up opacity-0 delay-400">
            <a
              href="#pricing"
              data-testid="hero-join-button"
              className="bg-[#E6FF00] text-black font-bold text-sm uppercase tracking-wider px-8 py-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(230,255,0,0.3)] transition-all duration-300 flex items-center gap-2"
            >
              Join Now <ArrowRight size={18} />
            </a>
            <a
              href="#classes"
              data-testid="hero-explore-button"
              className="border border-white/20 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300"
            >
              Explore Classes
            </a>
          </div>
        </div>
      </div>
      <a
        href="#classes"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
      >
        <ChevronDown size={32} className="text-[#E6FF00]" />
      </a>
    </section>
  );
}

// -- CLASSES SECTION --
const CLASS_IMAGES = {
  'HIIT': 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/bycf8ui4_cardio_zone.jpg',
  'Strength Training': 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/qsuxmoir_strength_weights.jpg',
  'Yoga': 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/hrdqnswk_full_gym_overview.jpg',
  'Boxing': 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/4u4ace1v_hero_banner.jpg',
  'Cycling': 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/bycf8ui4_cardio_zone.jpg',
};
const CLASS_ICONS = { 'HIIT': Flame, 'Strength Training': Dumbbell, 'Yoga': Heart, 'Boxing': Zap, 'Cycling': Bike };
const DEFAULT_IMG = 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/hrdqnswk_full_gym_overview.jpg';

const GRID_SPANS = [
  'md:col-span-8 md:row-span-1',
  'md:col-span-4 md:row-span-2',
  'md:col-span-4 md:row-span-1',
  'md:col-span-4 md:row-span-1',
  'md:col-span-12 md:row-span-1',
];

function ClassesSection() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    api.getPrograms().then(res => {
      if (res.data && res.data.length > 0) setPrograms(res.data);
    }).catch(() => {});
  }, []);

  return (
    <section id="classes" data-testid="classes-section" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-2">What We Offer</p>
          <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight text-white mb-12">
            Our Programs
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {programs.map((prog, i) => {
            const Icon = CLASS_ICONS[prog.name] || Dumbbell;
            const img = CLASS_IMAGES[prog.name] || DEFAULT_IMG;
            const span = GRID_SPANS[i % GRID_SPANS.length];
            return (
              <RevealSection key={prog.id || prog.name} className={`${span} group`} delay={`delay-${(i + 1) * 100}`}>
                <div className="relative h-64 md:h-full min-h-[250px] overflow-hidden border border-white/5 hover:border-[#E6FF00]/30 transition-all duration-500">
                  <img
                    src={img}
                    alt={prog.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="relative z-10 flex flex-col justify-end h-full p-6">
                    <Icon size={28} className="text-[#E6FF00] mb-2" />
                    <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-white">
                      {prog.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1 max-w-sm">{prog.description}</p>
                    {prog.schedule && (
                      <p className="text-xs text-[#E6FF00]/70 mt-2 uppercase tracking-wider">{prog.schedule}</p>
                    )}
                  </div>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// -- GALLERY SECTION --
const GALLERY_IMAGES = [
  { src: 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/hrdqnswk_full_gym_overview.jpg', label: 'Strength Zone', span: 'md:col-span-7' },
  { src: 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/bycf8ui4_cardio_zone.jpg', label: 'Cardio Zone', span: 'md:col-span-5' },
  { src: 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/qsuxmoir_strength_weights.jpg', label: 'Free Weights', span: 'md:col-span-5' },
  { src: 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/4u4ace1v_hero_banner.jpg', label: 'Training Floor', span: 'md:col-span-7' },
  { src: 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/jgzcwn7v_functional_zone.jpg', label: 'Legs Section', span: 'md:col-span-7' },
  { src: 'https://customer-assets.emergentagent.com/job_electro-fit/artifacts/82jfgc9q_reception_about.jpg', label: 'Reception', span: 'md:col-span-5' },
];

function GallerySection() {
  return (
    <section id="gallery" data-testid="gallery-section" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-2">Take A Look</p>
          <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight text-white">
            Our Facility
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {GALLERY_IMAGES.map((img, i) => (
            <RevealSection key={img.label} className={`${img.span} group`} delay={`delay-${(i + 1) * 100}`}>
              <div className="relative overflow-hidden border border-white/5 hover:border-[#E6FF00]/30 transition-all duration-500">
                <div className={`${img.span === 'md:col-span-12' ? 'h-64 md:h-80' : 'h-64 md:h-72'} overflow-hidden`}>
                  <img
                    src={img.src}
                    alt={img.label}
                    data-testid={`gallery-image-${i}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-heading text-lg uppercase text-[#E6FF00]">{img.label}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- PRICING SECTION --
const FALLBACK_PLANS = [
  { name: 'Individual', monthly: 2500, quarterly: 6500, half_yearly: 10500, yearly: 15000, badge: null },
  { name: 'Couple', monthly: 4500, quarterly: 11000, half_yearly: 18000, yearly: 30000, badge: 'Best Price' },
  { name: 'Gold Personal Training', monthly: 7000, quarterly: 20000, half_yearly: 38000, yearly: 70000, badge: 'Best Price' },
  { name: 'Platinum Personal Training', monthly: 15000, quarterly: 40000, half_yearly: 75000, yearly: 120000, badge: 'Best Price' },
];

function formatINR(num) {
  return num.toLocaleString('en-IN');
}

function PricingSection() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    api.getPricing().then(res => {
      if (res.data && res.data.length > 0) setPlans(res.data);
    }).catch(() => {});
  }, []);

  const durations = [
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'half_yearly', label: 'Half-Yearly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  return (
    <section id="pricing" data-testid="pricing-section" className="py-24 md:py-32 px-6 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <RevealSection className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-2">Membership Plans</p>
          <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight text-white">
            Our Packages
          </h2>
        </RevealSection>

        {/* Desktop Table */}
        <RevealSection>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" data-testid="pricing-table">
              <thead>
                <tr className="border-b-2 border-[#E6FF00]/30">
                  <th className="text-left py-4 px-4">
                    <span className="font-heading text-xl uppercase text-[#E6FF00]">Packages</span>
                  </th>
                  {durations.map(d => (
                    <th key={d.key} className="text-center py-4 px-4">
                      <span className="font-heading text-lg uppercase text-[#E6FF00]">{d.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, i) => (
                  <tr
                    key={plan.name}
                    data-testid={`pricing-row-${i}`}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-base">{plan.name}</span>
                        {plan.badge && (
                          <span className="text-[10px] uppercase tracking-wider text-[#E6FF00] mt-1">{plan.badge}</span>
                        )}
                      </div>
                    </td>
                    {durations.map(d => (
                      <td key={d.key} className="py-5 px-4 text-center">
                        <span className="text-white text-base font-medium">&#8377; {formatINR(plan[d.key])}/-</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                data-testid={`pricing-card-${i}`}
                className="bg-[#121212] border border-white/5 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-base">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] uppercase tracking-wider bg-[#E6FF00] text-black px-2 py-0.5 font-bold">{plan.badge}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {durations.map(d => (
                    <div key={d.key} className="bg-[#0A0A0A] border border-white/5 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{d.label}</p>
                      <p className="text-white font-medium">&#8377; {formatINR(plan[d.key])}/-</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection delay="delay-200" className="text-center mt-12">
          <button
            onClick={openExternal(SOCIAL_LINKS.whatsappCTA)}
            data-testid="pricing-book-now"
            className="inline-flex items-center gap-2 bg-[#E6FF00] text-black font-bold text-sm uppercase tracking-wider px-10 py-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(230,255,0,0.3)] transition-all duration-300 cursor-pointer"
          >
            Book Now <ArrowRight size={18} />
          </button>
        </RevealSection>
      </div>
    </section>
  );
}

// -- TRAINERS SECTION --
const TRAINERS = [
  {
    name: 'Coach Vikram',
    role: 'HIIT & Conditioning',
    img: 'https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    exp: '8+ years',
  },
  {
    name: 'Coach Priya',
    role: 'Strength & Powerlifting',
    img: 'https://images.unsplash.com/photo-1754475118668-64ac3f3b2559?w=600&q=80',
    exp: '6+ years',
  },
  {
    name: 'Coach Meera',
    role: 'Yoga & Mindfulness',
    img: 'https://images.pexels.com/photos/136409/pexels-photo-136409.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    exp: '10+ years',
  },
  {
    name: 'Coach Arjun',
    role: 'Boxing & MMA',
    img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80',
    exp: '7+ years',
  },
];

function TrainersSection() {
  return (
    <section id="trainers" data-testid="trainers-section" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-2">Expert Guidance</p>
          <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight text-white mb-12">
            Meet Our Trainers
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRAINERS.map((t, i) => (
            <RevealSection key={t.name} delay={`delay-${(i + 1) * 100}`}>
              <div
                data-testid={`trainer-card-${i}`}
                className="group relative overflow-hidden border border-white/5 hover:border-[#E6FF00]/30 transition-all duration-500"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#E6FF00] mb-1">{t.exp}</p>
                  <h3 className="font-heading text-xl uppercase text-white">{t.name}</h3>
                  <p className="text-sm text-zinc-400">{t.role}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- TESTIMONIALS --
const TESTIMONIALS = [
  { name: 'Rahul S.', text: 'The Fitness Lab changed my life. Lost 15kg in 4 months with their HIIT program!', plan: 'Elite Member' },
  { name: 'Anjali M.', text: 'Best trainers in the city. Coach Priya\'s strength program is incredible.', plan: 'Pro Member' },
  { name: 'Dev K.', text: 'The vibe here is unmatched. Clean facility, amazing equipment, and supportive community.', plan: 'Elite Member' },
  { name: 'Sneha R.', text: 'Yoga sessions with Coach Meera are the highlight of my week. Truly transformative.', plan: 'Pro Member' },
  { name: 'Arjun P.', text: 'Boxing fundamentals class is absolutely killer. Best cardio workout I\'ve ever had.', plan: 'Basic Member' },
  { name: 'Kavya T.', text: 'Worth every rupee. The Elite plan gives you access to everything you need.', plan: 'Elite Member' },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" data-testid="testimonials-section" className="py-24 md:py-32 overflow-hidden bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <RevealSection>
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-2">What They Say</p>
          <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight text-white">
            Testimonials
          </h2>
        </RevealSection>
      </div>
      {/* Background outline text */}
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none select-none overflow-hidden">
          <p className="font-heading text-[8rem] md:text-[12rem] uppercase text-white/[0.02] whitespace-nowrap tracking-tighter leading-none">
            RESULTS SPEAK LOUDER RESULTS SPEAK LOUDER
          </p>
        </div>
        <Marquee gradient={false} speed={40} pauseOnHover className="py-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              data-testid={`testimonial-card-${i}`}
              className="mx-3 w-[320px] bg-[#121212] border border-white/5 p-6 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={`star-${j}`} size={14} className="text-[#E6FF00] fill-[#E6FF00]" />
                ))}
              </div>
              <p className="text-sm text-zinc-300 flex-1 leading-relaxed">"{t.text}"</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-[#E6FF00] uppercase tracking-wider">{t.plan}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

// -- CONTACT SECTION --
function ContactSection() {
  return (
    <section id="contact" data-testid="contact-section" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="text-xs uppercase tracking-[0.3em] text-[#E6FF00] mb-2">Get In Touch</p>
          <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight text-white mb-12">
            Contact Us
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <RevealSection>
            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-xl uppercase text-white mb-4">Visit Us</h3>
                <div className="space-y-3">
                  <button
                    onClick={openExternal(SOCIAL_LINKS.location)}
                    className="flex items-start gap-3 group cursor-pointer text-left"
                  >
                    <MapPin size={18} className="text-[#E6FF00] mt-0.5 shrink-0" />
                    <p className="text-zinc-400 text-sm group-hover:text-[#E6FF00] transition-colors">
                      PVSR Palace, 3rd & 4th Floor,<br />
                      Sri Ram Nagar Colony,<br />
                      Golden Temple Rd, Manikonda
                    </p>
                  </button>
                  <button
                    onClick={openExternal(SOCIAL_LINKS.whatsapp)}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <Phone size={18} className="text-[#E6FF00] shrink-0" />
                    <p className="text-zinc-400 text-sm group-hover:text-[#E6FF00] transition-colors">+91 99122 23125</p>
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-xl uppercase text-white mb-4">Hours</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[#E6FF00] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-zinc-300 font-medium mb-1">Mon - Sat</p>
                      <p>Morning: 5:30 AM - 12:00 PM</p>
                      <p>Evening: 5:00 PM - 10:00 PM</p>
                      <p className="text-sm text-zinc-300 font-medium mt-2 mb-1">Sunday</p>
                      <p>Morning: 6:00 AM - 10:00 AM</p>
                      <p>Evening: 5:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={openExternal(SOCIAL_LINKS.instagram)}
                  data-testid="contact-instagram"
                  className="w-12 h-12 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300 text-zinc-400 cursor-pointer"
                >
                  <Instagram size={20} />
                </button>
                <button
                  onClick={openExternal(SOCIAL_LINKS.facebook)}
                  data-testid="contact-facebook"
                  className="w-12 h-12 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300 text-zinc-400 cursor-pointer"
                >
                  <Facebook size={20} />
                </button>
                <button
                  onClick={openExternal(SOCIAL_LINKS.whatsapp)}
                  data-testid="contact-whatsapp"
                  className="w-12 h-12 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300 text-zinc-400 cursor-pointer"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={openExternal(SOCIAL_LINKS.location)}
                  data-testid="contact-location"
                  className="w-12 h-12 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300 text-zinc-400 cursor-pointer"
                >
                  <MapPin size={20} />
                </button>
              </div>
            </div>
          </RevealSection>

          {/* WhatsApp CTA */}
          <RevealSection delay="delay-200">
            <div className="bg-[#121212] border border-white/5 p-8 flex flex-col items-center justify-center text-center h-full">
              <MessageCircle size={48} className="text-[#E6FF00] mb-6" />
              <h3 className="font-heading text-2xl uppercase text-white mb-3">Start Your Fitness Journey</h3>
              <p className="text-sm text-zinc-400 mb-8 max-w-sm">
                Have questions about our packages or want to book a session? Reach out to us directly on WhatsApp.
              </p>
              <a
                href="https://wa.me/919912223125?text=Hi%2C%20I%27m%20interested%20in%20joining%20The%20Fitness%20Lab"
                rel="noopener noreferrer" target="_blank"
                data-testid="contact-whatsapp-cta"
                className="bg-[#E6FF00] text-black font-bold text-sm uppercase tracking-wider px-10 py-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(230,255,0,0.3)] transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
              <p className="text-xs text-zinc-600 mt-4">+91 99122 23125</p>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

// -- FLOATING QUICK LINKS --
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/thefitnesslabgym?utm_source=qr&igsh=MWRwc3ljbXV2eHN1ZA==',
  facebook: 'https://www.facebook.com/share/14atX1FapyC/',
  whatsapp: 'https://wa.me/919912223125',
  location: 'https://share.google/HdkgsfHTe9xOIv1ze',
  whatsappCTA: 'https://wa.me/919912223125?text=Hi%2C%20I%27m%20interested%20in%20joining%20The%20Fitness%20Lab',
};

function FloatingQuickLinks() {
  return (
    <div
      data-testid="floating-quick-links"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/60 backdrop-blur-2xl border border-white/10 px-4 py-2.5 flex items-center gap-3 shadow-2xl"
    >
      <button onClick={openExternal(SOCIAL_LINKS.instagram)} data-testid="quick-instagram" className="text-zinc-400 hover:text-[#E6FF00] transition-colors cursor-pointer" title="Instagram">
        <Instagram size={20} />
      </button>
      <button onClick={openExternal(SOCIAL_LINKS.facebook)} data-testid="quick-facebook" className="text-zinc-400 hover:text-[#E6FF00] transition-colors cursor-pointer" title="Facebook">
        <Facebook size={20} />
      </button>
      <button onClick={openExternal(SOCIAL_LINKS.whatsapp)} data-testid="quick-whatsapp" className="text-zinc-400 hover:text-[#E6FF00] transition-colors cursor-pointer" title="WhatsApp">
        <MessageCircle size={20} />
      </button>
      <button onClick={openExternal(SOCIAL_LINKS.location)} data-testid="quick-location" className="text-zinc-400 hover:text-[#E6FF00] transition-colors cursor-pointer" title="Location">
        <MapPin size={20} />
      </button>
    </div>
  );
}

// -- FOOTER --
function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#080808] border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-tighter text-white">
              THE FITNESS<span className="text-[#E6FF00]"> LAB</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-4 max-w-sm">
              Where science meets sweat. Premium fitness experience in the heart of Hyderabad.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#classes" className="block text-sm text-zinc-400 hover:text-[#E6FF00] transition-colors">Classes</a>
              <a href="#gallery" className="block text-sm text-zinc-400 hover:text-[#E6FF00] transition-colors">Gallery</a>
              <a href="#pricing" className="block text-sm text-zinc-400 hover:text-[#E6FF00] transition-colors">Pricing</a>
              <a href="#contact" className="block text-sm text-zinc-400 hover:text-[#E6FF00] transition-colors">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Connect</h4>
            <div className="flex gap-3 mb-6">
              <button onClick={openExternal(SOCIAL_LINKS.instagram)} data-testid="footer-instagram" className="w-10 h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all text-zinc-400 cursor-pointer">
                <Instagram size={16} />
              </button>
              <button onClick={openExternal(SOCIAL_LINKS.facebook)} data-testid="footer-facebook" className="w-10 h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all text-zinc-400 cursor-pointer">
                <Facebook size={16} />
              </button>
              <button onClick={openExternal(SOCIAL_LINKS.whatsapp)} data-testid="footer-whatsapp" className="w-10 h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all text-zinc-400 cursor-pointer">
                <MessageCircle size={16} />
              </button>
              <button onClick={openExternal(SOCIAL_LINKS.location)} data-testid="footer-location" className="w-10 h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all text-zinc-400 cursor-pointer">
                <MapPin size={16} />
              </button>
            </div>
            <div className="space-y-1 text-sm text-zinc-500">
              <p>+91 99122 23125</p>
              <p className="text-xs mt-2">PVSR Palace, 3rd & 4th Floor,<br/>Sri Ram Nagar Colony,<br/>Golden Temple Rd, Manikonda</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">&copy; 2026 The Fitness Lab. All rights reserved.</p>
          <Link
            to="/login"
            data-testid="footer-owner-login"
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 border border-white/10 px-4 py-2 hover:border-[#E6FF00] hover:text-[#E6FF00] transition-all duration-300"
          >
            <Lock size={12} /> Owner Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

// -- MAIN PAGE --
export default function HomePage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <Navbar />
      <HeroSection />
      <ClassesSection />
      <GallerySection />
      <PricingSection />
      <ContactSection />
      <Footer />
      <FloatingQuickLinks />
    </div>
  );
}
