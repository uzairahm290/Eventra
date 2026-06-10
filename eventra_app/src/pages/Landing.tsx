import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, cubicBezier, useScroll, useTransform, useInView } from 'framer-motion';
import {
  FiArrowRight, FiCheckCircle, FiShield, FiBarChart2, FiUsers,
  FiGrid, FiUserCheck, FiBook, FiClipboard, FiDownload, FiMapPin,
} from 'react-icons/fi';

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = '', children }) => (
  <section id={id} className={`relative py-20 md:py-28 ${className}`}>
    <div className="container mx-auto px-6 md:px-8 max-w-7xl">{children}</div>
  </section>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-primary-50 text-primary-700' }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color} ring-1 ring-inset ring-primary-200`}>{children}</span>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>
);

const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1);
const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

const GradientBG = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(59,130,246,0.10),transparent_60%),radial-gradient(900px_500px_at_10%_110%,rgba(6,182,212,0.12),transparent_60%)]" />
    <motion.div
      className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: easeInOut }}
    />
    <motion.div
      className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: easeInOut, delay: 1 }}
    />
  </div>
);

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: easeOutExpo },
};

// ── Animated count-up number ──────────────────────────────────────────────────
const CountUp: React.FC<{ to: number; suffix?: string; prefix?: string }> = ({ to, suffix = '', prefix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));
      if (progress >= 1) { setCount(to); clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, to]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-PK')}{suffix}</span>;
};

// ── Sticky TopNav with scroll-based blur intensification ──────────────────────
const TopNav = () => {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.97)']);
  const shadow = useTransform(scrollY, [0, 80], ['0 0 0 rgba(0,0,0,0)', '0 4px 24px rgba(0,0,0,0.09)']);

  return (
    <div className="fixed inset-x-0 top-0 z-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          style={{ background: bg, boxShadow: shadow }}
          className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200/70 backdrop-blur-lg px-4 py-3"
        >
          <Link to="/" className="text-lg font-extrabold text-gray-900">Eventra</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition">How It Works</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden md:inline-flex rounded-xl px-4 py-2 font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition">Login</Link>
            <Link to="/register" className="inline-flex rounded-xl px-4 py-2 font-semibold text-white bg-primary-600 hover:bg-primary-700 transition">Get Started</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero = () => (
  <Section className="pt-28 md:pt-36 bg-linear-to-tr from-white to-cyan-50">
    <GradientBG />
    <div className="text-center">
      <motion.div {...fadeUp}>
        <Pill>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          Built for Marquee &amp; Wedding Hall businesses in Pakistan
        </Pill>
      </motion.div>
      <motion.h1
        className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
      >
        The complete OS for<br className="hidden md:block" />
        <span className="text-primary-600"> Marquee Management</span>
      </motion.h1>
      <motion.p
        className="mt-5 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
      >
        Manage bookings, halls, staff, and menus from one beautiful dashboard — built specifically
        for Pakistani marquee and wedding hall businesses.
      </motion.p>
      <motion.div
        className="mt-8 flex items-center justify-center gap-3 flex-wrap"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
      >
        <Link
          to="/register"
          className="inline-flex items-center rounded-xl bg-primary-600 px-6 py-3.5 text-white font-semibold shadow hover:bg-primary-700 transition will-change-transform hover:scale-[1.02]"
        >
          Start Managing Free <FiArrowRight className="ml-2" />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center rounded-xl px-6 py-3.5 font-semibold text-primary-700 ring-1 ring-primary-200 bg-white/70 backdrop-blur hover:bg-white transition hover:-translate-y-px"
        >
          Sign In
        </Link>
      </motion.div>
      <motion.div
        className="mt-7 flex items-center justify-center gap-6 text-sm text-gray-500"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
      >
        <span className="inline-flex items-center gap-1.5"><FiShield className="text-primary-500" /> Secure by default</span>
        <span className="inline-flex items-center gap-1.5"><FiUserCheck className="text-primary-500" /> Role-based access</span>
        <span className="inline-flex items-center gap-1.5"><FiDownload className="text-primary-500" /> CSV &amp; Reports</span>
      </motion.div>
    </div>

    <motion.div
      className="mt-14"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: easeOutExpo }}
    >
      <Card className="p-2 md:p-4">
        <div className="rounded-xl bg-linear-to-tr from-white to-cyan-50 p-4 md:p-8 ring-1 ring-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <FiGrid />, title: 'Hall Management', sub: 'Halls, capacities & booking checks' },
              { icon: <FiClipboard />, title: 'Smart Bookings', sub: 'CNIC-linked clients, deposit tracking' },
              { icon: <FiBarChart2 />, title: 'Live Reports', sub: 'Revenue, utilization & CSV exports' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-lg bg-white grid place-items-center text-primary-600 shadow-sm group-hover:scale-105 transition">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xl font-bold">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  </Section>
);

