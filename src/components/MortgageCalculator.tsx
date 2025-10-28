import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function calculateMonthlyPayment(principal: number, annualInterestRate: number, years: number) {
  if (!principal || !annualInterestRate || !years) return 0;
  const monthlyRate = annualInterestRate / 100 / 12;
  const n = years * 12;
  if (monthlyRate === 0) return principal / n;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}

const MortgageCalculator = () => {
  const [price, setPrice] = useState(5000000);
  const [down, setDown] = useState(500000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(12.5);
  const [monthly, setMonthly] = useState(0);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const loanAmount = price - down;
    const payment = calculateMonthlyPayment(loanAmount, rate, years);
    setMonthly(payment);
  };

  const handleClear = () => {
    setPrice(5000000);
    setDown(500000);
    setYears(20);
    setRate(12.5);
    setMonthly(0);
  };

  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Mortgage Calculator</CardTitle>
        <CardDescription>
          Estimate your monthly home loan payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleCalculate}>
          <div>
            <Label htmlFor="price">Home Price (KES)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              min={0}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="down">Down Payment (KES)</Label>
            <Input
              id="down"
              type="number"
              value={down}
              min={0}
              max={price}
              onChange={e => setDown(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="years">Loan Term (years)</Label>
            <Input
              id="years"
              type="number"
              value={years}
              min={1}
              max={40}
              onChange={e => setYears(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="rate">Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              min={0}
              step={0.01}
              onChange={e => setRate(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="submit" className="w-full">Calculate</Button>
            <Button type="button" variant="secondary" className="w-full" onClick={handleClear}>Clear</Button>
          </div>
        </form>
        {monthly > 0 && (
          <div className="mt-6 text-lg text-center font-semibold">
            Estimated Monthly Payment: <span className="text-primary">KES {monthly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MortgageCalculator;
