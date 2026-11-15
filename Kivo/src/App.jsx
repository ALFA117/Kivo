import { useState, useEffect } from 'react'
import { ConnectButton } from 'accesly'
import { useWallet } from './context/WalletContext'
import { useLanguage } from './context/LanguageContext'
import ThemeToggle from './components/ThemeToggle'
import { Icon, KivoMark } from './components/Icons'
import { useNetwork } from './context/NetworkContext'
import { EscrowModal }       from './components/EscrowModal'
import { EscrowDrawer }      from './components/EscrowDrawer'
import { RampPage }          from './components/Ramp/RampPage'
import { CreateOfferModal }  from './components/CreateOfferModal'
import './App.css'

// Sin estas llaves el botón de Accesly abre un popup roto y crear/financiar custodias
// falla contra la API de Trustless Work. En ese caso la página se presenta como demo.
const LIVE_ESCROW = Boolean(
  import.meta.env.VITE_ACCESLY_APP_ID &&
  import.meta.env.VITE_TRUSTLESS_API_KEY &&
  import.meta.env.VITE_KIVO_PLATFORM_ADDRESS
)
const REPO_URL = 'https://github.com/ALFA117/Kivo'

function shortenAddress(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const LANGUAGES = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'pt', label: 'PT', name: 'Português' },
]

const FLOW_ICONS  = ['handshake', 'wallet', 'lock', 'packageCheck']
const PILLAR_ICONS = ['fileCode', 'trendingUp', 'arrowLeftRight', 'message']
const GOAL_ICONS  = ['zap', 'gauge', 'home']
const FEES = [
  { plan: 'Starter', fee: '3%' },
  { plan: 'Growth', fee: '2.5%' },
  { plan: 'Enterprise', fee: 'Custom' },
]

