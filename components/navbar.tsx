"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WalletConnector } from "@/components/wallet-connector"
import { ProfileDropdown } from "@/components/profile-dropdown"

interface NavbarProps {
  walletAddress: string | null
  isConnected: boolean
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export function Navbar({ walletAddress, isConnected, onConnect, onDisconnect }: NavbarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              ₿
            </div>
            <span className="hidden sm:inline">CryptoCalc</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <Link href="/">
              <Button variant={isActive("/") ? "default" : "ghost"} className="text-xs sm:text-sm">
                Profit
              </Button>
            </Link>
            <Link href="/swap">
              <Button variant={isActive("/swap") ? "default" : "ghost"} className="text-xs sm:text-sm">
                Swap
              </Button>
            </Link>
            <Link href="/pre-buy">
              <Button variant={isActive("/pre-buy") ? "default" : "ghost"} className="text-xs sm:text-sm">
                Pre-Buy
              </Button>
            </Link>
          </div>

          {/* Profile or Wallet Connector */}
          <div className="flex-shrink-0">
            {isConnected && walletAddress ? (
              <ProfileDropdown walletAddress={walletAddress} onDisconnect={onDisconnect} />
            ) : (
              <WalletConnector onConnect={onConnect} onDisconnect={onDisconnect} compact={true} />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
