import { useState } from "react";
import { Copy, Users, Send, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { registerUser, otpLogin } from "@/lib/billstackApi";
import { getOperators, getProducts, getCategories } from "@/lib/billstackPublicApi";
import { validatePhoneNumber, validateAccount } from "@/lib/billstackValidationApi";

const referralLink = "https://billstack.onshops.online/username";

const leaderboard = [
  { place: "First Place", username: "@iamavischarles", color: "bg-accent" },
  { place: "Second Place", username: "@iamavischarles", color: "bg-secondary" },
  { place: "Third Place", username: "@iamavischarles", color: "bg-muted" },
  { place: "Fourth Place", username: "@iamavischarles", color: "bg-accent" },
  { place: "Fifth Place", username: "@iamavischarles", color: "bg-secondary" },
];

const levelReferrals = [
  { username: "@iamavischarles", totalTransaction: "N12,233", totalCommission: "N120.43", lvlCommission: "N120.43", dateJoined: "12/09/2025 | 12:00am", totalReferral: 10 },
  { username: "@fatherofgeneration", totalTransaction: "N10,000", totalCommission: "N1,120.43", lvlCommission: "N120.43", dateJoined: "12/09/2025 | 12:00am", totalReferral: 33 },
];

const levels = [
  {
    level: 5,
    filled: 5,
    target: "0/200 Referrals",
    transactions: "N1,000/N20,0000",
    community: "1,000/20,0000 People",
  },
  {
    level: 4,
    filled: 4,
    target: "0/200 Referrals",
    transactions: "N1,000/N20,0000",
    community: "1,000/20,0000 People",
  },
];

// Example BillStack authentication usage
export function BillstackAuthDemo() {
  const [registerData, setRegisterData] = useState({
    email: '',
    phone: '',
    country: 'NG',
    lastName: '',
    password: '',
    firstName: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
  });
  const [registerResult, setRegisterResult] = useState<object | null>(null);
  const [loginResult, setLoginResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerUser(registerData);
      setRegisterResult(result);
    } catch (err) {
      setRegisterResult(err as object);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await otpLogin(loginData.email);
      setLoginResult(result);
    } catch (err) {
      setLoginResult(err as object);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '2rem 0' }}>
      <h2>BillStack Auth Demo</h2>
      <form onSubmit={handleRegister} style={{ marginBottom: '1rem' }}>
        <h3>Register</h3>
        <input placeholder="Email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} />
        <input placeholder="Phone" value={registerData.phone} onChange={e => setRegisterData({ ...registerData, phone: e.target.value })} />
        <input placeholder="Country" value={registerData.country} onChange={e => setRegisterData({ ...registerData, country: e.target.value })} />
        <input placeholder="First Name" value={registerData.firstName} onChange={e => setRegisterData({ ...registerData, firstName: e.target.value })} />
        <input placeholder="Last Name" value={registerData.lastName} onChange={e => setRegisterData({ ...registerData, lastName: e.target.value })} />
        <input placeholder="Password" type="password" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} />
        <button type="submit" disabled={loading}>Register</button>
        {registerResult && <pre>{JSON.stringify(registerResult, null, 2)}</pre>}
      </form>
      <form onSubmit={handleLogin}>
        <h3>Login</h3>
        <input placeholder="Email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
        <input placeholder="Password" type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
        <button type="submit" disabled={loading}>Login</button>
        {loginResult && <pre>{JSON.stringify(loginResult, null, 2)}</pre>}
      </form>
    </div>
  );
}