function SectionHead({ idx, tag, title }) {
  return (
    <header className="sec-head" data-reveal>
      <p className="sec-label">
        <span className="sec-idx">{idx}</span>
        <span>{tag}</span>
      </p>
      <h2 className="sec-title">{title}</h2>
    </header>
  )
}

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
  const { network, toggleNetwork, mainnetEnabled } = useNetwork()

  const [showEscrow, setShowEscrow] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showRamp,   setShowRamp]   = useState(false)
  const [showOffer,  setShowOffer]  = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  const anyError = acceslyError || freighterError

  /* ── Barra con borde al hacer scroll ── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* ── Aparición al entrar en pantalla (solo si el usuario no pidió menos movimiento) ── */
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-visible'))
      return
    }
    document.documentElement.classList.add('js-reveal')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const quote = (() => {
    const idx = t.quote.indexOf(t.quoteHighlight)
    if (idx === -1) return t.quote
    return (
      <>
        {t.quote.substring(0, idx)}
        <mark>{t.quoteHighlight}</mark>
        {t.quote.substring(idx + t.quoteHighlight.length)}
      </>
    )
  })()

  return (
    <div className="app">

      {/* ── BARRA ── */}
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} aria-label="Kivo">
        <div className="navbar-inner">
          <a className="nav-brand" href="#top" aria-label="Kivo">
            <KivoMark size={22} />
            <span>Kivo</span>
          </a>

          <div className="nav-wallet">
            <span
              className="net-chip"
              title={mainnetEnabled ? undefined : 'Demo en Stellar testnet: no se mueve dinero real'}
            >
              <span className={`net-dot${network === 'mainnet' ? ' net-dot--main' : ''}`} />
              Stellar {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </span>
            {mainnetEnabled && (
              <button
                className="btn-network-toggle"
                onClick={toggleNetwork}
                title={network === 'testnet' ? 'Cambiar a Mainnet (USDC real)' : 'Cambiar a Testnet'}
              >
                {network === 'testnet' ? 'Mainnet' : 'Testnet'}
              </button>
            )}

            {!LIVE_ESCROW && (
              <span className="demo-chip">{t.demo.badge}</span>
            )}

            {LIVE_ESCROW && walletAddress && (
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

            {!LIVE_ESCROW ? null : freighterAddr ? (
              <div className="wallet-chip">
                <span className="status-dot" />
                <span className="wallet-addr">{shortenAddress(freighterAddr)}</span>
                <button className="btn-disconnect" onClick={disconnectFreighter} title={t.nav.disconnectFreighter} aria-label={t.nav.disconnectFreighter}>
                  <Icon name="x" size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                className="btn-connect-freighter"
                onClick={connectFreighter}
                disabled={freighterLoading}
                title={t.nav.connectFreighter}
              >
                {freighterLoading ? <span className="spinner" /> : <Icon name="wallet" size={15} />}
                Freighter
              </button>
            )}

            {LIVE_ESCROW && <ConnectButton />}

            <div className="nav-tools">
              <div className="lang-selector" role="group" aria-label="Idioma / Language">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`lang-btn${lang === l.code ? ' lang-btn--active' : ''}`}
                    onClick={() => setLang(l.code)}
                    title={l.name}
                    aria-label={l.name}
                    aria-pressed={lang === l.code}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {!LIVE_ESCROW && (
        <div className="demo-banner" role="note">
          <div className="demo-banner-inner">
            <Icon name="info" size={18} />
            <p>{t.demo.notice}</p>
          </div>
        </div>
      )}

      {anyError && (
        <div className="error-banner" role="alert">
          <div className="demo-banner-inner">
            <Icon name="circleX" size={18} />
            <p>{anyError}</p>
          </div>
        </div>
      )}

      <main id="main">
        {/* ── HERO ── */}
        <header className="hero" id="top">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-eyebrow">
                <span className="mono">{t.hero.eyebrow}</span>
                <span className="hero-eyebrow-sep" aria-hidden="true" />
                <span>Trustless Work · Soroban</span>
              </p>

              <h1 className="hero-title">
                {t.hero.title1}{' '}
                <span className="hero-title-2">{t.hero.title2}</span>
              </h1>

              <p className="hero-body">{t.hero.body}</p>

              <div className="hero-actions">
                {!LIVE_ESCROW ? (
                  <>
                    <a href="#flujo" className="btn-primary">
                      {t.demo.seeHow}
                      <Icon name="arrowDown" size={16} strokeWidth={2} />
                    </a>
                    <a href={REPO_URL} className="btn-ghost" target="_blank" rel="noopener noreferrer">
                      {t.demo.code}
                      <Icon name="arrowUpRight" size={16} strokeWidth={2} />
                    </a>
                  </>
                ) : walletAddress ? (
                  <>
                    <button className="btn-primary" onClick={() => setShowEscrow(true)}>
                      {t.hero.createEscrow}
                    </button>
                    <div className="connected-badge">
                      <span className="status-dot" />
                      <span className="mono">{shortenAddress(walletAddress)}</span>
                    </div>
                  </>
                ) : (
                  <button className="btn-primary" onClick={connectAccesly} disabled={acceslyLoading}>
                    {acceslyLoading ? <><span className="spinner" /> {t.hero.connecting}</> : t.hero.startNow}
                  </button>
                )}
                {LIVE_ESCROW && <a href="#vision" className="btn-ghost">{t.hero.seeMore}</a>}
              </div>
            </div>

            {/* Esquema del ciclo de una custodia: explica el producto, no simula datos */}
            <aside className="flow-card" id="flujo" aria-labelledby="flow-title">
              <div className="flow-card-head">
                <h2 id="flow-title">{t.flow.title}</h2>
                <span className="flow-card-kind mono">single-release</span>
              </div>
              <ol className="flow-list">
                {t.flow.steps.map((s, i) => (
                  <li key={s.title} className={`flow-item${i === 2 ? ' flow-item--key' : ''}`}>
                    <span className="flow-icon"><Icon name={FLOW_ICONS[i]} size={18} /></span>
                    <div>
                      <p className="flow-item-title">
                        <span className="mono flow-item-n">{String(i + 1).padStart(2, '0')}</span>
                        {s.title}
                      </p>
                      <p className="flow-item-body">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="flow-card-note">{t.flow.note}</p>
            </aside>
          </div>
        </header>

        {/* ── FRANJA DE BASES ── */}
        <div className="trust-strip">
          <ul className="trust-strip-inner">
            {t.trust.map((label, i) => (
              <li key={label}>
                <span className="mono trust-n">{String(i + 1).padStart(2, '0')}</span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* ── 01 · QUÉ ES ── */}
        <section id="vision" className="sec">
          <div className="sec-inner sec-split">
            <SectionHead idx="01" tag={t.vision.tag} title={t.vision.title} />
            <div className="vision-text" data-reveal>
              <p className="lead">{t.vision.p1}</p>
              <p className="body-text">{t.vision.p2}</p>
            </div>
          </div>
        </section>

        {/* ── 02 · PROBLEMA ── */}
        <section className="sec sec--tint">
          <div className="sec-inner">
            <SectionHead idx="02" tag={t.problem.tag} title={t.problem.title} />
            <div className="problem-grid" data-reveal>
              <article className="problem-item">
                <span className="icon-tile"><Icon name="shieldCheck" size={20} /></span>
                <h3>{t.problem.card1Title}</h3>
                <p>{t.problem.card1Body}</p>
              </article>
              <article className="problem-item">
                <span className="icon-tile"><Icon name="clock" size={20} /></span>
                <h3>{t.problem.card2Title}</h3>
                <p>{t.problem.card2Body}</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── 03 · ARQUITECTURA ── */}
        <section className="sec">
          <div className="sec-inner">
            <SectionHead idx="03" tag={t.arch.tag} title={t.arch.title} />
            <div className="bento" data-reveal>
              {t.arch.pillars.map((p, i) => (
                <article className={`pillar pillar--${i + 1}`} key={p.n}>
                  <div className="pillar-top">
                    <span className="icon-tile"><Icon name={PILLAR_ICONS[i]} size={20} /></span>
                    <span className="mono pillar-n">{p.n}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p className="pillar-sub mono">{p.sub}</p>
                  <p className="pillar-body">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 04 · MODELO DE NEGOCIO ── */}
        <section className="sec sec--tint">
          <div className="sec-inner">
            <SectionHead idx="04" tag={t.bmc.tag} title={t.bmc.title} />
            <div className="bmc-layout" data-reveal>
              <dl className="bmc-table">
                {t.bmc.blocks.map(b => (
                  <div className="bmc-row" key={b.title}>
                    <dt>{b.title}</dt>
                    <dd>
                      <ul>{b.items.map(item => <li key={item}>{item}</li>)}</ul>
                    </dd>
                  </div>
                ))}
              </dl>

              <aside className="ledger" aria-label={t.bmc.financial}>
                <h3>{t.bmc.financial}</h3>
                <p className="ledger-label">{t.bmc.txFees}</p>
                <table className="fee-table">
                  <caption className="sr-only">{t.sections.fees}</caption>
                  <tbody>
                    {FEES.map(f => (
                      <tr key={f.plan}>
                        <th scope="row">{f.plan}</th>
                        <td className="mono">{f.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="ledger-note">{t.bmc.floatNote}</p>
                <p className="ledger-label">{t.bmc.costStructure}</p>
                <ul className="cost-list">
                  {t.bmc.costs.map(c => <li key={c}>{c}</li>)}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        {/* ── 05 · OBJETIVOS ── */}
        <section className="sec">
          <div className="sec-inner">
            <SectionHead idx="05" tag={t.goals.tag} title={t.goals.title} />
            <ul className="goals" data-reveal>
              {t.goals.items.map((g, i) => (
                <li className="goal" key={g.title}>
                  <span className="goal-icon"><Icon name={GOAL_ICONS[i]} size={22} /></span>
                  <h3>{g.title}</h3>
                  <p>{g.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CITA ── */}
        <section className="quote-section">
          <div className="sec-inner">
            <blockquote className="quote" data-reveal>
              <p>{quote}</p>
            </blockquote>
          </div>
        </section>
      </main>

      {/* ── PIE ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <KivoMark size={18} />
            <span className="footer-copy">{t.footer}</span>
          </div>
          <div className="footer-links">
            <span className="footer-badge"><span className="net-dot" /> Stellar {network === 'mainnet' ? 'mainnet' : 'testnet'}</span>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
              {t.sections.repo}
              <Icon name="arrowUpRight" size={14} strokeWidth={2} />
            </a>
          </div>
        </div>
      </footer>

      {/* ── MODALES ── */}
      {showRamp   && <RampPage onClose={() => setShowRamp(false)} />}
      {showOffer  && <CreateOfferModal onClose={() => setShowOffer(false)} />}
      {showEscrow && <EscrowModal walletAddress={walletAddress} onClose={() => setShowEscrow(false)} />}
      {showDrawer && <EscrowDrawer walletAddress={walletAddress} onClose={() => setShowDrawer(false)} />}
    </div>
  )
}
