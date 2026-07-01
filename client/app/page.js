'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/lib/auth';

/* ─── Data ───────────────────────────────────────────────────── */

const STATS = [
  { number: '85%', desc: 'of users report improved interview confidence after just 3 sessions' },
  { number: '4.8/5', desc: 'average satisfaction rating from candidates worldwide' },
  { number: '12 min', desc: 'average session length — practice on your lunch break' },
  { number: '500+', desc: 'mock interviews conducted and counting' },
  { number: '3×', desc: 'faster interview prep compared to traditional methods' },
  { number: '92%', desc: 'would recommend Intervu to a friend preparing for interviews' },
];

const FEATURES = [
  { num: '01', title: 'Pick Your Interview Type', desc: 'Choose from Behavioral, Technical, System Design, or HR & Culture Fit — each with tailored questions and evaluation criteria.' },
  { num: '02', title: 'Talk to Aria, Your AI Interviewer', desc: 'Have a real voice conversation. No typing, no scripts — Aria listens, adapts, and follows up just like a real interviewer.' },
  { num: '03', title: 'Get Graded Instantly', desc: 'Receive a detailed scorecard across communication, structure, depth, and confidence within seconds of finishing.' },
  { num: '04', title: 'Track Your Growth', desc: 'Your personal dashboard shows every session, score trend, and area for improvement over time.' },
];

const TESTIMONIALS = [
  { quote: 'I was terrified of behavioral interviews. After 5 sessions with Aria, I felt like I was talking to a friend. Landed my dream role at a Big 4 firm.', name: 'Priya Sharma', role: 'Product Manager', stars: 5 },
  { quote: "The instant feedback is a game changer. I didn't realize I was rambling until Intervu's score breakdown showed my structure was 4/10. Three sessions later, it was 9.", name: 'Michael Chen', role: 'Software Engineer', stars: 5 },
  { quote: "I've done prep courses, mock calls with friends, everything. Nothing compares to an AI that actually adapts to your answers in real time.", name: 'Aisha Khan', role: 'Data Scientist', stars: 5 },
  { quote: 'Used Intervu the night before my final round. The system design questions were spot on. Got the offer the next morning.', name: 'David Park', role: 'Backend Engineer', stars: 5 },
  { quote: "As someone who switches careers often, this is invaluable. I can practice HR rounds in 10 minutes during my commute.", name: 'Sarah Mitchell', role: 'UX Designer', stars: 4 },
];

const FAQS = [
  { q: 'What is Intervu?', a: 'Intervu is an AI-powered mock interview platform. You have a real voice conversation with Aria, our AI interviewer, who adapts her questions based on your answers — just like a real interview. Afterward, you get an instant, detailed feedback report.' },
  { q: 'Is Intervu free to use?', a: 'Yes! Intervu is completely free during our beta period. Create an account and start practicing immediately — no credit card required.' },
  { q: 'How does the AI interviewing work?', a: 'When you start a session, Aria connects via voice using advanced speech recognition. She asks questions, listens to your responses, and generates follow-up questions dynamically. There are no pre-written scripts — every interview is unique.' },
  { q: 'What types of interviews can I practice?', a: 'We support four types: Behavioral (STAR-format stories), Technical (coding & architecture), System Design (scalability & trade-offs), and HR / Culture Fit (values & motivation). Each type has specialized evaluation criteria.' },
  { q: 'How is the feedback generated?', a: 'After your session ends, the full conversation transcript is analyzed by our AI grading system. It evaluates communication clarity, answer structure, technical depth, and overall confidence, producing scores and actionable improvement tips.' },
  { q: 'Is my data private?', a: 'Absolutely. Your transcripts and feedback reports are tied to your account and are never shared. We do not use your data to train AI models. You can delete your account and all associated data at any time.' },
];

