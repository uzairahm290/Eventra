import React from 'react';
import { Link } from 'react-router-dom';
import { motion, cubicBezier } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiShield, FiZap, FiBarChart2, FiUsers, FiLayers, FiClock } from 'react-icons/fi';

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }>=({ id, className='', children })=> (
  <section id={id} className={`relative py-20 md:py-28 ${className}`}>
    <div className="container mx-auto px-6 md:px-8 max-w-7xl">{children}</div>
  </section>
);

const Pill: React.FC<{children:React.ReactNode; color?:string}>=({children,color='bg-primary-50 text-primary-700'})=> (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color} ring-1 ring-inset ring-primary-200`}>{children}</span>
);

const Card: React.FC<{children:React.ReactNode; className?:string}>=({children,className=''})=> (
  <div className={`rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>
);

// Easing functions compatible with motion-dom types
const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1);
const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

const GradientBG = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    {/* Subtle base white-blue radial gradient */}
    <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(59,130,246,0.10),transparent_60%),radial-gradient(900px_500px_at_10%_110%,rgba(6,182,212,0.12),transparent_60%)]" />
    {/* Soft floating blobs */}
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
  transition: { duration: 0.6, ease: easeOutExpo }
};

const Hero = () => (
  <Section className="pt-28 md:pt-36 bg-linear-to-tr from-white to-cyan-50">
    <GradientBG />
    <motion.div className="text-center" initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.3 }} variants={{ initial: {}, whileInView: {} }}>
      <motion.div {...fadeUp}>
        <Pill>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary-500 animate-pulse"/> New: Admin approvals + booking workflows
        </Pill>
      </motion.div>
      <motion.h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
        Eventra — The modern OS for events
      </motion.h1>
      <motion.p className="mt-5 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
        Plan, promote, and run events with confidence. From bookings and menus to real-time reports — streamlined in one beautiful dashboard.
      </motion.p>
      <motion.div className="mt-8 flex items-center justify-center gap-3" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
        <Link to="/register" className="inline-flex items-center rounded-xl bg-primary-600 px-5 py-3 text-white font-semibold shadow hover:bg-primary-700 transition will-change-transform hover:scale-[1.02]">
          Get Started Free <FiArrowRight className="ml-2"/>
        </Link>
        <Link to="/login" className="inline-flex items-center rounded-xl px-5 py-3 font-semibold text-primary-700 ring-1 ring-primary-200 bg-white/70 backdrop-blur hover:bg-white transition hover:-translate-y-px">
          Sign In
        </Link>
      </motion.div>
      <motion.div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
        <span className="inline-flex items-center"><FiShield className="mr-1"/> Secure</span>
        <span className="inline-flex items-center"><FiZap className="mr-1"/> Fast</span>
        <span className="inline-flex items-center"><FiClock className="mr-1"/> Save time</span>
      </motion.div>
    </motion.div>

    <motion.div className="mt-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: easeOutExpo }}>
      <Card className="p-2 md:p-4">
        <div className="rounded-xl bg-linear-to-tr from-white to-cyan-50 p-4 md:p-8 ring-1 ring-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 group"><div className="h-10 w-10 rounded-lg bg-white grid place-items-center text-primary-600 group-hover:scale-105 transition"><FiBarChart2/></div><div><p className="text-2xl font-bold">Live Reports</p><p className="text-gray-500 text-sm">Revenue, attendance, and performance</p></div></div>
            <div className="flex items-center gap-3 group"><div className="h-10 w-10 rounded-lg bg-white grid place-items-center text-primary-600 group-hover:scale-105 transition"><FiUsers/></div><div><p className="text-2xl font-bold">Smart Bookings</p><p className="text-gray-500 text-sm">Admin approvals built-in</p></div></div>
            <div className="flex items-center gap-3 group"><div className="h-10 w-10 rounded-lg bg-white grid place-items-center text-primary-600 group-hover:scale-105 transition"><FiLayers/></div><div><p className="text-2xl font-bold">Menus & Venues</p><p className="text-gray-500 text-sm">Everything in one place</p></div></div>
          </div>
        </div>
      </Card>
    </motion.div>
  </Section>
);

