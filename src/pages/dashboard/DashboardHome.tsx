import { useState, useEffect } from "react";
import { Plus, Minus, Copy, ArrowRight, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getToken } from "@/lib/billstackApi";

const bankNames = ["Globus Bank", "Wema Bank", "Sterling Bank", "Providus Bank"];
const firstNames = ["Sendflow", "PayStack", "FlutterWave", "Kuda"];
const lastNames = ["Charles Avis", "Technologies", "Payments", "Kuda"];

const generateAccount = () => ({
  name: `${firstNames[Math.floor(Math.random() * firstNames.length)]}-${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
  number: String(Math.floor(7000000000 + Math.random() * 999999999)),
  bank: bankNames[Math.floor(Math.random() * bankNames.length)],
});

const DashboardHome = () => {
  const { toast } = useToast();
  const [account, setAccount] = useState<{ name: string; number: string; bank: string } | null>(null);
  const [userBalance, setUserBalance] = useState({ main: "0", referral: "0" });
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const referralLink = "https://billstack.onshops.online/username";

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        // Load user balance and account info
        // For now using mock data, but this would call real API endpoints
        setUserBalance({ main: "140,000", referral: "25,500" });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-foreground mb-2">Welcome to BillStack</h2>
          <p className="text-muted-foreground mb-6">Please log in to access your dashboard</p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const copyAccountNumber = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.number);
    toast({ title: "Copied!", description: "Account number copied to clipboard" });
  };

  const handleGenerate = () => {
    const newAccount = generateAccount();
    setAccount(newAccount);
    toast({ title: "Account Generated!", description: `Your new account number is ${newAccount.number}` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Track, manage, and access services.</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening</p>
      </div>

      {/* Balance Cards Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Balance card */}
        <div className="flex-1 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 p-6 text-primary-foreground relative overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary-foreground/70 mb-1">Available Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">₦{userBalance.main}<span className="text-lg">.00</span></p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary-foreground/70 mb-1">Referral Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">₦{userBalance.referral}<span className="text-lg">.00</span></p>
              <Button size="sm" variant="secondary" className="mt-4 rounded-full gap-1.5 text-xs">
                <Minus className="h-3 w-3" /> Withdraw
              </Button>
            </div>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="h-20 w-20 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {/* Funding details card */}
        <div className="lg:w-[280px] rounded-2xl border border-border bg-card p-6 flex flex-col justify-center">
          {account ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Funding Details:</p>
              <p className="text-sm text-muted-foreground">{account.name}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-foreground">{account.number}</p>
                <button onClick={copyAccountNumber} className="text-muted-foreground hover:text-foreground">
                  <Smartphone className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm font-medium text-primary">{account.bank}</p>
              {/* Account already generated — no regenerate */}
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-foreground mb-1">Create a Bank account for easy funding</p>
              <Button onClick={handleGenerate} className="mt-3 rounded-full gap-2">
                <Plus className="h-4 w-4" /> Generate New
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Referral Link */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl border border-border overflow-hidden">
        <div className="bg-primary/10 px-5 py-3">
          <span className="text-sm font-bold text-foreground whitespace-nowrap">Referral Link</span>
        </div>
        <div className="flex-1 min-w-0 px-4 py-3 text-sm text-muted-foreground truncate">{referralLink}</div>
        <button onClick={copyLink} className="px-4 py-3 text-muted-foreground hover:text-foreground self-end sm:self-auto">
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {/* Referral Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-accent via-accent to-accent/60 flex flex-col md:flex-row relative overflow-hidden">
        <div className="flex-1 p-6 md:p-8">
          <p className="text-xs font-semibold text-accent-foreground/70 mb-2">Referral Bonus</p>
          <h2 className="text-xl font-bold text-foreground mb-2 leading-snug">
            Earn forever when you refer friends to Join!
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Share your referral code and unlock instant rewards when your friends sign up and start using our services.
          </p>
          <Button className="mt-4 rounded-full gap-2">
            Start earning <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="hidden md:block w-px bg-accent-foreground/10 my-6" />
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-foreground mb-4">Referral Reward Offer</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Earn <span className="font-bold text-primary">0.5%</span> on your direct referral purchases,</li>
            <li><span className="font-bold text-primary">0.3%</span> when the purchases of customers they refer, and</li>
            <li><span className="font-bold text-primary">0.2%</span> of their referrals referral</li>
          </ol>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Transaction</h3>
        <div className="border-t border-border" />
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          No Transactions Yet
        </div>
        <div className="flex justify-end text-xs text-muted-foreground">Pagination here</div>
      </div>
    </div>
  );
};

export default DashboardHome;
