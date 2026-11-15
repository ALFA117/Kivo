import { useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useLanguage } from '../context/LanguageContext'
import { useEscrowFlow } from '../hooks/useEscrowFlow'
import { Icon, KivoMark } from '../components/Icons'
import { AcceslyConnect } from '../components/AcceslyConnect'
import { useNetwork } from '../context/NetworkContext'
import { LIVE_ESCROW } from '../config'

function shortenAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function BuyPage() {
  const params   = new URLSearchParams(window.location.search)
  const seller   = params.get('seller')   || ''
  const amount   = params.get('amount')   || '0'
  const title    = params.get('title')    || 'Oferta'
  const desc     = params.get('desc')     || title
  // Nunca cae en el vendedor por defecto: sería su propio árbitro en una
  // disputa. Sin un resolver explícito en el link, cae en la dirección de
  // plataforma (neutral) si está configurada; si no, se bloquea el pago.
  const resolver = params.get('resolver') || import.meta.env.VITE_KIVO_PLATFORM_ADDRESS || ''
  const langParam = params.get('lang')

  const { t, setLang } = useLanguage()
  const b = t.buy

  // Aplica el idioma del vendedor al abrir la página
  useEffect(() => {
    if (langParam && ['es', 'en', 'pt'].includes(langParam)) {
      setLang(langParam)
    }
  }, [langParam, setLang])

  const {
    walletAddress,
    connectFreighter,
    freighterLoading,
    freighterAddr,
    disconnectFreighter,
  } = useWallet()

  const { createEscrow, loading, error, result } = useEscrowFlow()
  const { network } = useNetwork()
  const netName = `Stellar ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`
  const steps = [b.step1, b.step2, b.step3]

  async function handleBuy() {
    if (!walletAddress) return
    await createEscrow(
      {
        title,
        description:     desc,
        milestoneDesc:   desc,
        serviceProvider: seller,
        receiver:        seller,
        disputeResolver: resolver,
        amount,
        platformFee:     '1',
      },
      walletAddress,
    )
  }

  /* ── Éxito ── */
  if (result?.contractId !== undefined) {
    return (
      <div className="app bp">
        <BuyNav netName={netName} network={network} freighterAddr={freighterAddr} freighterLoading={freighterLoading} connectFreighter={connectFreighter} disconnectFreighter={disconnectFreighter} />
        <BuyNotice network={network} t={t} />
        <main className="bp-main">
          <section className="bp-card" aria-labelledby="bp-done">
            <div className="bp-done-head">
              <span className="bp-done-icon"><Icon name="circleCheck" size={22} strokeWidth={2} /></span>
              <div>
                <h1 id="bp-done" className="bp-title">{b.successTitle}</h1>
                <p className="bp-desc">{b.successSub}</p>
              </div>
            </div>
            {result.contractId && (
              <div className="bp-contract">
                <span className="bp-label">Contract ID</span>
                <code className="bp-mono bp-contract-id">{result.contractId}</code>
              </div>
            )}
            <ol className="bp-steps">
              <li><span className="bp-step-n">01</span>{b.successStep1}</li>
              <li><span className="bp-step-n">02</span><span>{b.successStep2} <span className="bp-mono">{amount} USDC</span></span></li>
              <li><span className="bp-step-n">03</span>{b.successStep3}</li>
            </ol>
          </section>
        </main>
      </div>
    )
  }

  /* ── Formulario de compra ── */
  return (
    <div className="app bp">
      <BuyNav
        netName={netName}
        network={network}
        freighterAddr={freighterAddr}
        freighterLoading={freighterLoading}
        connectFreighter={connectFreighter}
        disconnectFreighter={disconnectFreighter}
      />
      <BuyNotice network={network} t={t} />

      <main className="bp-main">
        <section className="bp-card" aria-labelledby="bp-title">
          <header className="bp-head">
            <p className="bp-tag">
              <Icon name="shieldCheck" size={16} />
              {b.tag}
            </p>
            <h1 id="bp-title" className="bp-title">{title}</h1>
            {desc !== title && <p className="bp-desc">{desc}</p>}
          </header>

          <dl className="bp-ledger">
            <div className="bp-row bp-row--amount">
              <dt className="bp-label">{b.amountLabel}</dt>
              <dd className="bp-amount bp-mono">{amount} <span>USDC</span></dd>
            </div>
            <div className="bp-row">
              <dt className="bp-label">{b.sellerLabel}</dt>
              <dd><code className="bp-mono" title={seller}>{shortenAddress(seller)}</code></dd>
            </div>
            <div className="bp-row">
              <dt className="bp-label">{b.networkLabel}</dt>
              <dd className="bp-net">
                <span className={`net-dot${network === 'mainnet' ? ' net-dot--main' : ''}`} />
                {netName}
              </dd>
            </div>
          </dl>

          <div className="bp-how">
            <p className="bp-label">{b.stepsTitle}</p>
            <ol className="bp-steps">
              {steps.map((s, i) => (
                <li key={i}><span className="bp-step-n">{String(i + 1).padStart(2, '0')}</span>{s}</li>
              ))}
            </ol>
          </div>

          {error && <div className="modal-error" role="alert">{error}</div>}

          {!LIVE_ESCROW ? (
            <div className="bp-actions">
              <button className="btn-primary bp-buy" disabled>
                <Icon name="lock" size={16} strokeWidth={2} />
                {b.buyBtn} {amount} USDC
              </button>
            </div>
          ) : walletAddress ? (
            <div className="bp-actions">
              <div className="bp-wallet">
                <span className="status-dot" />
                <span className="bp-label">{b.yourWallet}</span>
                <code className="bp-mono">{shortenAddress(walletAddress)}</code>
              </div>
              <button
                className="btn-primary bp-buy"
                onClick={handleBuy}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" /> {b.buying}</>
                  : `${b.buyBtn} ${amount} USDC`
                }
              </button>
            </div>
          ) : (
            <div className="bp-actions">
              <p className="bp-hint">{b.connectHint}</p>
              <div className="bp-connect">
                <button className="btn-connect-freighter bp-connect-btn" onClick={connectFreighter} disabled={freighterLoading}>
                  {freighterLoading ? <span className="spinner" /> : <Icon name="wallet" size={16} />}
                  Freighter
                </button>
                <AcceslyConnect block />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

/* ── Aviso de red / demo: el comprador llega por enlace y debe verlo ── */
function BuyNotice({ network, t }) {
  if (!LIVE_ESCROW) {
    return (
      <div className="demo-banner" role="note">
        <div className="demo-banner-inner">
          <Icon name="info" size={18} />
          <p>{t.demo.buyNoticeDemo}</p>
        </div>
      </div>
    )
  }
  if (network !== 'testnet') return null
  return (
    <div className="bp-notice" role="note">
      <div className="demo-banner-inner">
        <Icon name="info" size={18} />
        <p>{t.demo.buyNotice}</p>
      </div>
    </div>
  )
}

/* ── Barra ── */
function BuyNav({ netName, network, freighterAddr, freighterLoading, connectFreighter, disconnectFreighter }) {
  const { t } = useLanguage()
  return (
    <nav className="navbar navbar--scrolled" aria-label="Kivo">
      <div className="navbar-inner bp-nav">
        <a className="nav-brand" href="/" aria-label="Kivo">
          <KivoMark size={22} />
          <span>Kivo</span>
        </a>
        <div className="bp-nav-right">
          <span className="net-chip">
            <span className={`net-dot${network === 'mainnet' ? ' net-dot--main' : ''}`} />
            {netName}
          </span>
          {!LIVE_ESCROW && <span className="demo-chip">{t.demo.badge}</span>}
          {LIVE_ESCROW && (freighterAddr ? (
            <div className="wallet-chip">
              <span className="status-dot" />
              <span className="wallet-addr">{freighterAddr.slice(0, 6)}…{freighterAddr.slice(-4)}</span>
              <button className="btn-disconnect" onClick={disconnectFreighter} aria-label={t.nav.disconnectFreighter}><Icon name="x" size={14} strokeWidth={2} /></button>
            </div>
          ) : (
            <button className="btn-connect-freighter bp-nav-wallet" onClick={connectFreighter} disabled={freighterLoading} title={t.nav.connectFreighter}>
              {freighterLoading ? <span className="spinner" /> : <Icon name="wallet" size={15} />}
              Freighter
            </button>
          ))}
          {LIVE_ESCROW && <span className="bp-nav-wallet"><AcceslyConnect /></span>}
        </div>
      </div>
    </nav>
  )
}
