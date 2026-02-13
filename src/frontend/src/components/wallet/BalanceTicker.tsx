import { useEffect, useState } from 'react';

interface BalanceTickerProps {
  balance: number;
}

export default function BalanceTicker({ balance }: BalanceTickerProps) {
  const [displayBalance, setDisplayBalance] = useState(balance);

  useEffect(() => {
    if (displayBalance === balance) return;

    const diff = balance - displayBalance;
    const steps = 20;
    const increment = diff / steps;
    const duration = 500;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayBalance(balance);
        clearInterval(interval);
      } else {
        setDisplayBalance(prev => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [balance, displayBalance]);

  return (
    <div className="text-4xl font-bold text-primary">
      {Math.round(displayBalance).toLocaleString()} Credits
    </div>
  );
}