const INTERVIEW_TYPES = [
  { icon: '💬', title: 'Behavioral', desc: 'STAR-format stories, leadership, conflict resolution, and teamwork scenarios.', color: '#c0c0c0' },
  { icon: '⚡', title: 'Technical', desc: 'Algorithm thinking, code walkthroughs, data structures, and problem-solving.', color: '#e2e8f0' },
  { icon: '🏗️', title: 'System Design', desc: 'Scalability, architecture trade-offs, load balancing, and distributed systems.', color: '#94a3b8' },
  { icon: '🤝', title: 'HR & Culture Fit', desc: 'Values alignment, career goals, salary negotiation, and motivation.', color: '#f59e0b' },
];

/* ─── Styles ─────────────────────────────────────────────────── */

const S = {
  page: { overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  // Nav
  nav: (scrolled) => ({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: scrolled ? '12px 0' : '16px 0',
    transition: 'all 0.4s ease',
    background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
  }),
  navInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#e2e8f0,#c0c0c0,#94a3b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#050505' },
  logoText: { fontWeight: 700, fontSize: 20, color: '#f1f5f9' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 32 },
  navLink: { color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', border: 'none', background: 'none', fontFamily: 'inherit' },
  navBtn: { background: 'linear-gradient(135deg,#e2e8f0,#c0c0c0,#94a3b8)', color: '#050505', padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  // Hero
  hero: { position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', overflow: 'hidden' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  heroBgImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 },
  heroBgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.5) 40%, rgba(5,5,5,1) 100%)' },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 900 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: '#c0c0c0', background: 'rgba(192,192,192,0.06)', border: '1px solid rgba(192,192,192,0.15)', marginBottom: 32 },
  heroTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, color: '#f1f5f9' },
  gradientText: { background: 'linear-gradient(135deg,#e2e8f0 0%,#c0c0c0 50%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSubtitle: { fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', color: '#94a3b8', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6 },
  heroCtas: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { background: 'linear-gradient(135deg,#e2e8f0,#c0c0c0,#94a3b8)', color: '#050505', padding: '16px 40px', borderRadius: 14, fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(192,192,192,0.15)', fontFamily: 'inherit', transition: 'all 0.3s ease' },
  btnGhost: { background: 'transparent', color: '#94a3b8', padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: 15, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s ease' },
  // Mockup
  mockupWrap: { position: 'relative', zIndex: 1, marginTop: 64, width: '100%', maxWidth: 800 },
  mockupWindow: { background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' },
  mockupToolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  mockupDot: (c) => ({ width: 12, height: 12, borderRadius: '50%', background: c }),
  mockupBody: { padding: 24, minHeight: 200 },
  mockupLine: (end) => ({ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start', justifyContent: end ? 'flex-end' : 'flex-start' }),
  mockupAvatar: (c) => ({ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: `${c}20`, color: c }),
  mockupBubble: (c) => ({ padding: '12px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.5, maxWidth: '85%', background: `${c}08`, border: `1px solid ${c}15`, textAlign: 'left' }),
  mockupLabel: (c) => ({ fontSize: 11, color: c, marginBottom: 4, fontWeight: 600 }),
  // Sections
  section: { padding: '100px 24px', maxWidth: 1200, margin: '0 auto' },
  sectionLabel: { fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c0c0c0', marginBottom: 16 },
  sectionTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16, color: '#f1f5f9' },
  sectionSubtitle: { fontSize: 17, color: '#94a3b8', maxWidth: 600, lineHeight: 1.6 },
  // Social proof
  socialProof: { padding: '40px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  companyBadges: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 },
  companyBadge: { padding: '10px 24px', color: '#64748b', fontSize: 15, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 48 },
  statCard: { background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px', transition: 'all 0.3s ease' },
  statNumber: { fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(135deg,#e2e8f0,#c0c0c0,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8, lineHeight: 1 },
  statDesc: { fontSize: 15, color: '#94a3b8', lineHeight: 1.5 },
  // Features
  featuresSplit: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginTop: 48 },
  featureStep: { display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s ease' },
  stepNumber: { fontSize: '1.5rem', fontWeight: 700, color: '#c0c0c0', opacity: 0.6, minWidth: 40 },
  stepTitle: { fontSize: 18, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 },
  stepDesc: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6 },
  // Interview types grid
  typesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 },
  typeCard: (color) => ({ background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'all 0.3s ease' }),
  typeIcon: (color) => ({ width: 48, height: 48, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }),
  // Testimonials
  testimonialsScroll: { display: 'flex', gap: 24, overflowX: 'auto', padding: '24px 0', scrollSnapType: 'x mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' },
  testimonialCard: { minWidth: 350, maxWidth: 400, padding: 28, scrollSnapAlign: 'start', flexShrink: 0, background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 },
  testimonialStars: { color: '#f59e0b', fontSize: 14, letterSpacing: 2, marginBottom: 16 },
  testimonialQuote: { fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' },
  testimonialAuthor: { fontSize: 15, fontWeight: 600, color: '#f1f5f9' },
  testimonialRole: { fontSize: 13, color: '#64748b', marginTop: 2 },
  // FAQ
  faqList: { maxWidth: 780, margin: '48px auto 0', display: 'flex', flexDirection: 'column', gap: 12 },
  faqItem: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(10,10,10,0.5)', overflow: 'hidden', transition: 'border-color 0.3s' },
  faqQuestion: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", textAlign: 'left' },
  faqChevron: (open) => ({ fontSize: 14, color: '#64748b', transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }),
  faqAnswer: (open) => ({ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }),
  faqAnswerInner: { padding: '0 24px 20px', fontSize: 15, color: '#94a3b8', lineHeight: 1.7 },
  // CTA Banner
  ctaBanner: { position: 'relative', textAlign: 'center', padding: '100px 24px', overflow: 'hidden' },
  ctaBannerGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, rgba(192,192,192,0.05) 0%, transparent 70%)', pointerEvents: 'none' },
  // Footer
  footer: { padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' },
  footerLinks: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 },
  footerLink: { color: '#64748b', fontSize: 14, cursor: 'pointer', transition: 'color 0.2s', border: 'none', background: 'none', fontFamily: 'inherit' },
  // Score bars
  scoreBar: (w, c) => ({ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }),
  scoreBarFill: (w, c) => ({ width: `${w}%`, height: '100%', borderRadius: 4, background: c, transition: 'width 1.5s ease' }),
  // Waveform
  waveformWrap: { display: 'flex', alignItems: 'center', gap: 3, height: 24 },
};

/* ─── Component ──────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [visible, setVisible] = useState(new Set());

  useEffect(() => {
    const auth = getAuth();
    if (auth && auth.token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver for reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((prev) => new Set([...prev, e.target.dataset.revealId]));
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal-id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleCTA = useCallback(() => {
    router.push(isLoggedIn ? '/dashboard' : '/signup');
  }, [isLoggedIn, router]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const ctaLabel = isLoggedIn ? 'Go to Dashboard →' : 'Start your interview →';

  const reveal = (id, delay = 0) => ({
    'data-reveal-id': id,
    style: {
      opacity: visible.has(id) ? 1 : 0,
      transform: visible.has(id) ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
    },
  });

  return (
    <div style={S.page}>
      {/* ── Navbar ── */}
      <nav style={S.nav(navScrolled)}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={S.logoIcon}>I</div>
            <span style={S.logoText}>Intervu</span>
          </div>
          <div style={S.navLinks}>
            <button style={S.navLink} onClick={() => scrollTo('features')}>Features</button>
            <button style={S.navLink} onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button style={S.navLink} onClick={() => scrollTo('testimonials')}>Testimonials</button>
            <button style={S.navLink} onClick={() => scrollTo('faq')}>FAQ</button>
            <button style={S.navBtn} onClick={handleCTA}>{isLoggedIn ? 'Dashboard' : 'Get Started'}</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={S.hero}>
        <div style={S.heroBg}>
          <img src="/landing-hero.png" alt="" style={S.heroBgImg} />
          <div style={S.heroBgOverlay} />
        </div>

        <div style={S.heroContent}>

          <h1 style={S.heroTitle}>
            Stop Guessing.<br />
            <span style={S.gradientText}>Start Practicing.</span>
          </h1>

          <p style={S.heroSubtitle}>
            Talk to Aria — an AI interviewer who listens, adapts, and gives you
            brutally honest feedback in real time. No scripts. No fluff. Just the reps
            you need to walk into any interview with confidence.
          </p>

          <div style={S.heroCtas}>
            <button style={S.btnPrimary} onClick={handleCTA}>{ctaLabel}</button>
            <button style={S.btnGhost} onClick={() => scrollTo('how-it-works')}>See How It Works ↓</button>
          </div>
        </div>

        {/* Product mockup */}
        <div style={S.mockupWrap}>
          <div style={S.mockupWindow}>
            <div style={S.mockupToolbar}>
              <div style={S.mockupDot('#ef4444')} />
              <div style={S.mockupDot('#f59e0b')} />
              <div style={S.mockupDot('#10b981')} />
              <span style={{ marginLeft: 12, fontSize: 13, color: '#64748b' }}>Intervu — Live Interview</span>
              <div style={{ marginLeft: 'auto' }}>
                <div className="waveform" style={S.waveformWrap}>
                  {[...Array(8)].map((_, i) => <div key={i} className="waveform-bar" />)}
                </div>
              </div>
            </div>
            <div style={S.mockupBody}>
              <div style={S.mockupLine(false)}>
                <div style={S.mockupAvatar('#c0c0c0')}>A</div>
                <div style={S.mockupBubble('#c0c0c0')}>
                  <div style={S.mockupLabel('#c0c0c0')}>Aria</div>
                  Tell me about a time you had to lead a project with a tight deadline. What was your approach, and how did you handle the pressure?
                </div>
              </div>
              <div style={S.mockupLine(true)}>
                <div style={S.mockupBubble('#10b981')}>
                  <div style={S.mockupLabel('#10b981')}>You</div>
                  Sure — last quarter I led the migration of our payment service. We had a 3-week window because of a vendor deadline…
                </div>
                <div style={S.mockupAvatar('#10b981')}>U</div>
              </div>
              <div style={S.mockupLine(false)}>
                <div style={S.mockupAvatar('#c0c0c0')}>A</div>
                <div style={S.mockupBubble('#c0c0c0')}>
                  <div className="typing-dots" style={{ display: 'inline-flex', gap: 4, padding: '12px 16px' }}>
                    <span className="waveform-bar" style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b', animation: 'typingBounce 1.4s ease-in-out infinite' }} />
                    <span className="waveform-bar" style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b', animation: 'typingBounce 1.4s ease-in-out infinite 0.2s' }} />
                    <span className="waveform-bar" style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b', animation: 'typingBounce 1.4s ease-in-out infinite 0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── Stats ── */}
      <section style={S.section} id="stats">
        <div style={{ textAlign: 'center' }} {...reveal('stats-title')}>
          <p style={S.sectionLabel}>THE NUMBERS</p>
          <h2 style={{ ...S.sectionTitle, maxWidth: 600, margin: '0 auto 16px' }}>
            Results That <span style={S.gradientText}>Speak</span>
          </h2>
        </div>
        <div style={S.statsGrid}>
          {STATS.map((stat, i) => (
            <div key={i} style={S.statCard} {...reveal(`stat-${i}`, i * 0.08)}>
              <div style={S.statNumber}>{stat.number}</div>
              <div style={S.statDesc}>{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={S.section} id="how-it-works">
        <div {...reveal('hiw-title')}>
          <p style={S.sectionLabel}>HOW IT WORKS</p>
          <h2 style={S.sectionTitle}>
            Everything you need to<br />
            <span style={S.gradientText}>ace your next interview</span>
          </h2>
        </div>

        <div style={S.featuresSplit}>
          <div>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ ...S.featureStep, borderBottom: i === FEATURES.length - 1 ? 'none' : S.featureStep.borderBottom }} {...reveal(`feat-${i}`, i * 0.1)}>
                <div style={S.stepNumber}>{f.num}</div>
                <div>
                  <div style={S.stepTitle}>{f.title}</div>
                  <div style={S.stepDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div {...reveal('score-card', 0.2)}>
            <div style={S.statCard}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', marginBottom: 24, textAlign: 'center' }}>YOUR SCORE BREAKDOWN</div>
              {[
                { label: 'Communication', val: 85, color: '#e2e8f0' },
                { label: 'Structure', val: 78, color: '#c0c0c0' },
                { label: 'Depth', val: 91, color: '#94a3b8' },
                { label: 'Confidence', val: 82, color: '#c0c0c0' },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: '#94a3b8' }}>{s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.val}%</span>
                  </div>
                  <div style={S.scoreBar(s.val, s.color)}>
                    <div style={S.scoreBarFill(visible.has('score-card') ? s.val : 0, s.color)} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 32, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ ...S.statNumber, fontSize: 48 }}>84</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Overall Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interview Types ── */}
      <section style={S.section} id="features">
        <div style={{ textAlign: 'center' }} {...reveal('types-title')}>
          <p style={S.sectionLabel}>INTERVIEW TYPES</p>
          <h2 style={{ ...S.sectionTitle, maxWidth: 650, margin: '0 auto 48px' }}>
            Four modes. <span style={S.gradientText}>One goal.</span>
          </h2>
        </div>
        <div style={S.typesGrid}>
          {INTERVIEW_TYPES.map((type, i) => (
            <div key={type.title} style={S.typeCard(type.color)} {...reveal(`type-${i}`, i * 0.08)}>
              <div style={S.typeIcon(type.color)}>{type.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>{type.title}</div>
              <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{type.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={S.section} id="testimonials">
        <div style={{ textAlign: 'center' }} {...reveal('test-title')}>
          <p style={S.sectionLabel}>TESTIMONIALS</p>
          <h2 style={{ ...S.sectionTitle, maxWidth: 600, margin: '0 auto 8px' }}>
            Candidates <span style={S.gradientText}>Love</span> Intervu
          </h2>
          <p style={{ ...S.sectionSubtitle, margin: '0 auto' }}>Hear from people who used Intervu to prepare for interviews at top companies.</p>
        </div>
        <div style={S.testimonialsScroll}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={S.testimonialCard}>
              <div style={S.testimonialStars}>{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
              <p style={S.testimonialQuote}>"{t.quote}"</p>
              <div style={S.testimonialAuthor}>{t.name}</div>
              <div style={S.testimonialRole}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={S.section} id="faq">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }} {...reveal('faq-title')}>
          <h2 style={{ ...S.sectionTitle, textAlign: 'center' }}>Frequently Asked Questions</h2>
          <p style={{ ...S.sectionSubtitle, margin: '0 auto', textAlign: 'center' }}>Everything you need to know about Intervu</p>
        </div>
        <div style={S.faqList}>
          {FAQS.map((faq, i) => (
            <div key={i} style={S.faqItem} {...reveal(`faq-${i}`, i * 0.05)}>
              <button style={S.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span style={S.faqChevron(openFaq === i)}>▼</span>
              </button>
              <div style={S.faqAnswer(openFaq === i)}>
                <div style={S.faqAnswerInner}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={S.ctaBanner} {...reveal('cta-final')}>
        <div style={S.ctaBannerGlow} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ ...S.sectionTitle, marginBottom: 16, textAlign: 'center' }}>Ready to Ace Your Next Interview?</h2>
          <p style={{ fontSize: 17, color: '#94a3b8', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px', textAlign: 'center' }}>
            Join hundreds of candidates who transformed their interview skills with just a few practice sessions.
          </p>
          <button style={S.btnPrimary} onClick={handleCTA}>{ctaLabel}</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <div style={S.footerLinks}>
          <button style={S.footerLink} onClick={() => scrollTo('features')}>Features</button>
          <button style={S.footerLink} onClick={() => scrollTo('how-it-works')}>How It Works</button>
          <button style={S.footerLink} onClick={() => scrollTo('testimonials')}>Testimonials</button>
          <button style={S.footerLink} onClick={() => scrollTo('faq')}>FAQ</button>
          {!isLoggedIn && <button style={S.footerLink} onClick={() => router.push('/login')}>Log In</button>}
        </div>
        <p style={{ fontSize: 13, color: '#64748b' }}>© 2026 Intervu. All rights reserved.</p>
      </footer>
    </div>
  );
}
