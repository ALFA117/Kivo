import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NetworkProvider, useNetwork } from './NetworkContext'

function NetworkDisplay() {
  const { network, toggleNetwork } = useNetwork()
  return (
    <div>
      <span data-testid="network">{network}</span>
      <button onClick={toggleNetwork}>Toggle</button>
    </div>
  )
}

describe('NetworkContext', () => {
  it('defaults to testnet', () => {
    render(<NetworkProvider><NetworkDisplay /></NetworkProvider>)
    expect(screen.getByTestId('network').textContent).toBe('testnet')
  })

  it('toggles to mainnet', () => {
    render(<NetworkProvider><NetworkDisplay /></NetworkProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('network').textContent).toBe('mainnet')
  })

  it('toggles back to testnet', () => {
    render(<NetworkProvider><NetworkDisplay /></NetworkProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('network').textContent).toBe('testnet')
  })
})