// ── Animated counter strip ────────────────────────────────────────────────────
const STATS = [
  { to: 50, prefix: '', suffix: '+', label: 'Marques Onboarded' },
  { to: 1200, prefix: '', suffix: '+', label: 'Events Managed' },
  { to: 2, prefix: '₨', suffix: ' Cr+', label: 'Revenue Tracked' },
];

const CounterStrip = () => (
  <div className="bg-primary-600 py-12">
    <div className="container mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-3 gap-6 text-center text-white divide-x divide-white/20">
        {STATS.map((s, i) => (
          <div key={i}>
            <p className="text-3xl md:text-5xl font-extrabold">
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-1.5 text-white/70 text-sm md:text-base">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Domain-specific features ──────────────────────────────────────────────────
const FEATURES = [
  { icon: <FiGrid />, title: 'Hall Management', desc: 'Add halls with capacity, pricing, and descriptions. Prevent double-bookings with real-time availability checks.' },
  { icon: <FiClipboard />, title: 'Smart Bookings', desc: 'Book with client CNIC, set deposit amounts, and route bookings through a manager approval workflow.' },
  { icon: <FiUserCheck />, title: 'Staff Attendance', desc: 'Mark daily attendance for waiters, cooks, security, and drivers — with history, summaries, and date filters.' },
  { icon: <FiBook />, title: 'Marque Menus', desc: 'Build per-venue menu catalogs with dietary info, pricing per person, category filters, and vegetarian/vegan badges.' },
  { icon: <FiUsers />, title: 'Manager Accounts', desc: 'Assign managers to specific marques. They get their own login and see only their venue\'s data — fully scoped.' },
  { icon: <FiBarChart2 />, title: 'Financial Reports', desc: 'Track total revenue, deposits collected, and balance due. Filter by date range and export to CSV for accounting.' },
];

const Features = () => (
  <Section id="features" className="bg-linear-to-tr from-white to-cyan-50">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Built for Pakistani Marques</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Everything your Marque needs</h2>
      <p className="mt-3 text-gray-600">
        Every feature was designed around the real workflows of marquee and wedding hall businesses.
      </p>
    </div>

    <motion.div
      className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, amount: 0.15 }}
    >
      {FEATURES.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: easeOutExpo }}
        >
          <Card className="p-6 h-full hover:shadow-lg transition hover:-translate-y-0.5">
            <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 grid place-items-center text-lg">{f.icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

// ── Social proof scrolling marquee ────────────────────────────────────────────
const MARQUES = [
  'Royal Marquee Lahore', 'Gulshan Wedding Hall', 'Al-Hamd Banquet Faisalabad',
  'Shalimar Gardens', 'Marhaba Hall Karachi', 'Grand Palace Events Islamabad',
  'Rose Garden Banquet', 'Serena Convention Rawalpindi', 'Pearl Events Multan',
  'Nawab Hall Sialkot', 'Jasmine Palace Peshawar', 'Crystal Marquee Gujranwala',
];

const SocialProof = () => (
  <div className="overflow-hidden py-10 bg-gray-50 border-y border-gray-200">
    <style>{`@keyframes scroll-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
      Trusted by marquees across Pakistan
    </p>
    <div
      className="flex gap-12 whitespace-nowrap"
      style={{ animation: 'scroll-marquee 35s linear infinite' }}
    >
      {[...MARQUES, ...MARQUES].map((name, i) => (
        <span key={i} className="inline-flex items-center gap-2 text-gray-500 font-medium text-sm shrink-0">
          <FiMapPin className="text-primary-400 shrink-0" /> {name}
        </span>
      ))}
    </div>
  </div>
);

// ── How It Works ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Add Your Marque & Halls',
    desc: 'Create your venue and add halls with capacities, pricing, and descriptions. Set up takes under 5 minutes.',
  },
  {
    n: '02',
    title: 'Assign a Manager',
    desc: 'Create a manager account and link it to a specific marque. They get a scoped login and see only their data.',
  },
  {
    n: '03',
    title: 'Start Taking Bookings',
    desc: 'Manage clients with CNIC, collect deposits, approve bookings, mark staff attendance, and run daily reports.',
  },
];

const HowItWorks = () => (
  <Section id="how-it-works" className="bg-white">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Simple setup</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Up and running in minutes</h2>
      <p className="mt-3 text-gray-600">No technical knowledge required — Eventra is built for marque owners, not developers.</p>
    </div>

    <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" aria-hidden />
      {STEPS.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: i * 0.12, ease: easeOutExpo }}
          className="text-center"
        >
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-xl font-extrabold shadow-lg shadow-primary-200 mb-5">
            {step.n}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
          <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  </Section>
);

// ── PKR Pricing ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    features: ['1 Marque', 'Up to 50 Bookings/month', 'Basic Reports', 'Email Support'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₨4,999',
    period: '/month',
    features: ['Up to 5 Marques', 'Unlimited Bookings', 'Hall Management', 'Manager Accounts', 'Advanced Reports + CSV'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: '₨14,999',
    period: '/month',
    features: ['Unlimited Marques', 'Unlimited Bookings', 'Staff Attendance', 'Priority Support', 'Custom Reporting'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const Pricing = () => (
  <Section id="pricing" className="bg-gray-50">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Simple pricing</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Choose a plan that scales</h2>
      <p className="mt-3 text-gray-600">Start free and grow as your marque business grows. No hidden fees.</p>
    </div>

    <motion.div
      className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, amount: 0.2 }}
    >
      {PLANS.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: easeOutExpo }}
        >
          <Card className={`p-6 transition ${p.highlight ? 'ring-2 ring-primary-500 scale-[1.03]' : ''} hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
              {p.highlight && <Pill color="bg-green-50 text-green-700">Most Popular</Pill>}
            </div>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
              {p.period && <span className="text-gray-500 pb-1">{p.period}</span>}
            </div>
            <ul className="mt-5 space-y-2.5">
              {p.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                  <FiCheckCircle className="mt-0.5 text-green-600 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-sm transition will-change-transform hover:scale-[1.01] ${
                p.highlight
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'ring-1 ring-gray-300 hover:bg-gray-50'
              }`}
            >
              {p.cta}
            </Link>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

// ── Bottom CTA with pulse animation ──────────────────────────────────────────
const BottomCTA = () => (
  <Section className="bg-linear-to-tr from-primary-600 to-cyan-500 text-white overflow-hidden">
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
    </div>
    <div className="text-center relative">
      <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-extrabold">
        Ready to modernize<br className="hidden md:block" /> your Marque?
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.06 }}
        className="mt-4 text-lg text-white/80 max-w-2xl mx-auto"
      >
        Join marquee and wedding hall businesses across Pakistan already using Eventra
        to manage bookings, staff, and revenue in one place.
      </motion.p>
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.12 }}
        className="mt-9 inline-block relative"
      >
        <span className="absolute inset-0 rounded-2xl animate-ping bg-white/25 scale-110" aria-hidden />
        <Link
          to="/register"
          className="relative inline-flex items-center gap-2 rounded-2xl bg-white text-primary-700 font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition hover:scale-[1.02]"
        >
          Start Free for 30 Days <FiArrowRight />
        </Link>
      </motion.div>
      <p className="mt-5 text-white/50 text-sm">No credit card required · Cancel anytime</p>
    </div>
  </Section>
);

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'Can I manage multiple wedding halls?', a: 'Yes! Each marque can have multiple halls with their own capacity, pricing, and availability calendar.' },
  { q: 'How does CNIC-linked booking work?', a: 'When creating a booking you attach it to a client profile that stores CNIC, phone, and address — useful for accountability and records.' },
  { q: 'Can managers only see their own marque?', a: 'Absolutely. Managers are scoped to their assigned marque — they cannot access other venues\' bookings, staff, or menus.' },
  { q: 'Can I export financial reports?', a: 'Yes, the Reports page exports all booking and revenue data to a CSV file — ready to open in Excel or Google Sheets.' },
];

const FAQ = () => (
  <Section id="faq" className="bg-white">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Questions</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Frequently asked questions</h2>
    </div>
    <motion.div
      className="mt-10 grid md:grid-cols-2 gap-6"
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, amount: 0.2 }}
    >
      {FAQ_ITEMS.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.06, ease: easeOutExpo }}
        >
          <Card className="p-5 hover:-translate-y-0.5 transition">
            <p className="font-semibold text-gray-900">{f.q}</p>
            <p className="mt-2 text-gray-600 text-sm leading-relaxed">{f.a}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="border-t border-gray-200">
    <div className="container mx-auto max-w-7xl px-6 md:px-8 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Eventra. All rights reserved.</p>
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900">How It Works</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          <a href="#faq" className="hover:text-gray-900">FAQ</a>
          <Link to="/login" className="hover:text-gray-900">Login</Link>
        </div>
      </div>
    </div>
  </footer>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const Landing: React.FC = () => (
  <div className="min-h-screen bg-linear-to-b from-white via-[rgba(240,249,255,0.6)] to-[rgba(224,242,254,0.6)]">
    <TopNav />
    <main>
      <Hero />
      <CounterStrip />
      <Features />
      <SocialProof />
      <HowItWorks />
      <Pricing />
      <BottomCTA />
      <FAQ />
    </main>
    <Footer />
  </div>
);

export default Landing;