const Features = () => (
  <Section id="features" className="bg-linear-to-tr from-white to-cyan-50">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Powerful out of the box</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Everything you need to run great events</h2>
      <p className="mt-3 text-gray-600">Eventra comes with production-ready features so your team moves faster from day one.</p>
    </div>

    <motion.div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
      {[
        { icon: <FiCheckCircle/>, title: 'Admin Approvals', desc: 'Approve users and bookings with a click.' },
        { icon: <FiBarChart2/>, title: 'Live Analytics', desc: 'Revenue, bookings, utilization & exports.' },
        { icon: <FiUsers/>, title: 'Client CRM', desc: 'Track clients, notes, and interactions.' },
        { icon: <FiLayers/>, title: 'Menus & Add-ons', desc: 'Flexible menus linked to events.' },
        { icon: <FiClock/>, title: 'Calendar', desc: 'All events in one sleek calendar view.' },
        { icon: <FiShield/>, title: 'Secure Auth', desc: 'JWT-based, password reset, role-ready.' }
      ].map((f, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05, ease: easeOutExpo }}>
          <Card className="p-6 hover:shadow-lg transition hover:-translate-y-0.5">
            <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 grid place-items-center text-lg">{f.icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

const Pricing = () => (
  <Section id="pricing" className="bg-white">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Simple pricing</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Choose a plan that scales</h2>
      <p className="mt-3 text-gray-600">Start free, grow as you go. No hidden fees.</p>
    </div>

    <motion.div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end" initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
      {[{
        name:'Starter', price:'$0', period:'/mo', features:['Unlimited events','Basic reports','Email support'], cta:'Get Started', highlight:false
      },{
        name:'Pro', price:'$29', period:'/mo', features:['Advanced analytics','Admin approvals','Priority support'], cta:'Start Pro', highlight:true
      },{
        name:'Business', price:'$99', period:'/mo', features:['Team collaboration','SLA support','Custom reporting'], cta:'Contact Sales', highlight:false
      }].map((p,i)=> (
        <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05, ease: easeOutExpo }}>
          <Card className={`p-6 transition ${p.highlight? 'ring-2 ring-primary-500 scale-[1.02]':''} hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
              {p.highlight && <Pill color='bg-green-50 text-green-700'>Most Popular</Pill>}
            </div>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
              <span className="text-gray-500">{p.period}</span>
            </div>
            <ul className="mt-5 space-y-2">
              {p.features.map((f,idx)=> (
                <li key={idx} className="flex items-start gap-2 text-gray-700"><FiCheckCircle className="mt-0.5 text-green-600"/> {f}</li>
              ))}
            </ul>
            <Link to={'/register'} className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 font-semibold ${p.highlight? 'bg-primary-600 text-white hover:bg-primary-700':'ring-1 ring-gray-300 hover:bg-gray-50'} transition will-change-transform hover:scale-[1.01]`}>{p.cta}</Link>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

const FAQ = () => (
  <Section id="faq" className="bg-gray-50">
    <div className="text-center max-w-3xl mx-auto">
      <Pill>Questions</Pill>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Frequently asked questions</h2>
    </div>
    <motion.div className="mt-10 grid md:grid-cols-2 gap-6" initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
      {[
        {q:'Can I use Eventra for free?', a:'Yes! The Starter plan is free with core features.'},
        {q:'Do you support admin approvals?', a:'Absolutely. Users and bookings can be approved by admins.'},
        {q:'Can I export reports?', a:'Yes, CSV export is available from the Reports page.'},
        {q:'Is there a calendar view?', a:'Yes, a full calendar and upcoming events list are included.'},
      ].map((f, i)=> (
        <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.05, ease: easeOutExpo }}>
          <Card className="p-5 hover:-translate-y-0.5 transition">
            <p className="font-semibold text-gray-900">{f.q}</p>
            <p className="mt-2 text-gray-600 text-sm">{f.a}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

const Footer = () => (
  <footer className="border-t border-gray-200">
    <div className="container mx-auto max-w-7xl px-6 md:px-8 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Eventra. All rights reserved.</p>
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          <a href="#faq" className="hover:text-gray-900">FAQ</a>
          <Link to="/login" className="hover:text-gray-900">Login</Link>
        </div>
      </div>
    </div>
  </footer>
);

const TopNav = () => (
  <div className="fixed inset-x-0 top-0 z-20">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
        <Link to="/" className="text-lg font-extrabold text-gray-900">Eventra</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          <a href="#faq" className="hover:text-gray-900">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden md:inline-flex rounded-xl px-4 py-2 font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50">Login</Link>
          <Link to="/register" className="inline-flex rounded-xl px-4 py-2 font-semibold text-white bg-primary-600 hover:bg-primary-700">Get Started</Link>
        </div>
      </div>
    </div>
  </div>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[rgba(240,249,255,0.6)] to-[rgba(224,242,254,0.6)]">
      <TopNav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
