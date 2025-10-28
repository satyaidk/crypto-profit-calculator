"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface WalletConnectorProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
  compact?: boolean
}

export function WalletConnector({ onConnect, onDisconnect, compact = false }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
        })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          onConnect(accounts[0])
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        setError("MetaMask or Web3 wallet not detected. Please install one.")
        setIsLoading(false)
        return
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const userAddress = accounts[0]
        setIsSigningIn(true)

        // Simulate signing process
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setAddress(userAddress)
        setIsConnected(true)
        setIsSigningIn(false)
        onConnect(userAddress)
      }
    } catch (err: any) {
      setIsSigningIn(false)
      if (err.code === 4001) {
        setError("Connection rejected by user")
      } else {
        setError("Failed to connect wallet")
      }
      console.error("Wallet connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setError(null)
    onDisconnect()
  }

  if (isSigningIn) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-border rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin-slow"></div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Confirming Transaction</p>
          <p className="text-sm text-muted-foreground">Please sign in your wallet...</p>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isConnected && address ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-border">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-muted-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <Button onClick={disconnectWallet} variant="outline" className="text-xs sm:text-sm bg-transparent">
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isConnected && address ? (
        <div className="space-y-4">
          <div className="p-4 bg-secondary border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Connected Wallet</p>
            <p className="text-sm font-mono text-foreground break-all font-semibold">{address}</p>
          </div>
          <Button onClick={disconnectWallet} variant="outline" className="w-full bg-transparent">
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Supports MetaMask and Web3-compatible wallets</p>
        </div>
      )}
    </div>
  )
}
