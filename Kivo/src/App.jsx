import { useState, useEffect } from 'react'
import { ConnectButton } from 'accesly'
import { useWallet } from './context/WalletContext'
import { useLanguage } from './context/LanguageContext'
import { useNetwork } from './context/NetworkContext'
import { EscrowModal }       from './components/EscrowModal'
import { EscrowDrawer }      from './components/EscrowDrawer'
import { RampPage }          from './components/Ramp/RampPage'
import { CreateOfferModal }  from './components/CreateOfferModal'
import './App.css'

function shortenAddress(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const LANGUAGES = [
  { code: 'es', label: 'ES', flag: '🇲🇽' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
]

const HexIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polygon points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5" stroke="var(--gold)" strokeWidth="1.5" fill="none"/>
    <circle cx="10" cy="10" r="2.5" fill="var(--gold)" opacity="0.7"/>
  </svg>
)

export default function App() {
  const {
    walletAddress,
    connectAccesly,
    acceslyLoading,
    acceslyError,
    freighterAddr,
    freighterLoading,
    freighterError,
    connectFreighter,
    disconnectFreighter,
  } = useWallet()

  const { lang, setLang, t } = useLanguage()
  const { network, toggleNetwork } = useNetwork()

  const [showEscrow, setShowEscrow] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showRamp,   setShowRamp]   = useState(false)
  const [showOffer,  setShowOffer]  = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  const anyError = acceslyError || freighterError

  /* ── Navbar scroll effect ── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* ── Scroll reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app">

      {/* ── NAVBAR ── */}
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="nav-brand">
          <HexIcon size={22} />
          <span>Kivo</span>
        </div>

        <div className="nav-wallet">
          <div className="lang-selector">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`lang-btn${lang === l.code ? ' lang-btn--active' : ''}`}
                onClick={() => setLang(l.code)}
                title={l.label}
              >
                <span className="lang-flag">{l.flag}</span>
                <span className="lang-label">{l.label}</span>
              </button>
            ))}
          </div>

          <button
            className={`btn-network-toggle${network === 'mainnet' ? ' btn-network-toggle--mainnet' : ''}`}
            onClick={toggleNetwork}
            title={network === 'testnet' ? 'Cambiar a Mainnet' : 'Cambiar a Testnet'}
          >
            <span className="network-dot" />
            {network === 'testnet' ? 'Testnet' : 'Mainnet'}
          </button>

          {walletAddress && (
            <>
              {network === 'testnet' && (
                <button className="btn-my-escrows" onClick={() => setShowRamp(true)}>
                  {t.nav.ramp}
                </button>
              )}
              <button className="btn-my-escrows" onClick={() => setShowOffer(true)}>
                {t.offer?.navBtn || 'Vender'}
              </button>
              <button className="btn-my-escrows btn-my-escrows--primary" onClick={() => setShowDrawer(true)}>
                {t.nav.myEscrows}
              </button>
            </>
          )}

          {freighterAddr ? (
            <div className="wallet-chip">
              <span className="status-dot" />
              <span className="wallet-addr">{shortenAddress(freighterAddr)}</span>
              <button className="btn-disconnect" onClick={disconnectFreighter} title={t.nav.disconnectFreighter}>✕</button>
            </div>
          ) : (
            <button
              className="btn-connect-freighter"
              onClick={connectFreighter}
              disabled={freighterLoading}
              title={t.nav.connectFreighter}
            >
              {freighterLoading
                ? <span className="spinner" />
                : <svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M16 3L29 10v12L16 29 3 22V10z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="16" cy="16" r="4" fill="currentColor"/></svg>
              }
              Freighter
            </button>
          )}

          <ConnectButton />
        </div>
      </nav>

      {anyError && <div className="error-banner">{anyError}</div>}

      {/* ── HERO ── */}
      <header className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb--gold" />
          <div className="hero-orb hero-orb--teal" />
          <div className="hero-orb hero-orb--mid" />
        </div>

        <p className="hero-eyebrow">
          <span className="eyebrow-dot" />
          {t.hero.eyebrow}
        </p>

        <h1 className="hero-title">
          {t.hero.title1}<br />
          <span className="text-gold">{t.hero.title2}</span>
        </h1>

        <p className="hero-body">{t.hero.body}</p>

        <div className="hero-actions">
          {walletAddress ? (
            <>
              <button className="btn-primary" onClick={() => setShowEscrow(true)}>
                {t.hero.createEscrow}
              </button>
              <div className="connected-badge">
                <span className="status-dot" />
                {shortenAddress(walletAddress)}
              </div>
            </>
          ) : (
            <button className="btn-primary" onClick={connectAccesly} disabled={acceslyLoading}>
              {acceslyLoading ? t.hero.connecting : t.hero.startNow}
            </button>
          )}
          <a href="#vision" className="btn-ghost">{t.hero.seeMore}</a>
        </div>

        {/* Trust strip */}
        <div className="hero-trust">
          <div className="hero-trust-item">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><polygon points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            Stellar Network
          </div>
          <span className="hero-trust-sep" />
          <div className="hero-trust-item">USDC Nativo</div>
          <span className="hero-trust-sep" />
          <div className="hero-trust-item">Sin Intermediarios</div>
          <span className="hero-trust-sep" />
          <div className="hero-trust-item">Open Source</div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" aria-hidden="true">
          <span className="scroll-arrow" />
        </div>
      </header>

      {/* ── VISIÓN ── */}
      <section id="vision" className="section" data-reveal data-number="01">
        <span className="tag">{t.vision.tag}</span>
        <h2>{t.vision.title}</h2>
        <p className="body-text">{t.vision.p1}</p>
        <p className="body-text">{t.vision.p2}</p>
      </section>

      <div className="section-divider" />

      {/* ── PROBLEMA ── */}
      <section className="section section-alt">
        <div data-reveal>
          <span className="tag">{t.problem.tag}</span>
          <h2>{t.problem.title}</h2>
        </div>
        <div className="two-col">
          <div className="card" data-reveal data-delay="0">
            <div className="card-icon teal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>{t.problem.card1Title}</h3>
            <p>{t.problem.card1Body}</p>
          </div>
          <div className="card" data-reveal data-delay="150">
            <div className="card-icon gold-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3>{t.problem.card2Title}</h3>
            <p>{t.problem.card2Body}</p>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── ARQUITECTURA ── */}
      <section className="section" data-number="02">
        <div data-reveal>
          <span className="tag">{t.arch.tag}</span>
          <h2>{t.arch.title}</h2>
        </div>
        <div className="four-col">
          {t.arch.pillars.map((p, i) => (
            <div className="pillar" key={p.n} data-reveal data-delay={`${i * 100}`}>
              <span className="pillar-n">{p.n}</span>
              <h3>{p.title}</h3>
              <p className="pillar-sub">{p.sub}</p>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ── MODELO DE NEGOCIO ── */}
      <section className="section section-alt">
        <div data-reveal>
          <span className="tag">{t.bmc.tag}</span>
          <h2>{t.bmc.title}</h2>
        </div>

        <div className="four-col bmc">
          {t.bmc.blocks.map((b, i) => (
            <div className="bmc-block" key={b.title} data-reveal data-delay={`${i * 80}`}>
              <h4>{b.title}</h4>
              <ul>{b.items.map(item => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>

        <div className="revenue-block" data-reveal>
          <h3>{t.bmc.financial}</h3>
          <div className="revenue-grid">
            <div>
              <p className="rev-label">{t.bmc.txFees}</p>
              <div className="fee-list">
                <div className="fee-item">
                  <span>Starter</span>
                  <span className="fee-num">3%</span>
                </div>
                <div className="fee-item">
                  <span>Growth</span>
                  <span className="fee-num">2.5%</span>
                </div>
                <div className="fee-item">
                  <span>Enterprise</span>
                  <span className="fee-num fee-custom">Custom</span>
                </div>
              </div>
              <p className="rev-note">{t.bmc.floatNote}</p>
            </div>
            <div>
              <p className="rev-label">{t.bmc.costStructure}</p>
              <ul className="cost-list">
                {t.bmc.costs.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── OBJETIVOS ── */}
      <section className="section" data-number="03">
        <div data-reveal>
          <span className="tag">{t.goals.tag}</span>
          <h2>{t.goals.title}</h2>
        </div>
        <div className="three-col">
          {t.goals.items.map((g, i) => (
            <div className="goal-card" key={g.title} data-reveal data-delay={`${i * 100}`}>
              <div className="goal-icon">{g.icon}</div>
              <h3>{g.title}</h3>
              <p>{g.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="quote-section" data-reveal>
        <div className="quote-mark" aria-hidden="true">"</div>
        <blockquote>
          {(() => {
            const idx = t.quote.indexOf(t.quoteHighlight)
            if (idx === -1) return t.quote
            return (
              <>
                {t.quote.substring(0, idx)}
                <span className="text-gold">{t.quoteHighlight}</span>
                {t.quote.substring(idx + t.quoteHighlight.length)}
              </>
            )
          })()}
        </blockquote>
        <div className="quote-line" aria-hidden="true" />
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <HexIcon size={16} />
            <span>Kivo</span>
          </div>
          <p className="footer-copy">{t.footer}</p>
          <div className="footer-badges">
            <span className="footer-badge">Stellar Hackathon 2026</span>
            <span className="footer-badge footer-badge--teal">Built on Stellar</span>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {showRamp   && <RampPage onClose={() => setShowRamp(false)} />}
      {showOffer  && <CreateOfferModal onClose={() => setShowOffer(false)} />}
      {showEscrow && <EscrowModal walletAddress={walletAddress} onClose={() => setShowEscrow(false)} />}
      {showDrawer && <EscrowDrawer walletAddress={walletAddress} onClose={() => setShowDrawer(false)} />}

    </div>
  )
}
