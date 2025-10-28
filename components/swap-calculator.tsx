"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SwapResult {
  fromAmount: number
  fromToken: string
  toAmount: number
  toToken: string
  exchangeRate: number
}

const STORAGE_KEY = "crypto_swap_inputs"

export function SwapCalculator() {
  const [fromToken, setFromToken] = useState("")
  const [toToken, setToToken] = useState("")
  const [fromAmount, setFromAmount] = useState("")
  const [fromPrice, setFromPrice] = useState("")
  const [toPrice, setToPrice] = useState("")
  const [result, setResult] = useState<SwapResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFromToken(data.fromToken || "")
        setToToken(data.toToken || "")
        setFromAmount(data.fromAmount || "")
        setFromPrice(data.fromPrice || "")
        setToPrice(data.toPrice || "")
      } catch (err) {
        console.error("Error loading saved data:", err)
      }
    }
  }, [])

  useEffect(() => {
    const data = { fromToken, toToken, fromAmount, fromPrice, toPrice }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [fromToken, toToken, fromAmount, fromPrice, toPrice])

  const fetchTokenPrices = async () => {
    if (!fromToken.trim() || !toToken.trim()) {
      setError("Please enter both token names")
      return
    }

    setIsLoadingPrice(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromToken.toLowerCase()},${toToken.toLowerCase()}&vs_currencies=usd`,
      )
      const data = await response.json()

      if (data[fromToken.toLowerCase()]?.usd && data[toToken.toLowerCase()]?.usd) {
        setFromPrice(data[fromToken.toLowerCase()].usd.toString())
        setToPrice(data[toToken.toLowerCase()].usd.toString())
      } else {
        setError("One or both tokens not found. Please check the names.")
      }
    } catch (err) {
      setError("Failed to fetch token prices. Please try again.")
      console.error("Price fetch error:", err)
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const calculateSwap = async () => {
    setError(null)
    setResult(null)

    if (!fromToken.trim() || !toToken.trim()) {
      setError("Please enter both token names")
      return
    }

    const fromAmountNum = Number.parseFloat(fromAmount)
    const fromPriceNum = Number.parseFloat(fromPrice)
    const toPriceNum = Number.parseFloat(toPrice)

    if (isNaN(fromAmountNum) || fromAmountNum <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (isNaN(fromPriceNum) || fromPriceNum <= 0) {
      setError("Please enter a valid from price")
      return
    }

    if (isNaN(toPriceNum) || toPriceNum <= 0) {
      setError("Please enter a valid to price")
      return
    }

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const fromValue = fromAmountNum * fromPriceNum
    const toAmount = fromValue / toPriceNum
    const exchangeRate = fromPriceNum / toPriceNum

    setResult({
      fromAmount: fromAmountNum,
      fromToken,
      toAmount,
      toToken,
      exchangeRate,
    })
    setIsCalculating(false)
  }

  const resetCalculator = () => {
    setFromToken("")
    setToToken("")
    setFromAmount("")
    setFromPrice("")
    setToPrice("")
    setResult(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Swap Calculator</h2>
        <p className="text-sm text-muted-foreground mt-1">Check token conversion rates before swapping</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from-token" className="text-foreground font-semibold">
              From Token
            </Label>
            <Input
              id="from-token"
              placeholder="e.g., ethereum"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="to-token" className="text-foreground font-semibold">
              To Token
            </Label>
            <Input
              id="to-token"
              placeholder="e.g., bitcoin"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div>
          <Button
            onClick={fetchTokenPrices}
            disabled={isLoadingPrice}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoadingPrice ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin-slow"></div>
                Fetching Prices...
              </span>
            ) : (
              "Fetch Prices"
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="from-amount" className="text-foreground font-semibold">
              Amount
            </Label>
            <Input
              id="from-amount"
              type="number"
              placeholder="e.g., 1.5"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              step="0.0001"
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="from-price" className="text-foreground font-semibold">
              From Price ($)
            </Label>
            <Input
              id="from-price"
              type="number"
              placeholder="e.g., 2500"
              value={fromPrice}
              onChange={(e) => setFromPrice(e.target.value)}
              step="0.01"
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="to-price" className="text-foreground font-semibold">
              To Price ($)
            </Label>
            <Input
              id="to-price"
              type="number"
              placeholder="e.g., 45000"
              value={toPrice}
              onChange={(e) => setToPrice(e.target.value)}
              step="0.01"
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg animate-slide-up">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3 flex-col sm:flex-row">
        <Button
          onClick={calculateSwap}
          disabled={isCalculating}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin-slow"></div>
              Calculating...
            </span>
          ) : (
            "Calculate Swap"
          )}
        </Button>
        <Button
          onClick={resetCalculator}
          variant="outline"
          className="border-border text-foreground hover:bg-secondary bg-transparent"
        >
          Reset
        </Button>
      </div>

      {result && (
        <div className="space-y-4 p-6 bg-secondary border border-border rounded-lg animate-slide-up">
          <h3 className="text-lg font-bold text-foreground">Swap Preview</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">You Send</p>
              <p className="text-2xl font-bold text-foreground">
                {result.fromAmount.toFixed(6)} {result.fromToken.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ${(result.fromAmount * (Number.parseFloat(fromPrice) || 0)).toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">You Receive</p>
              <p className="text-2xl font-bold text-accent">
                {result.toAmount.toFixed(6)} {result.toToken.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ${(result.toAmount * (Number.parseFloat(toPrice) || 0)).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="p-4 bg-background border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">Exchange Rate</p>
            <p className="text-lg font-bold text-foreground">
              1 {result.fromToken.toUpperCase()} = {result.exchangeRate.toFixed(6)} {result.toToken.toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
