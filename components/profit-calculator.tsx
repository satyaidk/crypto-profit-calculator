"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCalculation } from "@/lib/user-storage"

interface CalculationResult {
  currentValue: number
  futureValue: number
  profit: number
  percentageGain: number
}

const STORAGE_KEY = "crypto_calculator_inputs"

export function ProfitCalculator({ walletAddress }: { walletAddress?: string | null }) {
  const [tokenName, setTokenName] = useState("")
  const [holdings, setHoldings] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setTokenName(data.tokenName || "")
        setHoldings(data.holdings || "")
        setCurrentPrice(data.currentPrice || "")
        setTargetPrice(data.targetPrice || "")
      } catch (err) {
        console.error("Error loading saved data:", err)
      }
    }
  }, [])

  // Save to local storage whenever inputs change
  useEffect(() => {
    const data = { tokenName, holdings, currentPrice, targetPrice }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [tokenName, holdings, currentPrice, targetPrice])

  const fetchTokenPrice = async () => {
    if (!tokenName.trim()) {
      setError("Please enter a token name")
      return
    }

    setIsLoadingPrice(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenName.toLowerCase()}&vs_currencies=usd`,
      )
      const data = await response.json()

      if (data[tokenName.toLowerCase()]?.usd) {
        const price = data[tokenName.toLowerCase()].usd
        setCurrentPrice(price.toString())
      } else {
        setError(`Token "${tokenName}" not found. Please check the name.`)
      }
    } catch (err) {
      setError("Failed to fetch token price. Please try again.")
      console.error("Price fetch error:", err)
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const calculateProfit = async () => {
    setError(null)
    setResult(null)

    // Validation
    if (!tokenName.trim()) {
      setError("Please enter a token name")
      return
    }

    const holdingsNum = Number.parseFloat(holdings)
    const currentPriceNum = Number.parseFloat(currentPrice)
    const targetPriceNum = Number.parseFloat(targetPrice)

    if (isNaN(holdingsNum) || holdingsNum <= 0) {
      setError("Please enter a valid holdings amount")
      return
    }

    if (isNaN(currentPriceNum) || currentPriceNum <= 0) {
      setError("Please enter a valid current price")
      return
    }

    if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
      setError("Please enter a valid target price")
      return
    }

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Calculate
    const currentValue = holdingsNum * currentPriceNum
    const futureValue = holdingsNum * targetPriceNum
    const profit = futureValue - currentValue
    const percentageGain = (profit / currentValue) * 100

    setResult({
      currentValue,
      futureValue,
      profit,
      percentageGain,
    })
    setIsCalculating(false)
  }

  const handleSaveCalculation = () => {
    if (!walletAddress || !result) return

    saveCalculation(
      walletAddress,
      "profit",
      { tokenName, holdings, currentPrice, targetPrice },
      result,
      `${tokenName} - ${new Date().toLocaleDateString()}`,
    )

    setSaveMessage("Calculation saved to your profile!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const resetCalculator = () => {
    setTokenName("")
    setHoldings("")
    setCurrentPrice("")
    setTargetPrice("")
    setResult(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Profit Calculator Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Profit Calculator</h2>
          <p className="text-sm text-muted-foreground mt-1">Calculate your potential profits with precision</p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="token-name" className="text-foreground font-semibold">
              Token Name
            </Label>
            <div className="flex gap-2 mt-2 flex-col sm:flex-row">
              <Input
                id="token-name"
                placeholder="e.g., ethereum, bitcoin, solana"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1"
              />
              <Button
                onClick={fetchTokenPrice}
                disabled={isLoadingPrice}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                {isLoadingPrice ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin-slow"></div>
                    Fetching...
                  </span>
                ) : (
                  "Fetch Price"
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="holdings" className="text-foreground font-semibold">
              Holdings (Amount)
            </Label>
            <Input
              id="holdings"
              type="number"
              placeholder="e.g., 0.6514"
              value={holdings}
              onChange={(e) => setHoldings(e.target.value)}
              step="0.0001"
              className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current-price" className="text-foreground font-semibold">
                Current Price ($)
              </Label>
              <Input
                id="current-price"
                type="number"
                placeholder="e.g., 187.41"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                step="0.01"
                className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <Label htmlFor="target-price" className="text-foreground font-semibold">
                Target Price ($)
              </Label>
              <Input
                id="target-price"
                type="number"
                placeholder="e.g., 200"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                step="0.01"
                className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg animate-slide-up">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            onClick={calculateProfit}
            disabled={isCalculating}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin-slow"></div>
                Calculating...
              </span>
            ) : (
              "Calculate Profit"
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

        {/* Results Section */}
        {result && (
          <div className="space-y-4 p-6 bg-secondary border border-border rounded-lg animate-slide-up">
            <h3 className="text-lg font-bold text-foreground">Calculation Results</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Current Value</p>
                <p className="text-2xl font-bold text-foreground">${result.currentValue.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Future Value</p>
                <p className="text-2xl font-bold text-foreground">${result.futureValue.toFixed(2)}</p>
              </div>

              <div
                className={`p-4 rounded-lg border ${result.profit >= 0 ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"}`}
              >
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Profit/Loss</p>
                <p
                  className={`text-2xl font-bold ${result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  ${result.profit.toFixed(2)}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${result.percentageGain >= 0 ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"}`}
              >
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Percentage Gain</p>
                <p
                  className={`text-2xl font-bold ${result.percentageGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {result.percentageGain.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-background border border-border rounded-lg text-sm text-foreground">
              <p>
                If <span className="font-semibold">{tokenName}</span> reaches{" "}
                <span className="font-semibold text-accent">${targetPrice}</span>, your{" "}
                <span className="font-semibold">{holdings}</span> tokens will be worth{" "}
                <span className="font-semibold text-accent">${result.futureValue.toFixed(2)}</span>.
              </p>
            </div>

            {saveMessage && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">{saveMessage}</p>
              </div>
            )}

            {walletAddress && (
              <Button
                onClick={handleSaveCalculation}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Save to Profile
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
