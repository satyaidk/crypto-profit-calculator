"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PreBuyResult {
  tokensToBuy: number
  totalCost: number
  pricePerToken: number
}

const PRE_BUY_STORAGE_KEY = "crypto_prebuy_inputs"

export function PreBuyCalculator() {
  const [tokenName, setTokenName] = useState("")
  const [preBuyTargetPrice, setPreBuyTargetPrice] = useState("")
  const [preBuyBudget, setPreBuyBudget] = useState("")
  const [preBuyResult, setPreBuyResult] = useState<PreBuyResult | null>(null)
  const [preBuyError, setPreBuyError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const savedPreBuy = localStorage.getItem(PRE_BUY_STORAGE_KEY)
    if (savedPreBuy) {
      try {
        const data = JSON.parse(savedPreBuy)
        setTokenName(data.tokenName || "")
        setPreBuyTargetPrice(data.targetPrice || "")
        setPreBuyBudget(data.budget || "")
      } catch (err) {
        console.error("Error loading pre-buy data:", err)
      }
    }
  }, [])

  // Save to local storage whenever inputs change
  useEffect(() => {
    const data = { tokenName, targetPrice: preBuyTargetPrice, budget: preBuyBudget }
    localStorage.setItem(PRE_BUY_STORAGE_KEY, JSON.stringify(data))
  }, [tokenName, preBuyTargetPrice, preBuyBudget])

  const calculatePreBuy = async () => {
    setPreBuyError(null)
    setPreBuyResult(null)

    if (!tokenName.trim()) {
      setPreBuyError("Please enter a token name")
      return
    }

    const targetPriceNum = Number.parseFloat(preBuyTargetPrice)
    const budgetNum = Number.parseFloat(preBuyBudget)

    if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
      setPreBuyError("Please enter a valid target buy price")
      return
    }

    if (isNaN(budgetNum) || budgetNum <= 0) {
      setPreBuyError("Please enter a valid budget amount")
      return
    }

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const tokensToBuy = budgetNum / targetPriceNum

    setPreBuyResult({
      tokensToBuy,
      totalCost: budgetNum,
      pricePerToken: targetPriceNum,
    })
    setIsCalculating(false)
  }

  const resetPreBuy = () => {
    setTokenName("")
    setPreBuyTargetPrice("")
    setPreBuyBudget("")
    setPreBuyResult(null)
    setPreBuyError(null)
    localStorage.removeItem(PRE_BUY_STORAGE_KEY)
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Pre-Buy Calculator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your purchase before the price drops. See how many tokens you can buy at your target price with your
            budget.
          </p>
        </div>

        {/* Pre-Buy Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="prebuy-token-name" className="text-foreground font-semibold">
              Token Name
            </Label>
            <Input
              id="prebuy-token-name"
              placeholder="e.g., solana, ethereum, bitcoin"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="prebuy-target-price" className="text-foreground font-semibold">
              Target Buy Price ($)
            </Label>
            <Input
              id="prebuy-target-price"
              type="number"
              placeholder="e.g., 175 (price you want to buy at)"
              value={preBuyTargetPrice}
              onChange={(e) => setPreBuyTargetPrice(e.target.value)}
              step="0.01"
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="prebuy-budget" className="text-foreground font-semibold">
              Budget (USD)
            </Label>
            <Input
              id="prebuy-budget"
              type="number"
              placeholder="e.g., 150 (amount you want to spend)"
              value={preBuyBudget}
              onChange={(e) => setPreBuyBudget(e.target.value)}
              step="0.01"
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Pre-Buy Error Message */}
        {preBuyError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg animate-slide-up">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{preBuyError}</p>
          </div>
        )}

        {/* Pre-Buy Action Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            onClick={calculatePreBuy}
            disabled={isCalculating}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin-slow"></div>
                Calculating...
              </span>
            ) : (
              "Calculate Pre-Buy"
            )}
          </Button>
          <Button
            onClick={resetPreBuy}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            Reset
          </Button>
        </div>

        {/* Pre-Buy Results Section */}
        {preBuyResult && (
          <div className="space-y-4 p-6 bg-secondary border border-border rounded-lg animate-slide-up">
            <h3 className="text-lg font-bold text-foreground">Pre-Buy Plan</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Price Per Token</p>
                <p className="text-2xl font-bold text-foreground">${preBuyResult.pricePerToken.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">${preBuyResult.totalCost.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-accent/10 border border-accent rounded-lg sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Tokens You Can Buy</p>
                <p className="text-3xl font-bold text-accent">{preBuyResult.tokensToBuy.toFixed(6)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-background border border-border rounded-lg text-sm text-foreground">
              <p>
                With a budget of <span className="font-semibold text-accent">${preBuyResult.totalCost.toFixed(2)}</span>{" "}
                at <span className="font-semibold text-accent">${preBuyResult.pricePerToken.toFixed(2)}</span> per
                token, you can buy{" "}
                <span className="font-semibold text-accent">{preBuyResult.tokensToBuy.toFixed(6)}</span> {tokenName}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
