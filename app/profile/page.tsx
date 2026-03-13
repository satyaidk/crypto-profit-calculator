"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  getUserProfile,
  getSavedCalculations,
  deleteSavedCalculation,
  clearAllSavedCalculations,
} from "@/lib/user-storage"

export default function ProfilePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [savedCalculations, setSavedCalculations] = useState<any[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectedCalculation, setSelectedCalculation] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      const userProfile = getUserProfile(walletAddress)
      setProfile(userProfile)
      const calculations = getSavedCalculations(walletAddress)
      setSavedCalculations(calculations)
    }
  }, [walletAddress])

  if (!mounted) return null

  const handleDeleteCalculation = (id: string) => {
    if (walletAddress) {
      deleteSavedCalculation(walletAddress, id)
      setSavedCalculations(getSavedCalculations(walletAddress))
      setSelectedCalculation(null)
    }
  }

  const handleClearAll = () => {
    if (walletAddress) {
      clearAllSavedCalculations(walletAddress)
      setSavedCalculations([])
      setShowClearConfirm(false)
    }
  }

  const renderCalculationDetails = (calc: any) => {
    if (calc.type === "profit") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Token Name</p>
              <p className="text-lg font-bold text-foreground">{calc.data.tokenName}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Holdings</p>
              <p className="text-lg font-bold text-foreground">{calc.data.holdings}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Current Price</p>
              <p className="text-lg font-bold text-foreground">${Number(calc.data.currentPrice).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Target Price</p>
              <p className="text-lg font-bold text-foreground">${Number(calc.data.targetPrice).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Results</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Current Value</p>
                <p className="text-2xl font-bold text-foreground">${calc.result.currentValue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Future Value</p>
                <p className="text-2xl font-bold text-foreground">${calc.result.futureValue.toFixed(2)}</p>
              </div>
              <div
                className={`p-4 rounded-lg border ${calc.result.profit >= 0 ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"}`}
              >
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Profit/Loss</p>
                <p
                  className={`text-2xl font-bold ${calc.result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  ${calc.result.profit.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${calc.result.percentageGain >= 0 ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"}`}
              >
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Percentage Gain</p>
                <p
                  className={`text-2xl font-bold ${calc.result.percentageGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {calc.result.percentageGain.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (calc.type === "swap") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">From Token</p>
              <p className="text-lg font-bold text-foreground">{calc.data.fromToken}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">To Token</p>
              <p className="text-lg font-bold text-foreground">{calc.data.toToken}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">From Price</p>
              <p className="text-lg font-bold text-foreground">${Number(calc.data.fromPrice).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">To Price</p>
              <p className="text-lg font-bold text-foreground">${Number(calc.data.toPrice).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Swap Results</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">You Send</p>
                <p className="text-lg font-bold text-foreground">
                  {calc.result.fromAmount.toFixed(6)} {calc.result.fromToken.toUpperCase()}
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">You Receive</p>
                <p className="text-lg font-bold text-accent">
                  {calc.result.toAmount.toFixed(6)} {calc.result.toToken.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg mt-4">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Exchange Rate</p>
              <p className="text-lg font-bold text-foreground">
                1 {calc.result.fromToken.toUpperCase()} = {calc.result.exchangeRate.toFixed(6)}{" "}
                {calc.result.toToken.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )
    } else if (calc.type === "prebuy") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Token Name</p>
              <p className="text-lg font-bold text-foreground">{calc.data.tokenName}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Target Buy Price</p>
              <p className="text-lg font-bold text-foreground">${Number(calc.data.targetPrice).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Budget</p>
              <p className="text-lg font-bold text-foreground">${Number(calc.data.budget).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Pre-Buy Results</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Tokens You Can Buy</p>
                <p className="text-2xl font-bold text-accent">{calc.result.tokensToBuy.toFixed(6)}</p>
              </div>
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Price Per Token</p>
                <p className="text-lg font-bold text-foreground">${calc.result.pricePerToken.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar
        walletAddress={walletAddress}
        isConnected={isConnected}
        onConnect={(address) => {
          setWalletAddress(address)
          setIsConnected(true)
        }}
        onDisconnect={() => {
          setWalletAddress(null)
          setIsConnected(false)
        }}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {isConnected && walletAddress ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Card */}
            <Card className="bg-card border-border">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-6 mb-6">
                  {profile?.pfpUrl ? (
                    <img
                      src={profile.pfpUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground border-2 border-border">
                      {profile?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{profile?.name || "User"}</h1>
                    <p className="text-sm text-muted-foreground font-mono mt-1">{walletAddress}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Saved Calculations */}
            <Card className="bg-card border-border">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Saved Calculations</h2>
                  {savedCalculations.length > 0 && (
                    <Button
                      onClick={() => setShowClearConfirm(true)}
                      variant="outline"
                      className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {showClearConfirm && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg mb-6">
                    <p className="text-red-600 dark:text-red-400 mb-4">
                      Are you sure you want to clear all saved calculations?
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white">
                        Yes, Clear All
                      </Button>
                      <Button onClick={() => setShowClearConfirm(false)} variant="outline" className="border-border">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {savedCalculations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No saved calculations yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedCalculations.map((calc) => (
                      <div
                        key={calc.id}
                        className="p-4 bg-secondary border border-border rounded-lg flex items-center justify-between hover:bg-secondary/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedCalculation(calc)}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{calc.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(calc.createdAt).toLocaleDateString()} - {calc.type.toUpperCase()}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCalculation(calc.id)
                          }}
                          variant="outline"
                          className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card className="bg-card border-border">
              <div className="p-8 text-center space-y-4">
                <div className="text-5xl">🔐</div>
                <p className="text-muted-foreground">Connect your wallet to view your profile</p>
                <p className="text-xs text-muted-foreground">Use the Connect button in the top right to get started</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {selectedCalculation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-card border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedCalculation.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedCalculation.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCalculation(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              {renderCalculationDetails(selectedCalculation)}

              <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    handleDeleteCalculation(selectedCalculation.id)
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
                <Button onClick={() => setSelectedCalculation(null)} variant="outline" className="flex-1 border-border">
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}