// Demo: Fetch and display BillStack categories
export function BillstackCategoriesDemo() {
  const [categories, setCategories] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '2rem 0' }}>
      <h2>BillStack Categories Demo</h2>
      <button onClick={fetchCategories} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Categories'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {categories.length > 0 && (
        <ul>
          {categories.map((cat, idx) => (
            <li key={idx}>{typeof cat === 'string' ? cat : JSON.stringify(cat)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Demo: Fetch and display BillStack operators and products
export function BillstackOperatorsProductsDemo() {
  const [operators, setOperators] = useState<object[]>([]);
  const [products, setProducts] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [operatorId, setOperatorId] = useState('');

  const fetchOperators = async () => {
    if (!categoryId) { setError('Please enter a Category ID'); return; }
    setLoading(true);
    setError(null);
    try {
      const ops = await getOperators(categoryId);
      setOperators(Array.isArray(ops.data) ? ops.data : []);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch operators');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!categoryId || !operatorId) { setError('Please enter both Category ID and Operator ID'); return; }
    setLoading(true);
    setError(null);
    try {
      const prods = await getProducts(categoryId, operatorId);
      setProducts(Array.isArray(prods.data) ? prods.data : []);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '2rem 0' }}>
      <h2>BillStack Operators &amp; Products Demo</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <input placeholder="Category ID" value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ marginRight: '0.5rem' }} />
        <input placeholder="Operator ID (for products)" value={operatorId} onChange={e => setOperatorId(e.target.value)} style={{ marginRight: '0.5rem' }} />
      </div>
      <button onClick={fetchOperators} disabled={loading} style={{ marginRight: '0.5rem' }}>
        {loading ? 'Loading...' : 'Fetch Operators'}
      </button>
      <button onClick={fetchProducts} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Products'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {operators.length > 0 && (
        <div>
          <h3>Operators</h3>
          <ul>
            {operators.map((op, idx) => (
              <li key={idx}>{typeof op === 'string' ? op : JSON.stringify(op)}</li>
            ))}
          </ul>
        </div>
      )}
      {products.length > 0 && (
        <div>
          <h3>Products</h3>
          <ul>
            {products.map((prod, idx) => (
              <li key={idx}>{typeof prod === 'string' ? prod : JSON.stringify(prod)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Demo: Phone and Account Validation
function BillstackValidationDemo() {
  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState<object | null>(null);
  const [account, setAccount] = useState("");
  const [service, setService] = useState("");
  const [accountResult, setAccountResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await validatePhoneNumber(phone);
      setPhoneResult(result);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to validate phone");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await validateAccount(account, service);
      setAccountResult(result);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to validate account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: "2rem 0" }}>
      <h2>BillStack Validation Demo</h2>
      <form onSubmit={handlePhoneValidate} style={{ marginBottom: "1rem" }}>
        <h3>Validate Phone Number</h3>
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <button type="submit" disabled={loading}>Validate Phone</button>
        {phoneResult && <pre>{JSON.stringify(phoneResult, null, 2)}</pre>}
      </form>
      <form onSubmit={handleAccountValidate}>
        <h3>Validate Account</h3>
        <input placeholder="Account" value={account} onChange={e => setAccount(e.target.value)} />
        <input placeholder="Service (e.g. dstv, electricity)" value={service} onChange={e => setService(e.target.value)} />
        <button type="submit" disabled={loading}>Validate Account</button>
        {accountResult && <pre>{JSON.stringify(accountResult, null, 2)}</pre>}
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

const ReferAndEarn = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Referral &amp; Rewards</h1>
        <p className="text-sm text-muted-foreground">Refer a customers and earn percentage of their utility purchase up to 3 generation everytime.</p>
      </div>

      {/* Balance + Reward Offer */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 rounded-2xl bg-gradient-to-r from-accent via-accent/60 to-accent/20 p-6 relative overflow-hidden">
          <p className="text-xs font-semibold text-foreground/70 mb-1">Referral Balance</p>
          <p className="text-3xl font-bold text-foreground">N140,000<span className="text-lg">.00</span></p>
          <Button size="sm" variant="secondary" className="mt-4 rounded-full gap-1.5 text-xs">
            <span className="text-primary">+</span> Withdraw
          </Button>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <div className="lg:w-[380px] rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Referral Reward Offer</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Earn <span className="font-bold text-primary">0.5%</span> on your direct referral purchases,</li>
            <li><span className="font-bold text-primary">0.3%</span> when the purchases of customers they refer, &amp;</li>
            <li><span className="font-bold text-primary">0.2%</span> of their referrals referral</li>
          </ol>
        </div>
      </div>

      {/* Tabs + Referral Link */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="bg-muted rounded-full p-1">
            <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5">Overview</TabsTrigger>
            <TabsTrigger value="level1" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5">Level 1</TabsTrigger>
            <TabsTrigger value="level2" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5">Level 2</TabsTrigger>
            <TabsTrigger value="level3" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5">Level 3</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center rounded-xl border border-border overflow-hidden">
          <div className="bg-primary/10 px-4 py-2.5">
            <span className="text-xs font-bold text-foreground">Referral Link</span>
          </div>
          <div className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[240px]">{referralLink}</div>
          <button onClick={copyLink} className="px-3 py-2.5 text-muted-foreground hover:text-foreground">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Reward Journey & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground">Reward Journey</h3>
              {levels.map((lvl) => (
                <div key={lvl.level} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Level {lvl.level}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-4 w-4 rounded-full ${i < lvl.filled ? "bg-primary" : "bg-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">To hit this level, you need to meet the above targets.</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-full border border-border px-4 py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Target className="h-4 w-4" /> Target</span>
                      <span className="font-medium text-foreground">{lvl.target}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Transaction Value</p>
                    <div className="flex items-center justify-between rounded-full border border-border px-4 py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Send className="h-4 w-4" /> Transactions</span>
                      <span className="font-medium text-foreground">{lvl.transactions}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total People in your community</p>
                    <div className="flex items-center justify-between rounded-full border border-border px-4 py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Community</span>
                      <span className="font-medium text-foreground">{lvl.community}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Your current Position is 100/10,435 People</h3>
              {leaderboard.map((entry, i) => (
                <div key={i} className={`flex items-center gap-4 rounded-2xl ${entry.color} p-4`}>
                  <div className="text-2xl">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{entry.place}</span>
                  <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center text-xs font-bold text-destructive-foreground">CA</div>
                  <span className="text-sm text-foreground">{entry.username}</span>
                </div>
              ))}
            </div>
          </div>
          {/* BillStack API Demo Sections */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <BillstackAuthDemo />
            <BillstackCategoriesDemo />
            <BillstackOperatorsProductsDemo />
            <BillstackValidationDemo />
            {/* Utility endpoints demo placeholder */}
            <div style={{ margin: '2rem 0' }}>
              <h2>BillStack Utilities Demo</h2>
              <p>Integrate utility endpoints (airtime, data, electricity, cable TV, e-sim) here as needed.</p>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "level1" || activeTab === "level2" || activeTab === "level3") && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">
              Your {activeTab.replace("level", "level ")} Referrals
            </h2>
            <Badge className="rounded-full bg-primary text-primary-foreground px-4 py-1.5">
              {activeTab === "level1" ? "0.5%" : activeTab === "level2" ? "0.3%" : "0.2%"} commission on their purchases
            </Badge>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Referral User name</TableHead>
                  <TableHead>Total Transaction</TableHead>
                  <TableHead>Total Commission</TableHead>
                  <TableHead>Lv1 Commission</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Total referral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levelReferrals.map((ref, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{ref.username}</TableCell>
                    <TableCell>{ref.totalTransaction}</TableCell>
                    <TableCell>
                      <span className="rounded-full border border-border px-3 py-1 text-xs">{ref.totalCommission}</span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full border border-border px-3 py-1 text-xs">{ref.lvlCommission}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ref.dateJoined}</TableCell>
                    <TableCell>
                      <span className="rounded-full border border-border px-3 py-1 text-xs">{ref.totalReferral}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferAndEarn;
