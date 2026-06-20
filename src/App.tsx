import { useState } from 'react';
import { TrustSphere3D } from './components/TrustSphere3D';
import { ConsoleDashboard } from './components/ConsoleDashboard';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'console'>('landing');
  const [riskScore, setRiskScore] = useState<number>(5);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [demoThreatState, setDemoThreatState] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [biometricTab, setBiometricTab] = useState<'face' | 'fingerprint'>('face');

  const handleRiskChange = (score: number, level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setRiskScore(score);
    setRiskLevel(level);
  };

  const handleToggleDemoState = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setDemoThreatState(level);
    if (level === 'LOW') {
      setRiskScore(5);
      setRiskLevel('LOW');
    } else if (level === 'MEDIUM') {
      setRiskScore(45);
      setRiskLevel('MEDIUM');
    } else {
      setRiskScore(88);
      setRiskLevel('HIGH');
    }
  };

  const getBorderGlow = () => {
    if (activeView === 'console') {
      if (riskLevel === 'LOW') return 'var(--glow-secure)';
      if (riskLevel === 'MEDIUM') return 'var(--glow-warning)';
      return 'var(--glow-danger)';
    }
    if (demoThreatState === 'LOW') return 'var(--glow-cyan)';
    if (demoThreatState === 'MEDIUM') return 'var(--glow-warning)';
    return 'var(--glow-danger)';
  };

  const getBorderColor = () => {
    if (activeView === 'console') {
      if (riskLevel === 'LOW') return 'rgba(16, 185, 129, 0.2)';
      if (riskLevel === 'MEDIUM') return 'rgba(245, 158, 11, 0.3)';
      return 'rgba(239, 68, 68, 0.4)';
    }
    if (demoThreatState === 'LOW') return 'rgba(0, 242, 254, 0.2)';
    if (demoThreatState === 'MEDIUM') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(239, 68, 68, 0.4)';
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Background Gradients & Effects */}
      <div className="bg-grid-effect" />
      <div className="bg-radial-gradient" />

      {/* Main Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(3, 4, 8, 0.85)',
        backdropFilter: 'var(--glass-blur)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'var(--transition-smooth)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveView('landing')}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)',
            transition: 'var(--transition-smooth)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#030408" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '0.08em',
            background: 'linear-gradient(90deg, #ffffff 30%, var(--color-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>PRISM ID</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={() => setActiveView('landing')}
            style={{
              background: 'none',
              border: 'none',
              color: activeView === 'landing' ? 'var(--color-primary)' : 'var(--text-muted)',
              textShadow: activeView === 'landing' ? '0 0 8px rgba(0,242,254,0.4)' : 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            SYSTEM OVERVIEW
          </button>
          
          <button
            onClick={() => setActiveView('console')}
            style={{
              background: 'none',
              border: 'none',
              color: activeView === 'console' ? 'var(--color-primary)' : 'var(--text-muted)',
              textShadow: activeView === 'console' ? '0 0 8px rgba(0,242,254,0.4)' : 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            SECURITY SIMULATOR
          </button>
        </nav>
      </header>

      {/* Main View Container - Full Viewport Width */}
      <main style={{ padding: '28px 32px', width: '100%', position: 'relative', boxSizing: 'border-box' }}>
        
        {activeView === 'landing' ? (
          /* ================= LANDING PAGE VIEW ================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
            
            {/* Hero Section - Full Width, No Empty Space */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center',
              minHeight: '80vh'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 242, 254, 0.03)',
                  border: '1px solid rgba(0, 242, 254, 0.18)',
                  boxShadow: '0 0 15px rgba(0,242,254,0.08)',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  width: 'fit-content'
                }}>
                  <span className="status-dot secure"></span>
                  <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.08em' }}>
                    PRIVACY-FIRST RISK-BASED IDENTITY TRUST
                  </span>
                </div>

                <h1 style={{
                  fontSize: '72px',
                  lineHeight: '1.1',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em'
                }}>
                  Continuous Identity Trust <br />
                  <span className="accent-gradient">Without Customer Friction</span>
                </h1>

                <p style={{
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.65'
                }}>
                  A decentralized, risk-based authentication engine that continuously validates customer and enterprise identities across digital banking channels. Triggers step-up verification only when risk spikes.
                </p>

                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <button
                    onClick={() => setActiveView('console')}
                    className="cyber-button active"
                    style={{ padding: '14px 28px', fontSize: '15px' }}
                  >
                    Launch System Simulator
                  </button>
                  <a
                    href="#how-it-works"
                    className="cyber-button"
                    style={{ padding: '14px 28px', fontSize: '15px', textDecoration: 'none' }}
                  >
                    How It Works
                  </a>
                </div>

                {/* Simulated 3D Controls */}
                <div className="glass-panel" style={{
                  marginTop: '20px',
                  padding: '20px 24px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                    DEMO INTERACTION: TRIGGER SYSTEM THREATS ON THE 3D SPHERE
                  </div>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <button
                      onClick={() => handleToggleDemoState('LOW')}
                      className={`cyber-button ${demoThreatState === 'LOW' ? 'active' : ''}`}
                      style={{ flex: 1, fontSize: '14px', padding: '12px', justifyContent: 'center' }}
                    >
                       Low Risk Mode
                    </button>
                    <button
                      onClick={() => handleToggleDemoState('MEDIUM')}
                      className={`cyber-button ${demoThreatState === 'MEDIUM' ? 'active' : ''}`}
                      style={{ flex: 1, fontSize: '14px', padding: '12px', justifyContent: 'center' }}
                    >
                       Elevated Risk
                    </button>
                    <button
                      onClick={() => handleToggleDemoState('HIGH')}
                      className={`cyber-button danger-btn ${demoThreatState === 'HIGH' ? 'active' : ''}`}
                      style={{ flex: 1, fontSize: '14px', padding: '12px', justifyContent: 'center', backgroundColor: demoThreatState === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)' }}
                    >
                       Threat Anomaly
                    </button>
                  </div>
                </div>
              </div>

              {/* 3D Graphic Visual Container - Full Width */}
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                {/* Rotating radar scanner in background */}
                <div className="spin-animation" style={{
                  position: 'absolute',
                  width: '110%',
                  height: '110%',
                  border: `2px dashed ${getBorderColor()}`,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 0,
                  opacity: 0.12,
                  transition: 'var(--transition-smooth)'
                }} />
                
                <div className="glass-panel float-panel scanline-effect" style={{
                  width: '100%',
                  height: '520px',
                  background: 'radial-gradient(circle at center, rgba(14, 18, 36, 0.4) 0%, rgba(6, 7, 13, 0.95) 100%)',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                  border: `1.5px solid ${getBorderColor()}`,
                  boxShadow: `0 12px 40px 0 rgba(0,0,0,0.5), ${getBorderGlow()}`
                }}>
                  <TrustSphere3D riskScore={riskScore} riskLevel={riskLevel} />
                </div>
              </div>

            </section>

            {/* Architectural Pillars */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '44px', fontFamily: 'var(--font-sans)', fontWeight: 800 }} className="title-gradient">
                  PrismID Core Pillars
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginTop: '10px' }}>
                  A zero-trust identity verification platform built for scale, speed, and privacy.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px'
              }}>
                {[
                  { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, title: 'Continuous Authentication', text: 'PrismID tracks Interactive Keystroke Cadence timing, device fingerprints, and geo-velocity throughout user sessions to detect bots and account takeovers in real time.', accent: 'var(--color-primary)' },
                  { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>, title: 'Zero-Data Exposure & Integrity', text: 'Protects personal data using Zero-Knowledge Proofs (ZKP). Telemetry is hashed locally, and all system events are logged to a Tamper-Proof Event Audit Ledger for compliance.', accent: 'var(--color-accent)' },
                  { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>, title: 'Dynamic Friction Optimization', text: 'Zero friction for trusted sessions. Step-up challenges (Cinematic KYC face scans or widescreen capacitive fingerprint checks) are triggered dynamically on threat vectors.', accent: 'var(--color-secondary)' },
                  { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, title: 'Explainable AI Analytics', text: 'Every risk decision is backed by transparent Explainable AI Rationale, breaking down exact signal weights (Device, Network, Behavioral) that triggered the enforcement.', accent: 'var(--color-warning)' },
                ].map(card => (
                  <div key={card.title} className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(255, 255, 255, 0.03)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ color: card.accent, filter: `drop-shadow(0 0 6px ${card.accent}66)` }}>{card.icon}</div>
                    <h3 style={{ fontSize: '20px', color: 'var(--text-main)', fontWeight: 700 }}>{card.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.65', flex: 1 }}>{card.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Biometric Verification Suite Section */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '44px', fontFamily: 'var(--font-sans)', fontWeight: 800 }} className="title-gradient">
                  Biometric Verification Engines
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginTop: '10px' }}>
                  Widescreen split-screen biometric verifiers engineered to secure banking portals and protect sensitive transactions.
                </p>
              </div>

              {/* Tab Selector */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button
                  onClick={() => setBiometricTab('face')}
                  className={`cyber-button ${biometricTab === 'face' ? 'active' : ''}`}
                  style={{ padding: '12px 24px', fontSize: '14px', minWidth: '240px', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  FACIAL RECOGNITION (KYC)
                </button>
                <button
                  onClick={() => setBiometricTab('fingerprint')}
                  className={`cyber-button ${biometricTab === 'fingerprint' ? 'active' : ''}`}
                  style={{ padding: '12px 24px', fontSize: '14px', minWidth: '240px', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M2 12C2 6.5 6.5 2 12 2s10 4.5 10 10-4.5 10-10 10S2 17.5 2 12z"></path><path d="M12 2a7 7 0 0 1 7 7c0 2.5-2 4.5-4.5 4.5S10 11.5 10 9"></path><path d="M12 6a3 3 0 0 1 3 3"></path></svg>
                  CAPACITIVE FINGERPRINT (MFA)
                </button>
              </div>

              {/* Showcase Detail Container */}
              <div className="glass-panel" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.4fr',
                gap: '48px',
                padding: '48px',
                alignItems: 'center',
                background: 'rgba(10, 12, 22, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: biometricTab === 'face' ? 'var(--glow-warning)' : 'var(--glow-cyan)',
                borderColor: biometricTab === 'face' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                transition: 'var(--transition-smooth)'
              }}>
                {/* Left Column: Visual Mockup */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative' }}>
                  {biometricTab === 'face' ? (
                    /* KYC Face Scan Visual Mockup */
                    <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      {/* Concentric rotating HUD rings */}
                      <svg className="hud-ring-decor radar-sweep" viewBox="0 0 100 100" style={{ color: 'var(--color-warning)', opacity: 0.6 }}>
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3 4 8 2" />
                      </svg>
                      <svg className="hud-ring-decor radar-sweep-reverse" viewBox="0 0 100 100" style={{ color: 'var(--color-warning)', opacity: 0.4 }}>
                        <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="20 10 5 10" />
                      </svg>
                      
                      {/* Circular viewfinder viewport */}
                      <div style={{
                        width: '220px',
                        height: '220px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '3px solid var(--color-warning)',
                        boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)',
                        background: '#040508',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        {/* Glowing Face Silhouette SVG */}
                        <svg width="130" height="130" viewBox="0 0 100 100" fill="none" style={{ opacity: 0.7, color: 'var(--color-warning)' }}>
                          <path d="M50 15C35 15 25 25 25 45C25 60 30 75 42 83C45 85 47 88 47 90H53C53 88 55 85 58 83C70 75 75 60 75 45C75 25 65 15 50 15Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                          <ellipse cx="40" cy="42" rx="3" ry="1.5" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)' }} />
                          <ellipse cx="60" cy="42" rx="3" ry="1.5" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)', animationDelay: '0.4s' }} />
                          <path d="M48 50H52V58H48V50Z" fill="currentColor" style={{ opacity: 0.8 }} />
                          <path d="M42 68C46 71 54 71 58 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="50" cy="28" r="2" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)', animationDelay: '0.2s' }} />
                          <circle cx="28" cy="45" r="2" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)', animationDelay: '0.6s' }} />
                          <circle cx="72" cy="45" r="2" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)', animationDelay: '0.8s' }} />
                          <circle cx="35" cy="73" r="2" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)', animationDelay: '1s' }} />
                          <circle cx="65" cy="73" r="2" fill="currentColor" className="node-pulse-active" style={{ color: 'var(--color-warning)', animationDelay: '1.2s' }} />
                        </svg>

                        {/* Sweeping scanline */}
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, var(--color-warning), transparent)',
                          boxShadow: '0 0 12px var(--color-warning)',
                          left: 0,
                          zIndex: 5
                        }} className="face-laser-line" />

                        {/* Radar Target Overlay */}
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          border: '1px solid rgba(245, 158, 11, 0.08)',
                          borderRadius: '50%',
                          boxShadow: 'inset 0 0 30px rgba(245, 158, 11, 0.15)',
                          pointerEvents: 'none'
                        }} />
                      </div>
                    </div>
                  ) : (
                    /* MFA Fingerprint Scan Visual Mockup */
                    <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      {/* Concentric rotating HUD rings */}
                      <svg className="hud-ring-decor radar-sweep" viewBox="0 0 100 100" style={{ color: 'var(--color-primary)', opacity: 0.6 }}>
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="15 5 2 5" />
                      </svg>
                      <svg className="hud-ring-decor radar-sweep-reverse" viewBox="0 0 100 100" style={{ color: 'var(--color-primary)', opacity: 0.4 }}>
                        <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 8" />
                      </svg>
                      
                      {/* Circular fingerprint viewport */}
                      <div style={{
                        width: '220px',
                        height: '220px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '3px solid var(--color-primary)',
                        boxShadow: '0 0 25px rgba(0, 242, 254, 0.25)',
                        background: '#040508',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        {/* Fingerprint Ridge Loop SVG */}
                        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.75 }}>
                          <path d="M50 15 C30 15, 20 25, 20 45 C20 50, 22 55, 25 60 C28 65, 30 72, 30 80" />
                          <path d="M50 25 C37 25, 30 32, 30 45 C30 52, 34 58, 38 62 C42 66, 44 72, 44 80" strokeDasharray="1 1" />
                          <path d="M50 35 C42 35, 40 40, 40 45 C40 54, 48 56, 48 64 C48 70, 52 75, 54 80" />
                          <path d="M50 45 A 5 5 0 0 1 55 50 C 55 55, 58 58, 58 64 C 58 70, 62 74, 64 80" strokeDasharray="3 1" />
                          <path d="M50 5 C25 5, 10 18, 10 45 C10 60, 16 70, 20 80" />
                          <path d="M50 55 C52 55, 54 52, 54 48 C54 42, 60 38, 68 42 C72 44, 76 52, 76 60 C76 68, 80 74, 82 80" />
                          <path d="M60 22 C72 25, 80 32, 80 45 C80 52, 84 58, 88 64 C90 68, 90 74, 90 80" strokeWidth="1.5" />
                          
                          {/* Minutiae locks */}
                          <circle cx="50" cy="35" r="2.5" fill="var(--color-primary)" className="node-pulse-active" style={{ stroke: 'none' }} />
                          <circle cx="30" cy="45" r="2.5" fill="var(--color-primary)" className="node-pulse-active" style={{ stroke: 'none', animationDelay: '0.3s' }} />
                          <circle cx="40" cy="62" r="2.5" fill="var(--color-primary)" className="node-pulse-active" style={{ stroke: 'none', animationDelay: '0.6s' }} />
                          <circle cx="68" cy="42" r="2.5" fill="var(--color-primary)" className="node-pulse-active" style={{ stroke: 'none', animationDelay: '0.9s' }} />
                          <circle cx="76" cy="60" r="2.5" fill="var(--color-primary)" className="node-pulse-active" style={{ stroke: 'none', animationDelay: '1.2s' }} />
                        </svg>

                        {/* Sweeping scanline */}
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                          boxShadow: '0 0 12px var(--color-primary)',
                          left: 0,
                          zIndex: 5
                        }} className="fingerprint-laser-line" />

                        {/* Radar Target Overlay */}
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          border: '1px solid rgba(0, 242, 254, 0.08)',
                          borderRadius: '50%',
                          boxShadow: 'inset 0 0 30px rgba(0, 242, 254, 0.15)',
                          pointerEvents: 'none'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Circular scanning backdrop glow */}
                  <div style={{
                    position: 'absolute',
                    width: '230px',
                    height: '230px',
                    borderRadius: '50%',
                    background: biometricTab === 'face' ? 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }} />
                </div>

                {/* Right Column: HUD Telemetry Stats and Technical details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: biometricTab === 'face' ? 'var(--color-warning)' : 'var(--color-primary)',
                      letterSpacing: '0.1em',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {biometricTab === 'face' ? 'KYC / CUSTOMER ONBOARDING POSTURE' : 'MFA / TRANSACTION SECURITY POSTURE'}
                    </div>
                    <h3 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '12px' }}>
                      {biometricTab === 'face' ? 'Cinematic 3D Face Scanner' : 'Capacitive Fingerprint Sensor'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                      {biometricTab === 'face' 
                        ? 'Analyzes high-resolution optical video telemetry using a perfect-circle HUD reticle. Resolves facial coordinate geometries locally without storing raw camera footage.'
                        : 'Simulates a dual-pane hardware sensor flow mapping high-resolution capacitive ridges. Captures dermal minutiae and tissue checks directly inside the client enclave.'
                      }
                    </p>
                  </div>

                  {/* Parameters Table Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    {biometricTab === 'face' ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>INTER-PUPILLARY RATIO</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-warning)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>64.2mm (Verified)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FACIAL SYMMETRY INDEX</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-warning)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>98.6% (Consistent)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SKIN REFRACTION INDEX</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-warning)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1.42 (Natural Tissue)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LIVENESS & BLINK CHECK</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-secure)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>PASSED (Active)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CLASSIFIED PATTERN</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Whorl Ridge-Flow</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MINUTIAE LOCKED</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>84 Coordinate Nodes</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PORE DENSITY ALIGN</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>99.4% Sweat Mapping</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TISSUE CONDUCTIVITY</span>
                          <span style={{ fontSize: '15px', color: 'var(--color-secure)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1.4 mS (Living Epidermis)</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Cryptographic Proof footer note */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    borderLeft: biometricTab === 'face' ? '3px solid var(--color-warning)' : '3px solid var(--color-primary)',
                    padding: '8px 12px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>
                      {biometricTab === 'face'
                        ? 'Generates ZK-SNARK zero-knowledge proofs locally to verify face structures without exposing bio-templates.'
                        : 'WebAuthn authenticator assertion handshake signed directly inside the hardware Secure Enclave.'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Diagrammatic Section */}
            <section id="how-it-works" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '44px', fontFamily: 'var(--font-sans)', fontWeight: 800 }} className="title-gradient">
                  Dynamic Identity Trust Lifecycle
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginTop: '10px' }}>
                  A three-tier active security posture operating in real time.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '24px'
              }}>
                {[
                  { num: '01', phase: 'SIGNAL INGESTION', color: 'var(--color-primary)', title: 'Continuous Telemetry Influx', text: 'Client device agents collect contextual patterns (Interactive Keystroke Cadence, device hashes, live IP velocity) and securely mask them via Privacy Guard before transmission.' },
                  { num: '02', phase: 'RISK ASSESSMENT', color: 'var(--color-accent)', title: 'Explainable AI Evaluation', text: 'The Risk Engine calculates weighted deviations from the user\'s historical baseline. It outputs transparent Decision Rationale and logs all triggers to the Tamper-Proof Audit Ledger.' },
                  { num: '03', phase: 'ADAPTIVE ENFORCEMENT', color: 'var(--color-secondary)', title: 'Friction-Optimized Verification', text: 'Safe sessions require zero verification. High-risk anomaly indicators immediately launch our widescreen cinematic facial scanners or capacitive fingerprint challenges.' },
                ].map((step, i, arr) => (
                  <div key={step.num} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '32px', borderRight: i < arr.length - 1 ? '1px solid var(--border-color)' : undefined, borderRadius: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: step.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{step.num} / {step.phase}</div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)' }}>{step.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        ) : (
          /* ================= SIMULATOR VIEW ================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <div>
                <h1 style={{ fontSize: '40px', fontWeight: 800 }} className="title-gradient">Enterprise Security &amp; Trust Console</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '6px' }}>
                  Assess continuous authentication vectors and run automated threat scenarios in real time.
                </p>
              </div>
              
              <button onClick={() => setActiveView('landing')} className="cyber-button" style={{ fontSize: '14px', padding: '12px 20px' }}>
                 Return to Overview
              </button>
            </div>

            {/* Render full-width ConsoleDashboard */}
            <ConsoleDashboard onRiskChange={handleRiskChange} />

          </div>
        )}

      </main>

      {/* Futuristic Professional Footer */}
      <footer style={{
        marginTop: '60px',
        padding: '40px 32px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(3, 4, 8, 0.98)',
        textAlign: 'center',
        zIndex: 10,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            [SHIELD] PRISM ID - PRIVACY-FIRST RISK-BASED IDENTITY TRUST FRAMEWORK
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: '1.75' }}>
            This framework models a production-grade continuous authentication suite for banking systems. Built as a collaborative project, combining advanced behavioral analytics, cryptographic local-processing, and zero-trust principles to protect customer credentials and stop internal fraud vectors.
          </p>
          <div style={{ fontSize: '11px', color: 'var(--text-dark)', marginTop: '8px' }}>
            (c) {new Date().getFullYear()} PrismID Academic Initiative. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
