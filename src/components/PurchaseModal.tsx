import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, PartyPopper, X, Loader2, Bookmark, BookmarkCheck, Users, UserPlus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import slide1 from "@/assets/slide-1.png";
import slide2 from "@/assets/slide-2.png";
import slide3 from "@/assets/slide-3.png";
import heroLogo from "@/assets/shopsonline-logo.svg";
import foodOfferImg from "@/assets/food-offer.jpg";
import mtnLogo from "@/assets/mtn.jpg";
import airtelLogo from "@/assets/airtel.png";
import gloLogo from "@/assets/glo.png";
import etisalatLogo from "@/assets/etisalat.jpg";
import {
  getAirtimeNetworks,
  getDataNetworks,
  getDataTypes,
  getDataPlans,
  getElectricityBillers,
  getElectricityPaymentPlans,
  getCableTvBillers,
  getCableTvPaymentPlans,
  getESimProviders,
  getESimPackages,
  validatePhoneNumber,
  validateAccount,
  guestRegister,
  type Operator,
  type Product,
  type PaymentPlan,
  type PhoneValidation,
  type SubCategory
} from "@/lib/billstackApi";

const slideImages = [slide1, slide2, slide3];

export type PurchaseType = "airtime" | "data" | "electricity" | "giftcard" | "cabletv" | "betting" | "esim";

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  type: PurchaseType;
}

/* ─── Step Labels ─── */
const getStepLabels = (type: PurchaseType): string[] => {
  switch (type) {
    case "airtime": return ["Details", "Confirm", "Done"];
    case "data": return ["Details", "Confirm", "Done"];
    case "betting": return ["Details", "Confirm", "Done"];
    case "electricity": return ["Info", "Amount", "Confirm", "Done"];
    case "giftcard": return ["Card", "Contact", "Confirm", "Done"];
    case "cabletv": return ["Provider", "Plan", "Confirm", "Done"];
    case "esim": return ["Country", "Package", "Confirm", "Done"];
  }
};

/* ─── Step Indicator with labels ─── */
const StepIndicator = ({ currentStep, totalSteps, labels }: { currentStep: number; totalSteps: number; labels: string[] }) => (
  <div className="flex items-center justify-between mb-8">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, i) => (
      <div key={step} className="flex items-center flex-1">
        <div className="flex flex-col items-center gap-1">
          <motion.div
            initial={false}
            animate={{
              scale: currentStep === step ? 1.1 : 1,
              backgroundColor: currentStep >= step ? "hsl(var(--primary))" : "transparent",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${currentStep >= step
              ? "text-primary-foreground"
              : "border-2 border-border text-muted-foreground"
              }`}
          >
            {currentStep > step ? <Check className="h-4 w-4" /> : step}
          </motion.div>
          <span className={`text-[10px] font-medium ${currentStep >= step ? "text-primary" : "text-muted-foreground"}`}>
            {labels[i]}
          </span>
        </div>
        {i < totalSteps - 1 && (
          <div className="flex-1 mx-2 mt-[-16px]">
            <motion.div
              className="h-0.5 bg-primary origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep > step ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ backgroundColor: currentStep > step ? "hsl(var(--primary))" : "hsl(var(--border))" }}
            />
            <div className="h-0.5 bg-border -mt-0.5" />
          </div>
        )}
      </div>
    ))}
  </div>
);

/* ─── Animated Step Wrapper ─── */
const StepTransition = ({ children, stepKey }: { children: React.ReactNode; stepKey: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

/* ─── Shared network-logo helper ─── */
const getNetworkLogo = (name: string) => {
  if (name.toLowerCase().includes('mtn')) return mtnLogo;
  if (name.toLowerCase().includes('airtel')) return airtelLogo;
  if (name.toLowerCase().includes('glo')) return gloLogo;
  if (name.toLowerCase().includes('9mobile') || name.toLowerCase().includes('etisalat')) return etisalatLogo;
  return mtnLogo;
};

/* ─── Dynamic Network Dropdown Selector ─── */
const NetworkSelect = ({ value, onChange, networks, loading, phoneValidation }: {
  value: string;
  onChange: (v: string) => void;
  networks: Operator[];
  loading: boolean;
  phoneValidation?: PhoneValidation | null;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-foreground">Choose Network</label>
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="rounded-lg">
        <SelectValue placeholder={loading ? "Loading networks..." : "Choose Network"} />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="loading" disabled>
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          </SelectItem>
        ) : (
          networks.map((network) => (
            <SelectItem key={network.id} value={network.id}>
              <span className="flex items-center gap-2">
                <img src={getNetworkLogo(network.name)} alt={network.name} className="h-5 w-5 rounded-full object-cover" />
                {network.name}
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
    {/* Show "Detected" only when the API phone-validation has responded */}
    {phoneValidation?.operator?.name && (
      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
        <Check className="h-3 w-3" />
        Detected: {phoneValidation.operator.name}
      </p>
    )}
  </div>
);

const offers = [
  { name: "KFC Special", price: "N18,999", location: "KFC Magodo", discount: "20%" },
  { name: "Jollof Rice Combo", price: "N12,500", location: "Foodie Hub", discount: "15%" },
  { name: "Shawarma Deluxe", price: "N8,999", location: "Wrap King", discount: "20%" },
  { name: "Pepper Soup", price: "N6,500", location: "Mama's Kitchen", discount: "10%" },
  { name: "Suya Platter", price: "N15,000", location: "Suya Spot VI", discount: "25%" },
];

const VISIBLE_CARDS = 3;

const OffersSlider = () => {
  const [offset, setOffset] = useState(0);
  const maxOffset = offers.length - VISIBLE_CARDS;

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((o) => (o >= maxOffset ? 0 : o + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [maxOffset]);


  return (
    <div className="p-5 bg-white rounded-b-2xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-800">Offers on Shops Online</h4>
        <button className="text-xs font-semibold text-primary hover:underline transition-colors">
          more →
        </button>
      </div>
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-3"
          animate={{ x: `-${offset * (100 / VISIBLE_CARDS + 2.4)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {offers.map((offer, i) => (
            <motion.div
              key={offer.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100"
              style={{ width: `calc(${100 / VISIBLE_CARDS}% - ${((VISIBLE_CARDS - 1) * 12) / VISIBLE_CARDS}px)` }}
            >
              <div className="relative h-24 overflow-hidden">
                <img src={foodOfferImg} alt={offer.name} className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center justify-center">
                  <svg viewBox="0 0 60 60" className="h-10 w-10 drop-shadow-md">
                    <polygon
                      points="30,2 35,18 52,12 42,26 58,30 42,34 52,48 35,42 30,58 25,42 8,48 18,34 2,30 18,26 8,12 25,18"
                      fill="hsl(var(--primary))"
                    />
                  </svg>
                  <span className="absolute text-[8px] font-bold text-primary-foreground leading-tight text-center">
                    {offer.discount}<br />Off
                  </span>
                </div>
              </div>
              <div className="px-2 pt-2 pb-1">
                <button className="w-full rounded-full bg-primary py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Grab now
                </button>
              </div>
              <div className="px-2 pb-2.5 pt-1">
                <div className="flex items-baseline justify-between gap-1">
                  <p className="text-[11px] font-medium text-gray-800 truncate">{offer.name}</p>
                  <span className="text-xs font-extrabold text-gray-900 whitespace-nowrap">{offer.price}</span>
                </div>
                <p className="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-gray-200 overflow-hidden text-[7px]">👤</span>
                  {offer.location}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const slideContent = [
  {
    title: <><span className="text-primary">Discover</span> Sellers, SMEs,<br />Professionals Across<br />Markets</>,
    description: "OnShops.online is a growing digital directory of shops, SMEs, professionals, and service providers integrated into the digital economy across Africa.",
    cta: "Visit Marketplace",
  },
  {
    title: <><span className="text-primary">Recharge</span> Airtime & Data<br />Instantly,<br />Anytime</>,
    description: "Top up your phone or a loved one's in seconds — MTN, Airtel, Glo, 9mobile — with a 1% loyalty bonus on every ₦1,000+ purchase.",
    cta: "Buy Airtime Now",
  },
  {
    title: <><span className="text-primary">Pay Bills</span> Without<br />Leaving<br />Your Seat</>,
    description: "Electricity, cable TV, betting wallets and more — pay all your utility bills in one place and earn loyalty rewards on every transaction.",
    cta: "Pay a Bill",
  },
];

const PromoSidebar = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex w-[420px] min-w-[420px] flex-col overflow-hidden rounded-l-2xl bg-navy">
      {/* Logo pinned at the top */}
      <div className="relative z-20 flex items-center gap-2 px-6 pt-5 pb-3">
        <img src={heroLogo} alt="ShopsOnline by FusPay" className="h-6 brightness-0 invert" />
      </div>

      {/* Carousel section — fills remaining space */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {slideImages.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: i === activeSlide ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/55 to-transparent" />

        {/* Per-slide text — transitions with each slide */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3 className="text-xl font-bold text-primary-foreground leading-tight mb-2">
                {slideContent[activeSlide].title}
              </h3>
              <p className="text-xs text-primary-foreground/65 mb-4 leading-relaxed">
                {slideContent[activeSlide].description}
              </p>
              <button className="rounded-lg bg-primary px-5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                {slideContent[activeSlide].cta}
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="mt-4 flex gap-2">
            {slideImages.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveSlide(i)}
                animate={{
                  width: i === activeSlide ? 24 : 8,
                  backgroundColor: i === activeSlide ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)",
                }}
                transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mx-4" />

      {/* Offers section with slider */}
      <OffersSlider />
    </div>
  );
};

/* ─── Loyalty bonus helper — 1% of amount, only for purchases ≥ ₦1000 ─── */
const calcBonus = (rawAmount: string): number => {
  const n = parseFloat(rawAmount.replace(/[₦N$,\s]/g, ""));
  if (!n || isNaN(n) || n < 1000) return 0;
  return Math.floor(n * 0.01);
};

/* ─── Enhanced PriceDisplay with real-time loyalty bonus ─── */
const PriceDisplay = ({ amount }: { amount: string }) => {
  const rawNum = parseFloat(amount.replace(/[₦N$,\s]/g, "")) || 0;
  const bonus = calcBonus(amount);
  const totalGet = rawNum + bonus;
  const hasBonus = bonus > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50"
    >
      {/* Left — what the user pays */}
      <div className="flex-1 bg-gradient-to-br from-navy to-navy/90 p-4">
        <p className="text-xs text-navy-foreground/60">You will Pay</p>
        <p className="text-2xl font-bold text-navy-foreground">
          ₦{rawNum.toLocaleString("en-NG")}<span className="text-sm">.00</span>
        </p>
        {!hasBonus && (
          <p className="text-[10px] text-navy-foreground/50 mt-0.5">
            Spend ₦1,000+ to unlock bonus
          </p>
        )}
      </div>

      {/* Right — what the user gets (amount + bonus) */}
      <div className="flex-1 bg-gradient-to-br from-navy/85 to-navy/75 p-4">
        <p className="text-xs text-navy-foreground/60">You will get</p>
        <motion.p
          key={totalGet}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-2xl font-bold text-navy-foreground"
        >
          ₦{totalGet.toLocaleString("en-NG")}<span className="text-sm">.00</span>
        </motion.p>
        {hasBonus ? (
          <motion.p
            key={bonus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-green-300 font-semibold mt-0.5"
          >
            🎁 Includes +₦{bonus.toLocaleString("en-NG")} loyalty bonus (1%)
          </motion.p>
        ) : (
          <p className="text-[10px] text-navy-foreground/50 mt-0.5">
            0% loyalty earned on this amount
          </p>
        )}
      </div>
    </motion.div>
  );
};


/* ─── Enhanced Amount Chips with micro-interactions ─── */
const AmountChips = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <motion.button
        key={opt}
        onClick={() => onChange(opt)}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${value === opt
          ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20"
          : "border-border text-muted-foreground hover:border-primary"
          }`}
      >
        {opt}
      </motion.button>
    ))}
  </div>
);

/* ─── Confetti Particles ─── */
const ConfettiParticle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    className="absolute rounded-full"
    style={{ width: 8, height: 8, backgroundColor: color, left: `${x}%`, top: "40%" }}
    initial={{ opacity: 1, y: 0, scale: 1 }}
    animate={{
      opacity: [1, 1, 0],
      y: [0, -80, 60],
      x: [0, (Math.random() - 0.5) * 100],
      rotate: [0, 360],
      scale: [1, 1.2, 0.5],
    }}
    transition={{ duration: 1.8, delay, ease: "easeOut" }}
  />
);

const confettiColors = ["#0057FE", "#FFCC00", "#50B651", "#ED1C24", "#FF6B35", "#8B5CF6"];

/* ─── Enhanced Success Step ─── */
const SuccessStep = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="flex flex-col items-center py-8 relative overflow-hidden"
  >
    {/* Confetti */}
    {Array.from({ length: 20 }).map((_, i) => (
      <ConfettiParticle
        key={i}
        delay={i * 0.08}
        x={10 + Math.random() * 80}
        color={confettiColors[i % confettiColors.length]}
      />
    ))}

    <motion.div
      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
    >
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-full bg-success"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 }}
      >
        <Check className="h-8 w-8 text-success-foreground" />
      </motion.div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex items-center gap-2 mb-2"
    >
      <PartyPopper className="h-5 w-5 text-primary" />
      <h3 className="text-xl font-bold text-foreground">Successful</h3>
      <PartyPopper className="h-5 w-5 text-primary" />
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mb-8 text-sm text-muted-foreground text-center"
    >
      Your transaction has been submitted<br />successfully
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="w-full flex flex-col items-center"
    >
      <Button onClick={onClose} className="w-full max-w-xs rounded-lg">Done</Button>
      <button onClick={onClose} className="mt-3 text-sm font-medium text-primary hover:underline">Go Back</button>
    </motion.div>
  </motion.div>
);

const amountOptions = ["N100", "N200", "N500", "N1000", "N2000", "N5000"];
const bettingAmountOptions = ["N500", "N1000", "N2000", "N5000", "N10000"];
const dataPackageOptions = ["20GB", "1GB", "2GB", "10GB"];

const getConfig = (type: PurchaseType) => {
  switch (type) {
    case "airtime":
      return { title: "Instant Airtime, Anytime!", subtitle: "Instant Airtime, Anytime!", totalSteps: 3 };
    case "data":
      return { title: "Stay Connected with Instant Data", subtitle: "Instant data, any network, hassle-free!", totalSteps: 3 };
    case "electricity":
      return { title: "Electricity Bill Payment", subtitle: "Pay your electricity bills in seconds", totalSteps: 4 };
    case "giftcard":
      return { title: "Gift Cards Payment", subtitle: "Pay your gift cards in seconds", totalSteps: 4 };
    case "cabletv":
      return { title: "Cable TV Payment", subtitle: "Pay your cable tv in seconds", totalSteps: 4 };
    case "betting":
      return { title: "Betting Payment", subtitle: "Pay your betting in seconds", totalSteps: 3 };
    case "esim":
      return { title: "Esim Payment", subtitle: "Pay your esim in seconds", totalSteps: 4 };
  }
};

const PurchaseModal = ({ open, onClose, type }: PurchaseModalProps) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [dataType, setDataType] = useState("");
  const [plan, setPlan] = useState("");
  const [coupon, setCoupon] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [billerName, setBillerName] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [giftCardCategory, setGiftCardCategory] = useState("");
  const [giftCardCountry, setGiftCardCountry] = useState("");
  const [giftCardSubCategory, setGiftCardSubCategory] = useState("");
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [giftCardImages, setGiftCardImages] = useState<string[]>([]);
  const [cableProvider, setCableProvider] = useState("");
  const [cablePlan, setCablePlan] = useState("");
  const [decoderNumber, setDecoderNumber] = useState("");
  const [bettingPlatform, setBettingPlatform] = useState("");
  const [bettingUserId, setBettingUserId] = useState("");
  const [esimCountry, setEsimCountry] = useState("");
  const [esimProvider, setEsimProvider] = useState("");
  const [esimPackage, setEsimPackage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Per-row debounce timers for bulk phone validation
  const bulkPhoneTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Bulk recharge state ──────────────────────────────────────────────────────
  const [isBulk, setIsBulk] = useState(false);
  type BulkRecipient = { phone: string; network: string; amount: string };
  const [bulkNumbers, setBulkNumbers] = useState<BulkRecipient[]>([{ phone: "", network: "", amount: "" }]);

  // ── Beneficiaries (persisted to localStorage) ────────────────────────────────
  const [beneficiaries, setBeneficiaries] = useState<{ name: string; phone: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("beneficiaries") || "[]"); } catch { return []; }
  });
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);

  const saveBeneficiary = () => {
    if (!phone || !fullName) return;
    const exists = beneficiaries.some(b => b.phone === phone);
    if (exists) return;
    const updated = [...beneficiaries, { name: fullName, phone }];
    setBeneficiaries(updated);
    localStorage.setItem("beneficiaries", JSON.stringify(updated));
  };

  const removeBeneficiary = (ph: string) => {
    const updated = beneficiaries.filter(b => b.phone !== ph);
    setBeneficiaries(updated);
    localStorage.setItem("beneficiaries", JSON.stringify(updated));
  };

  const isPhoneSaved = beneficiaries.some(b => b.phone === phone);

  /**
   * Auto-detect network for a single bulk row by calling validatePhoneNumber.
   * Uses the same normalisation + fuzzy name matching as the single-recharge flow.
   */
  const validateBulkPhone = async (phoneVal: string, idx: number) => {
    const digits = phoneVal.replace(/\D/g, "");
    let msisdn: string;
    if (digits.startsWith("234")) msisdn = digits;
    else if (digits.startsWith("0")) msisdn = "234" + digits.slice(1);
    else if (digits.length === 10) msisdn = "234" + digits;
    else msisdn = digits;

    try {
      const result = await validatePhoneNumber(msisdn);
      if (!result.success || !result.data?.operator) return;
      const detectedOperator = result.data.operator;
      const allNetworks = networks.length > 0 ? networks : [
        { id: "mtn", name: "MTN Nigeria", currency: "NGN", prefixes: [] },
        { id: "airtel", name: "Airtel Nigeria", currency: "NGN", prefixes: [] },
        { id: "glo", name: "Glo Nigeria", currency: "NGN", prefixes: [] },
        { id: "9mobile", name: "9mobile (Etisalat)", currency: "NGN", prefixes: [] },
      ];
      // 1. Exact id match
      let matched = allNetworks.find(n => n.id === detectedOperator.id);
      // 2. Fuzzy name match
      if (!matched) {
        const detName = detectedOperator.name.toLowerCase();
        matched = allNetworks.find(n => {
          const nn = n.name.toLowerCase();
          if (detName.includes("mtn") && nn.includes("mtn")) return true;
          if (detName.includes("airtel") && nn.includes("airtel")) return true;
          if (detName.includes("glo") && nn.includes("glo")) return true;
          if ((detName.includes("9mobile") || detName.includes("etisalat")) &&
            (nn.includes("9mobile") || nn.includes("etisalat"))) return true;
          return false;
        });
      }
      if (!matched) return;
      setBulkNumbers(prev => {
        const rows = [...(prev as BulkRecipient[])];
        if (rows[idx] && rows[idx].network !== matched!.id) {
          rows[idx] = { ...rows[idx], network: matched!.id };
        }
        return rows;
      });
    } catch { /* silent */ }
  };

  // API state
  const [loading, setLoading] = useState(false);
  const [networksLoading, setNetworksLoading] = useState(false);
  const [networks, setNetworks] = useState<Operator[]>([]);
  const [dataTypes, setDataTypes] = useState<SubCategory[]>([]);
  const [billers, setBillers] = useState<Operator[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [packages, setPackages] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Operator[]>([]);
  const [validatedAccount, setValidatedAccount] = useState<any>(null);
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation | null>(null);

  // ── Nigerian networks — display fallback only (used when API network list is empty) ──
  const NIGERIAN_NETWORKS: Operator[] = [
    { id: "mtn", name: "MTN Nigeria", currency: "NGN", prefixes: [] },
    { id: "airtel", name: "Airtel Nigeria", currency: "NGN", prefixes: [] },
    { id: "glo", name: "Glo Nigeria", currency: "NGN", prefixes: [] },
    { id: "9mobile", name: "9mobile (Etisalat)", currency: "NGN", prefixes: [] },
  ];

  // Load networks (+ data types for the data flow) when the modal opens
  useEffect(() => {
    if (!open) return;

    const loadNetworks = async () => {
      // Pre-populate with display fallback so the dropdown is never blank
      if (type === "airtime" || type === "data") {
        setNetworks(NIGERIAN_NETWORKS);
      }
      setNetworksLoading(true);
      try {
        let result;
        if (type === "airtime") {
          result = await getAirtimeNetworks();
        } else if (type === "data") {
          // Load networks and data types in parallel
          const [netResult, typesResult] = await Promise.all([
            getDataNetworks(),
            getDataTypes(),
          ]);
          if (Array.isArray(netResult.data) && netResult.data.length > 0) {
            setNetworks(netResult.data);
          }
          if (Array.isArray(typesResult.data) && typesResult.data.length > 0) {
            setDataTypes(typesResult.data);
          }
          setNetworksLoading(false);
          return; // early return — already handled above
        } else if (type === "electricity") {
          result = await getElectricityBillers();
          setBillers(result.data || []);
        } else if (type === "cabletv") {
          result = await getCableTvBillers();
          setBillers(result.data || []);
        } else if (type === "esim") {
          result = await getESimProviders("NG");
          setProviders(result.data || []);
        }

        // Upgrade to live API data if the response is non-empty
        if (type === "airtime") {
          const apiNetworks = result?.data;
          if (Array.isArray(apiNetworks) && apiNetworks.length > 0) {
            setNetworks(apiNetworks);
          }
        }
      } catch (error) {
        console.error("Failed to load networks from API:", error);
        // Fallback list is already set above
      } finally {
        setNetworksLoading(false);
      }
    };

    loadNetworks();
  }, [open, type]);

  // Detect network via API only — debounced 500ms, triggers once phone is 10+ digits
  useEffect(() => {
    if (phone.length < 10) {
      setPhoneValidation(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        /**
         * Normalise to international msisdn format (e.g. 2348031234567) before
         * calling the API, which does NOT understand local formats like 08031234567.
         *   +2348031234567  →  2348031234567  (strip leading +)
         *   2348031234567   →  2348031234567  (already correct)
         *   08031234567     →  2348031234567  (replace leading 0 with 234)
         *   8031234567      →  2348031234567  (prepend 234 to bare 10-digit)
         */
        const digits = phone.replace(/\D/g, "");
        let msisdn: string;
        if (digits.startsWith("234")) {
          msisdn = digits;
        } else if (digits.startsWith("0")) {
          msisdn = "234" + digits.slice(1);
        } else if (digits.length === 10) {
          msisdn = "234" + digits;
        } else {
          msisdn = digits; // pass through unchanged and let API decide
        }

        const result = await validatePhoneNumber(msisdn);
        if (result.success && result.data) {
          setPhoneValidation(result.data);
          const detectedOperator = result.data?.operator;
          if (detectedOperator) {
            // 1. Try exact ID match
            let matched = networks.find((n) => n.id === detectedOperator.id);
            // 2. Fallback: fuzzy name match (handles MTN Nigeria vs mtn-ng etc.)
            if (!matched) {
              const detName = detectedOperator.name.toLowerCase();
              matched = networks.find((n) => {
                const nn = n.name.toLowerCase();
                if (detName.includes("mtn") && nn.includes("mtn")) return true;
                if (detName.includes("airtel") && nn.includes("airtel")) return true;
                if (detName.includes("glo") && nn.includes("glo")) return true;
                if ((detName.includes("9mobile") || detName.includes("etisalat")) &&
                  (nn.includes("9mobile") || nn.includes("etisalat"))) return true;
                return false;
              });
            }
            if (matched) setNetwork(matched.id);
          }
        }
      } catch (error) {
        console.error("Phone validation failed:", error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [phone, networks]);

  // Load payment plans when biller/provider changes
  useEffect(() => {
    const loadPaymentPlans = async () => {
      if (type === "electricity" && billerName) {
        setLoading(true);
        try {
          const result = await getElectricityPaymentPlans(billerName);
          setPaymentPlans(result.data || []);
        } catch (error) {
          console.error("Failed to load payment plans:", error);
        } finally {
          setLoading(false);
        }
      } else if (type === "cabletv" && cableProvider) {
        setLoading(true);
        try {
          const result = await getCableTvPaymentPlans(cableProvider);
          setPaymentPlans(result.data || []);
        } catch (error) {
          console.error("Failed to load cable TV plans:", error);
        } finally {
          setLoading(false);
        }
      } else if (type === "esim" && esimProvider) {
        setLoading(true);
        try {
          const result = await getESimPackages(esimProvider);
          setPackages(result.data || []);
        } catch (error) {
          console.error("Failed to load eSIM packages:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPaymentPlans();
  }, [billerName, cableProvider, esimProvider, type]);

  // Load data plans when network or data type changes
  // dataType now stores the category_id directly (e.g. "4.1", "4.3") from the API
  useEffect(() => {

    /**
     * Client-side plan filter.
     * The API /public/data/plans does not filter by typeId server-side —
     * it returns all plans for the network. We filter by plan name keywords.
     */
    const filterPlansByType = (plans: Product[], categoryId: string): Product[] => {
      switch (categoryId) {
        case "4.1": // Daily Bundles — 1 or 2 day plans
          return plans.filter(p =>
            /\(1\s*day\)/i.test(p.name) ||
            /\(2\s*days?\)/i.test(p.name) ||
            /\bdaily\b/i.test(p.name)
          );
        case "4.2": // 7-14 Day Bundles — weekly plans
          return plans.filter(p =>
            /\([7-9]\s*days?\)/i.test(p.name) ||
            /\(1[0-4]\s*days?\)/i.test(p.name) ||
            /\bweekly\b/i.test(p.name)
          );
        case "4.3": // Monthly Bundles — 30-day plans, excluding SME/business
          return plans.filter(p =>
            (/\(30\s*days?\)/i.test(p.name) || /\bmonthly\b/i.test(p.name)) &&
            !/hynetflex|xtra bundle|5g router|sme/i.test(p.name)
          );
        case "4.4": // Extended Validity — 2+ month, 90 day, yearly
          return plans.filter(p =>
            /2-month|3-month|\(90\s*days?\)|\b1\s*year\b|broadband|\b3\s*months\b|\b2\s*months\b/i.test(p.name)
          );
        case "4.5": // Special Offers
          return plans.filter(p =>
            /special|bonus|xtraview|promo/i.test(p.name)
          );
        case "4.6": // SME Data Share
          return plans.filter(p =>
            /hynetflex|xtra bundle|5g router|sme/i.test(p.name)
          );
        default:
          return plans;
      }
    };

    const loadDataPlans = async () => {
      if (type === "data" && network && dataType) {
        setLoading(true);
        try {
          // dataType already holds the category_id (e.g. "4.3" for monthly)
          // network holds the networkId (e.g. "1" for MTN Nigeria)
          const result = await getDataPlans(dataType, network);
          const allPlans = result.data || [];
          const filtered = filterPlansByType(allPlans, dataType);
          // If filter yields nothing (e.g. no special offers for this network),
          // fall back to showing all plans so the dropdown is never empty
          setPackages(filtered.length > 0 ? filtered : allPlans);
        } catch (error) {
          console.error("Failed to load data plans:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDataPlans();
  }, [network, dataType, type]);

  // Validate account when meter/decoder number changes
  const validateAccountNumber = async (accountNumber: string, productId: string) => {
    if (!accountNumber || !productId) return;

    setLoading(true);
    try {
      const result = await validateAccount(accountNumber, productId);
      if (result.success) {
        setValidatedAccount(result.data);
      }
    } catch (error) {
      console.error("Account validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setPhone(""); setNetwork(""); setAmount("");
    setDataType(""); setPlan(""); setCoupon(""); setEmail(""); setFullName("");
    setBillerName(""); setPaymentType(""); setMeterNumber("");
    setGiftCardCategory(""); setGiftCardCountry("");
    setGiftCardSubCategory(""); setGiftCardAmount("");
    setGiftCardImages([]);
    setCableProvider(""); setCablePlan(""); setDecoderNumber("");
    setBettingPlatform(""); setBettingUserId("");
    setEsimCountry(""); setEsimProvider(""); setEsimPackage("");
    // Reset bulk
    setIsBulk(false); setBulkNumbers([{ phone: "", network: "", amount: "" }]);
    setShowBeneficiaries(false);
    // Reset API state
    setNetworks([]); setDataTypes([]); setBillers([]); setPaymentPlans([]);
    setPackages([]); setProviders([]); setValidatedAccount(null);
    setPhoneValidation(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setGiftCardImages((prev) => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const config = getConfig(type);
  const stepLabels = getStepLabels(type);
  const successStep = config.totalSteps;

  const getConfirmStep = () => {
    switch (type) {
      case "airtime": case "data": case "betting": return 2;
      case "electricity": case "giftcard": case "cabletv": case "esim": return config.totalSteps - 1;
    }
  };
  const confirmStepNum = getConfirmStep();

  // Build confirm rows based on type
  const getConfirmRows = () => {
    const selectedNetwork = networks.find((n) => n.id === network);
    const selectedPlan = packages.find((p) => p.id === plan);
    const selectedCableProvider = billers.find((b) => b.id === cableProvider);
    const selectedCablePlan = paymentPlans.find((p) => p.id === cablePlan);
    const selectedEsimProvider = providers.find((p) => p.id === esimProvider);
    const selectedEsimPkg = packages.find((p) => p.id === esimPackage);

    switch (type) {
      case "airtime":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Network:", value: selectedNetwork?.name || network || "—" },
          { label: "Phone Number:", value: phone || "—" },
          { label: "Amount:", value: `₦${(amount || "0").replace(/[₦N]/g, "")}` },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Loyalty Bonus:", value: calcBonus(amount) > 0 ? `+₦${calcBonus(amount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
      case "data":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Network:", value: selectedNetwork?.name || network || "—" },
          { label: "Data Plan:", value: selectedPlan?.name || plan || "—" },
          { label: "Phone Number:", value: phone || "—" },
          { label: "Amount:", value: `₦${(amount || "0").replace(/[₦N]/g, "")}` },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Loyalty Bonus:", value: calcBonus(amount) > 0 ? `+₦${calcBonus(amount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
      case "electricity":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Biller Name:", value: billers.find((b) => b.id === billerName)?.name || billerName || "—" },
          { label: "Account Name:", value: validatedAccount?.customerName || "Not validated" },
          { label: "Meter Number:", value: meterNumber || "—" },
          { label: "Amount:", value: `₦${(amount || "0").replace(/[₦N]/g, "")}` },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Loyalty Bonus:", value: calcBonus(amount) > 0 ? `+₦${calcBonus(amount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
      case "cabletv":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Provider:", value: selectedCableProvider?.name || cableProvider || "—" },
          { label: "Account Name:", value: validatedAccount?.customerName || "Not validated" },
          { label: "Plan:", value: selectedCablePlan?.name || cablePlan || "—" },
          { label: "Decoder Number:", value: decoderNumber || "—" },
          { label: "Amount:", value: `₦${(amount || "0").replace(/[₦N]/g, "")}` },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Loyalty Bonus:", value: calcBonus(amount) > 0 ? `+₦${calcBonus(amount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
      case "giftcard":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Category:", value: giftCardCategory || "—" },
          { label: "Country:", value: giftCardCountry || "—" },
          { label: "Type:", value: giftCardSubCategory || "—" },
          { label: "Amount:", value: `₦${(giftCardAmount || "0").replace(/[₦N]/g, "")}` },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Loyalty Bonus:", value: calcBonus(giftCardAmount) > 0 ? `+₦${calcBonus(giftCardAmount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
      case "betting":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Platform:", value: bettingPlatform || "—" },
          { label: "User ID:", value: bettingUserId || "—" },
          { label: "Amount:", value: `₦${(amount || "0").replace(/[₦N]/g, "")}` },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Date & Time:", value: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) },
          { label: "Loyalty Bonus:", value: calcBonus(amount) > 0 ? `+₦${calcBonus(amount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
      case "esim":
        return [
          { label: "Name:", value: fullName || "—" },
          { label: "Email:", value: email || "—" },
          { label: "Country:", value: esimCountry === "NG" ? "🇳🇬 Nigeria" : esimCountry === "GH" ? "🇬🇭 Ghana" : esimCountry === "KE" ? "🇰🇪 Kenya" : esimCountry === "ZA" ? "🇿🇦 South Africa" : esimCountry || "—" },
          { label: "Service Provider:", value: selectedEsimProvider?.name || esimProvider || "—" },
          { label: "Package:", value: selectedEsimPkg?.name || esimPackage || "—" },
          { label: "Amount:", value: `₦${(amount || "0").replace(/[₦N$]/g, "")}` },
          { label: "Phone Number:", value: phone || "—" },
          { label: "Stamp Duty:", value: "₦25.00" },
          { label: "Ref No:", value: "rf" + Math.random().toString(36).slice(2, 8) },
          { label: "Loyalty Bonus:", value: calcBonus(amount) > 0 ? `+₦${calcBonus(amount).toLocaleString("en-NG")} (1%)` : "—" },
        ];
    }
  };

  /**
   * Handle silent background registration using email and phone
   */
  const handleProceed = (action: () => void) => {
    if (email) {
      // Find the best phone number available (depending on flow)
      const phoneParam = phone || meterNumber || decoderNumber || bettingUserId || "+2340000000000";
      // Fire and forget - don't block the UI
      guestRegister(email, phoneParam, fullName).catch(console.error);
    }
    action();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        aria-describedby={undefined}
        className="fixed right-0 top-0 md:top-4 md:bottom-4 left-auto translate-x-0 translate-y-0 max-w-7xl w-full md:w-[95vw] p-0 md:p-4 gap-0 overflow-hidden rounded-none md:rounded-2xl h-screen md:h-[calc(100vh-2rem)] max-h-screen md:max-h-[calc(100vh-2rem)] data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-top-0 border-r-0 [&>button:last-of-type]:hidden"
      >
        <DialogTitle className="sr-only">{config.title}</DialogTitle>
        <DialogDescription className="sr-only">{config.subtitle}</DialogDescription>
        {/* Close icon — fixed just outside the modal's left edge on desktop, inside on mobile */}
        <button
          onClick={handleClose}
          className="fixed top-3 left-3 md:top-5 md:left-auto md:right-[calc(95vw+10px)] z-[9999] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex flex-col md:flex-row h-full overflow-hidden rounded-none md:rounded-2xl">
          <PromoSidebar />

          <div className="flex-1 p-6 pt-16 md:p-10 overflow-y-auto">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">{config.title}</h2>
              <Select defaultValue="nigeria">
                <SelectTrigger className="w-[130px] rounded-lg border-primary text-primary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nigeria">In Nigeria</SelectItem>
                  <SelectItem value="ghana">In Ghana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{config.subtitle}</p>

            <StepIndicator currentStep={step} totalSteps={config.totalSteps} labels={stepLabels} />

            {/* ==================== AIRTIME - Step 1 ==================== */}
            {type === "airtime" && step === 1 && (
              <StepTransition stepKey="airtime-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>

                  {/* ── Bulk / Single toggle ── */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsBulk(false); setBulkNumbers([""]); }}
                      className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all ${!isBulk ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                        }`}
                    >
                      Single Recharge
                    </button>
                    <button
                      onClick={() => setIsBulk(true)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${isBulk ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                        }`}
                    >
                      <Users className="h-3.5 w-3.5" /> Bulk Recharge
                    </button>
                  </div>

                  {!isBulk ? (
                    <>
                      {/* Single phone + beneficiary */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-semibold text-foreground">Phone Number</label>
                          <div className="flex gap-2">
                            {beneficiaries.length > 0 && (
                              <button
                                onClick={() => setShowBeneficiaries(v => !v)}
                                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                              >
                                <Bookmark className="h-3 w-3" /> Beneficiaries
                              </button>
                            )}
                            {phone && fullName && (
                              <button
                                onClick={isPhoneSaved ? undefined : saveBeneficiary}
                                className={`text-xs font-medium flex items-center gap-1 ${isPhoneSaved ? "text-green-600 cursor-default" : "text-primary hover:underline"
                                  }`}
                              >
                                {isPhoneSaved ? <BookmarkCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                                {isPhoneSaved ? "Saved" : "Save"}
                              </button>
                            )}
                          </div>
                        </div>
                        <Input placeholder="Enter Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg" />
                      </div>

                      {/* Beneficiary quick-select */}
                      {showBeneficiaries && beneficiaries.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl border border-border bg-muted/40 p-3 space-y-2"
                        >
                          <p className="text-xs font-semibold text-muted-foreground">Saved Beneficiaries</p>
                          {beneficiaries.map((b) => (
                            <div key={b.phone} className="flex items-center justify-between">
                              <button
                                onClick={() => { setPhone(b.phone); setFullName(b.name); setShowBeneficiaries(false); }}
                                className="flex-1 text-left"
                              >
                                <p className="text-sm font-semibold text-foreground">{b.name}</p>
                                <p className="text-xs text-muted-foreground">{b.phone}</p>
                              </button>
                              <button onClick={() => removeBeneficiary(b.phone)} className="text-muted-foreground hover:text-destructive p-1">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </>
                  ) : (
                    /* Bulk recharge — one row per recipient: phone | network | amount */
                    <div className="space-y-3">
                      {/* Column headers — desktop only */}
                      <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-center pb-1 border-b border-border">
                        <span className="text-[11px] font-semibold text-muted-foreground">Phone Number</span>
                        <span className="text-[11px] font-semibold text-muted-foreground text-center">Network</span>
                        <span className="text-[11px] font-semibold text-muted-foreground text-center">Amount (₦)</span>
                        <span />
                      </div>

                      <AnimatePresence>
                        {(bulkNumbers as BulkRecipient[]).map((row, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className={[
                              // Mobile: stacked card
                              "rounded-xl border border-border bg-muted/30 p-3 space-y-2",
                              // Desktop: inline grid row
                              "md:p-0 md:space-y-0 md:bg-transparent md:border-none md:rounded-none",
                              "md:grid md:grid-cols-[1fr_1fr_1fr_32px] md:gap-2 md:items-center",
                            ].join(" ")}
                          >
                            {/* Mobile-only: recipient label + delete button */}
                            <div className="flex items-center justify-between md:hidden">
                              <span className="text-xs font-bold text-foreground">Recipient {idx + 1}</span>
                              {(bulkNumbers as BulkRecipient[]).length > 1 && (
                                <button
                                  onClick={() => setBulkNumbers((bulkNumbers as BulkRecipient[]).filter((_, i) => i !== idx))}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block md:hidden">Phone Number</label>
                              <Input
                                placeholder="e.g. 0803 123 4567"
                                value={row.phone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...(bulkNumbers as BulkRecipient[])];
                                  updated[idx] = { ...updated[idx], phone: val };
                                  setBulkNumbers(updated);
                                  if (bulkPhoneTimers.current[idx]) clearTimeout(bulkPhoneTimers.current[idx]);
                                  if (val.replace(/\D/g, "").length >= 10) {
                                    bulkPhoneTimers.current[idx] = setTimeout(() => {
                                      validateBulkPhone(val, idx);
                                    }, 500);
                                  }
                                }}
                                className="rounded-lg text-sm h-9 w-full"
                              />
                            </div>

                            {/* Network */}
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block md:hidden">Network</label>
                              <div className="relative w-full">
                                <Select
                                  value={row.network}
                                  onValueChange={(v) => {
                                    const updated = [...(bulkNumbers as BulkRecipient[])];
                                    updated[idx] = { ...updated[idx], network: v };
                                    setBulkNumbers(updated);
                                  }}
                                  disabled={networksLoading}
                                >
                                  <SelectTrigger className="w-full rounded-lg h-9 text-xs">
                                    <SelectValue placeholder={networksLoading ? "Loading..." : "Choose Network"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {networksLoading ? (
                                      <SelectItem value="loading" disabled>
                                        <span className="flex items-center gap-2">
                                          <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                        </span>
                                      </SelectItem>
                                    ) : (
                                      networks.map((n) => (
                                        <SelectItem key={n.id} value={n.id}>
                                          <span className="flex items-center gap-2">
                                            <img src={getNetworkLogo(n.name)} alt={n.name} className="h-4 w-4 rounded-full object-cover" />
                                            {n.name}
                                          </span>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                {row.network && row.phone.replace(/\D/g, "").length >= 10 && (
                                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" title="Auto-detected" />
                                )}
                              </div>
                            </div>

                            {/* Amount */}
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block md:hidden">Amount (₦)</label>
                              <Input
                                placeholder="e.g. 500"
                                value={row.amount}
                                onChange={(e) => {
                                  const updated = [...(bulkNumbers as BulkRecipient[])];
                                  updated[idx] = { ...updated[idx], amount: e.target.value };
                                  setBulkNumbers(updated);
                                }}
                                className="w-full rounded-lg text-sm h-9"
                              />
                            </div>

                            {/* Delete — desktop only (mobile uses card header) */}
                            {(bulkNumbers as BulkRecipient[]).length > 1 ? (
                              <button
                                onClick={() => setBulkNumbers((bulkNumbers as BulkRecipient[]).filter((_, i) => i !== idx))}
                                className="hidden md:flex text-muted-foreground hover:text-destructive transition-colors p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : <span className="hidden md:block" />}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add row */}
                      <button
                        onClick={() => setBulkNumbers([...(bulkNumbers as BulkRecipient[]), { phone: "", network: "", amount: "" }])}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add another recipient
                      </button>

                      {/* Bulk PriceDisplay — stacks on mobile, side-by-side on sm+ */}
                      {(() => {
                        const rows = bulkNumbers as BulkRecipient[];
                        const total = rows.reduce((sum, r) => sum + (parseFloat(r.amount.replace(/[₦N,]/g, "")) || 0), 0);
                        const recipient1Amount = parseFloat((rows[0]?.amount || "0").replace(/[₦N,]/g, "")) || 0;
                        const bonus = recipient1Amount >= 1000 ? Math.floor(recipient1Amount * 0.01) : 0;
                        const recipient1Phone = rows[0]?.phone || "";
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col sm:flex-row overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50"
                          >
                            <div className="flex-1 bg-gradient-to-br from-navy to-navy/90 p-4">
                              <p className="text-xs text-navy-foreground/60">You will Pay</p>
                              <p className="text-2xl font-bold text-navy-foreground">
                                ₦{total.toLocaleString("en-NG")}<span className="text-sm">.00</span>
                              </p>
                              <p className="text-[10px] text-navy-foreground/50 mt-0.5">
                                {total < 1000 ? "Spend ₦1,000+ to unlock bonus" : `Across ${rows.filter(r => r.amount).length} recipient(s)`}
                              </p>
                            </div>
                            <div className="flex-1 bg-gradient-to-br from-navy/85 to-navy/75 p-4">
                              <p className="text-xs text-navy-foreground/60">You will get</p>
                              <motion.p
                                key={bonus}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-2xl font-bold text-navy-foreground"
                              >
                                ₦{(recipient1Amount + bonus).toLocaleString("en-NG")}<span className="text-sm">.00</span>
                              </motion.p>
                              {bonus > 0 ? (
                                <p className="text-[10px] text-green-300 font-semibold mt-0.5">
                                  🎁 +₦{bonus.toLocaleString("en-NG")} loyalty bonus (1%) on {recipient1Phone || "—"}
                                </p>
                              ) : (
                                <p className="text-[10px] text-navy-foreground/50 mt-0.5">
                                  0% loyalty earned on this amount on {recipient1Phone || "recipient 1"}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                  )}

                  {!isBulk && (
                    <>
                      <NetworkSelect value={network} onChange={setNetwork} networks={networks} loading={networksLoading} phoneValidation={phoneValidation} />
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">Amount</label>
                        <Input placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg" />
                      </div>
                      <AmountChips options={amountOptions} value={amount} onChange={setAmount} />
                      <PriceDisplay amount={amount} />
                    </>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Referral Code (Optional)</label>
                    <Input placeholder="Enter Referral Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleProceed(() => setStep(2))}
                      className="flex-1 rounded-lg"
                      disabled={
                        !email || !fullName ||
                        (isBulk
                          ? (bulkNumbers as { phone: string; network: string; amount: string }[]).filter(r => r.phone && r.network && r.amount).length === 0
                          : !phone || !network || !amount)
                      }
                    >
                      {isBulk
                        ? `Buy for ${(bulkNumbers as { phone: string; network: string; amount: string }[]).filter(r => r.phone && r.network && r.amount).length} recipient(s)`
                        : "Buy Now"}
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== DATA - Step 1 ==================== */}
            {type === "data" && step === 1 && (
              <StepTransition stepKey="data-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>

                  {/* ── Bulk / Single toggle ── */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsBulk(false); setBulkNumbers([""]); }}
                      className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all ${!isBulk ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                        }`}
                    >
                      Single Recharge
                    </button>
                    <button
                      onClick={() => setIsBulk(true)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${isBulk ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                        }`}
                    >
                      <Users className="h-3.5 w-3.5" /> Bulk Recharge
                    </button>
                  </div>

                  {!isBulk ? (
                    <>
                      {/* Single phone + beneficiary */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-semibold text-foreground">Phone Number</label>
                          <div className="flex gap-2">
                            {beneficiaries.length > 0 && (
                              <button
                                onClick={() => setShowBeneficiaries(v => !v)}
                                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                              >
                                <Bookmark className="h-3 w-3" /> Beneficiaries
                              </button>
                            )}
                            {phone && fullName && (
                              <button
                                onClick={isPhoneSaved ? undefined : saveBeneficiary}
                                className={`text-xs font-medium flex items-center gap-1 ${isPhoneSaved ? "text-green-600 cursor-default" : "text-primary hover:underline"
                                  }`}
                              >
                                {isPhoneSaved ? <BookmarkCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                                {isPhoneSaved ? "Saved" : "Save"}
                              </button>
                            )}
                          </div>
                        </div>
                        <Input placeholder="Enter Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg" />
                      </div>

                      {/* Beneficiary quick-select */}
                      {showBeneficiaries && beneficiaries.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl border border-border bg-muted/40 p-3 space-y-2"
                        >
                          <p className="text-xs font-semibold text-muted-foreground">Saved Beneficiaries</p>
                          {beneficiaries.map((b) => (
                            <div key={b.phone} className="flex items-center justify-between">
                              <button
                                onClick={() => { setPhone(b.phone); setFullName(b.name); setShowBeneficiaries(false); }}
                                className="flex-1 text-left"
                              >
                                <p className="text-sm font-semibold text-foreground">{b.name}</p>
                                <p className="text-xs text-muted-foreground">{b.phone}</p>
                              </button>
                              <button onClick={() => removeBeneficiary(b.phone)} className="text-muted-foreground hover:text-destructive p-1">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </>
                  ) : (
                    /* Bulk recharge — dynamic phone rows */
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Phone Numbers</label>
                      {bulkNumbers.map((num, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder={`Recipient ${idx + 1}`}
                            value={num}
                            onChange={(e) => {
                              const updated = [...bulkNumbers];
                              updated[idx] = e.target.value;
                              setBulkNumbers(updated);
                            }}
                            className="rounded-lg flex-1"
                          />
                          {bulkNumbers.length > 1 && (
                            <button
                              onClick={() => setBulkNumbers(bulkNumbers.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-destructive p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setBulkNumbers([...bulkNumbers, ""])}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add another number
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {bulkNumbers.filter(Boolean).length} recipient(s) selected
                      </p>
                    </div>
                  )}

                  <NetworkSelect value={network} onChange={(v) => { setNetwork(v); setDataType(""); setPlan(""); setPackages([]); setAmount(""); }} networks={networks} loading={networksLoading} phoneValidation={phoneValidation} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Choose Data Type</label>
                    <Select value={dataType} onValueChange={(v) => { setDataType(v); setPlan(""); setPackages([]); setAmount(""); }} disabled={!network}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={!network ? "Select network first" : dataTypes.length === 0 ? "Loading types..." : "Choose Data Type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {dataTypes.length === 0 ? (
                          <SelectItem value="__loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading types...
                            </span>
                          </SelectItem>
                        ) : (
                          dataTypes.map((dt) => (
                            <SelectItem key={dt.category_id} value={dt.category_id}>
                              {dt.name.replace(/^Mobile Data > /, "")}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Choose Plan</label>
                    <Select value={plan} onValueChange={(value) => {
                      setPlan(value);
                      const selectedPackage = packages.find(p => p.id === value);
                      if (selectedPackage) {
                        setAmount(selectedPackage.price.user || selectedPackage.price.operator);
                      }
                    }} disabled={!dataType || packages.length === 0}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={
                          !dataType ? "Select data type first" :
                            loading ? "Loading plans..." :
                              packages.length === 0 ? "No plans available" :
                                "Choose Plan"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading plans...
                            </span>
                          </SelectItem>
                        ) : (
                          packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name} — ₦{pkg.price.user || pkg.price.operator}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <PriceDisplay amount={amount} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Referral Code (Optional)</label>
                    <Input placeholder="Enter Referral Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleProceed(() => setStep(2))}
                      className="flex-1 rounded-lg"
                      disabled={
                        !network || !plan || !email || !fullName ||
                        (isBulk ? bulkNumbers.filter(Boolean).length === 0 : !phone)
                      }
                    >
                      {isBulk ? `Buy for ${bulkNumbers.filter(Boolean).length} recipient(s)` : "Buy Now"}
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}


            {/* ==================== ELECTRICITY - Step 1 ==================== */}
            {type === "electricity" && step === 1 && (
              <StepTransition stepKey="electricity-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Electricity Biller</label>
                    <Select value={billerName} onValueChange={setBillerName} disabled={networksLoading}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={networksLoading ? "Loading billers..." : "Select Biller"} />
                      </SelectTrigger>
                      <SelectContent>
                        {networksLoading ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </span>
                          </SelectItem>
                        ) : (
                          billers.map((biller) => (
                            <SelectItem key={biller.id} value={biller.id}>
                              {biller.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Meter Number</label>
                    <Input
                      placeholder="Enter Meter Number"
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleProceed(() => {
                        if (paymentPlans.length > 0) {
                          validateAccountNumber(meterNumber, paymentPlans[0].id);
                        }
                        setStep(2);
                      })}
                      className="flex-1 rounded-lg"
                      disabled={!billerName || !meterNumber || loading || !email || !fullName}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Validate Meter Number
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                  {validatedAccount && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success font-medium">✓ Account Validated</p>
                      <p className="text-xs text-muted-foreground">Customer: {validatedAccount.customerName}</p>
                    </div>
                  )}
                </div>
              </StepTransition>
            )}

            {/* ELECTRICITY - Step 2 (amount) */}
            {type === "electricity" && step === 2 && (
              <StepTransition stepKey="electricity-2">
                <div className="space-y-4">
                  {validatedAccount && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success font-medium">✓ Account Validated</p>
                      <p className="text-xs text-muted-foreground">Customer: {validatedAccount.customerName}</p>
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Amount</label>
                    <Input
                      placeholder={
                        paymentPlans.length > 0 && paymentPlans[0].price.min
                          ? `Enter Amount (₦${paymentPlans[0].price.min.operator} - ₦${paymentPlans[0].price.max?.operator})`
                          : "Enter Amount"
                      }
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-lg"
                    />
                    {paymentPlans.length > 0 && paymentPlans[0].price.min && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum: ₦{paymentPlans[0].price.min.operator} | Maximum: ₦{paymentPlans[0].price.max?.operator}
                      </p>
                    )}
                  </div>
                  <PriceDisplay amount={amount} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Referral Code (Optional)</label>
                    <Input placeholder="Enter Referral Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setStep(3)} className="flex-1 rounded-lg" disabled={!amount}>
                      Buy Now
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg px-8">Go Back</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== CABLE TV - Step 1 ==================== */}
            {type === "cabletv" && step === 1 && (
              <StepTransition stepKey="cabletv-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Choose Provider</label>
                    <Select value={cableProvider} onValueChange={setCableProvider} disabled={loading}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={loading ? "Loading providers..." : "Choose Provider"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </span>
                          </SelectItem>
                        ) : (
                          billers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Referral Code (Optional)</label>
                    <Input placeholder="Enter Referral Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleProceed(() => setStep(2))} className="flex-1 rounded-lg" disabled={!cableProvider || !fullName || !email}>
                      Proceed
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* CABLE TV - Step 2 (plan + decoder) */}
            {type === "cabletv" && step === 2 && (
              <StepTransition stepKey="cabletv-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Choose Provider</label>
                    <Select value={cableProvider} onValueChange={setCableProvider} disabled>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {billers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Choose Plan</label>
                    <Select value={cablePlan} onValueChange={(value) => {
                      setCablePlan(value);
                      const selectedPlan = paymentPlans.find(p => p.id === value);
                      if (selectedPlan) {
                        setAmount(selectedPlan.price.user || selectedPlan.price.operator || "0");
                      }
                    }} disabled={paymentPlans.length === 0}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={
                          loading ? "Loading plans..." :
                            paymentPlans.length === 0 ? "No plans available" :
                              "Choose Plan"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading plans...
                            </span>
                          </SelectItem>
                        ) : (
                          paymentPlans.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — ₦{p.price.user || p.price.operator}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Decoder / Smart Card Number</label>
                    <Input
                      placeholder="Enter Decoder Number"
                      value={decoderNumber}
                      onChange={(e) => setDecoderNumber(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <PriceDisplay amount={amount || "0"} />
                  {validatedAccount && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success font-medium">✓ Account Validated</p>
                      <p className="text-xs text-muted-foreground">Customer: {validatedAccount.customerName}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleProceed(() => {
                        if (cablePlan) {
                          validateAccountNumber(decoderNumber, cablePlan);
                        }
                        setStep(3);
                      })}
                      className="flex-1 rounded-lg"
                      disabled={!cablePlan || !decoderNumber}
                    >
                      Buy Now
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg px-8">Go Back</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== GIFT CARD - Step 1 ==================== */}
            {type === "giftcard" && step === 1 && (
              <StepTransition stepKey="giftcard-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Gift Card Category</label>
                    <Select value={giftCardCategory} onValueChange={setGiftCardCategory}>
                      <SelectTrigger className="rounded-lg"><SelectValue placeholder="Gift Card Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Amazon">Amazon</SelectItem>
                        <SelectItem value="iTunes">iTunes</SelectItem>
                        <SelectItem value="Google Play">Google Play</SelectItem>
                        <SelectItem value="Steam">Steam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Gift Card Country (Optional)</label>
                    <Select value={giftCardCountry} onValueChange={setGiftCardCountry}>
                      <SelectTrigger className="rounded-lg"><SelectValue placeholder="Gift Card Country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="NG">Nigeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Gift card Type/ Sub-Category</label>
                    <Select value={giftCardSubCategory} onValueChange={setGiftCardSubCategory}>
                      <SelectTrigger className="rounded-lg"><SelectValue placeholder="select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physical">Physical</SelectItem>
                        <SelectItem value="Digital">Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Amount</label>
                    <Select value={giftCardAmount} onValueChange={setGiftCardAmount}>
                      <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select Amount" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">N5,000</SelectItem>
                        <SelectItem value="10000">N10,000</SelectItem>
                        <SelectItem value="20000">N20,000</SelectItem>
                        <SelectItem value="50000">N50,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <PriceDisplay amount={giftCardAmount} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Upload Gift Card Image</label>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </motion.button>
                      {giftCardImages.map((img, i) => (
                        <motion.img
                          key={i}
                          src={img}
                          alt=""
                          className="h-14 w-14 rounded-lg object-cover"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      ))}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">You can upload multiple files at once</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setStep(2)} className="flex-1 rounded-lg">Proceed</Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* GIFT CARD - Step 2 (contact details) */}
            {type === "giftcard" && step === 2 && (
              <StepTransition stepKey="giftcard-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Phone Number</label>
                    <Input placeholder="Enter Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleProceed(() => setStep(3))} className="flex-1 rounded-lg" disabled={!phone || !email || !fullName}>Proceed</Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== BETTING - Step 1 ==================== */}
            {type === "betting" && step === 1 && (
              <StepTransition stepKey="betting-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Betting Platform</label>
                    <Select value={bettingPlatform} onValueChange={setBettingPlatform}>
                      <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select Betting Platform" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bet9ja">Bet9ja</SelectItem>
                        <SelectItem value="SportyBet">SportyBet</SelectItem>
                        <SelectItem value="1xBet">1xBet</SelectItem>
                        <SelectItem value="BetKing">BetKing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">User ID</label>
                    <Input placeholder="Enter User ID" value={bettingUserId} onChange={(e) => setBettingUserId(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Enter Amount</label>
                    <Input placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg" />
                  </div>
                  <AmountChips options={bettingAmountOptions} value={amount} onChange={setAmount} />
                  <PriceDisplay amount={amount} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Referral Code (Optional)</label>
                    <Input placeholder="Enter Referral Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleProceed(() => setStep(2))} className="flex-1 rounded-lg" disabled={!bettingUserId || !amount || !email || !fullName}>Next</Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== ESIM - Step 1 ==================== */}
            {type === "esim" && step === 1 && (
              <StepTransition stepKey="esim-1">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Country</label>
                    <Select value={esimCountry} onValueChange={async (value) => {
                      setEsimCountry(value);
                      // Load providers for selected country
                      setLoading(true);
                      try {
                        const result = await getESimProviders(value);
                        setProviders(result.data || []);
                      } catch (error) {
                        console.error("Failed to load eSIM providers:", error);
                      } finally {
                        setLoading(false);
                      }
                    }}>
                      <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select Country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                        <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                        <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                        <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Referral Code (Optional)</label>
                    <Input placeholder="Enter Referral Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setStep(2)} className="flex-1 rounded-lg" disabled={!esimCountry}>
                      Next
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ESIM - Step 2 (provider, phone, package) */}
            {type === "esim" && step === 2 && (
              <StepTransition stepKey="esim-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Country</label>
                    <Select value={esimCountry} onValueChange={setEsimCountry} disabled>
                      <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                        <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                        <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                        <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Service Provider</label>
                    <Select value={esimProvider} onValueChange={setEsimProvider} disabled={providers.length === 0}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={
                          loading ? "Loading providers..." :
                            providers.length === 0 ? "No providers available" :
                              "Select Provider"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </span>
                          </SelectItem>
                        ) : (
                          providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Phone Number</label>
                    <Input placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Full Name</label>
                    <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email Address</label>
                    <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Available Package</label>
                    <Select value={esimPackage} onValueChange={(value) => {
                      setEsimPackage(value);
                      const selectedPackage = packages.find(p => p.id === value);
                      if (selectedPackage) {
                        setAmount(selectedPackage.price.operator);
                      }
                    }} disabled={packages.length === 0}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={
                          !esimProvider ? "Select provider first" :
                            loading ? "Loading packages..." :
                              packages.length === 0 ? "No packages available" :
                                "Select Package"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </span>
                          </SelectItem>
                        ) : (
                          packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name} - ${pkg.price.operator}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* eSIM packages are priced in USD */}
                  <p className="text-sm text-muted-foreground">
                    {amount ? <>Total: <span className="font-semibold text-foreground">${amount}</span> USD</> : null}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleProceed(() => setStep(3))} className="flex-1 rounded-lg" disabled={!esimProvider || !esimPackage || !phone || !email || !fullName}>
                      Proceed
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="rounded-lg px-8">Close</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== CONFIRM STEP (shared) ==================== */}
            {step === confirmStepNum && (
              <StepTransition stepKey={`confirm-${type}`}>
                <div>
                  <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-foreground">
                    Confirm Transaction
                  </h3>
                  <div className="border-t border-dashed border-border" />
                  <div className="space-y-5 py-5">
                    {getConfirmRows().map((row, i) => (
                      <motion.div
                        key={row.label}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span className="text-sm text-muted-foreground">{row.label}</span>
                        <span className="text-sm font-semibold text-foreground">{row.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-border" />
                  <div className="flex gap-3 pt-6">
                    <Button onClick={() => setStep(step + 1)} className="flex-1 rounded-lg">Confirm</Button>
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-lg px-8">Go Back</Button>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* ==================== SUCCESS STEP (shared) ==================== */}
            {step === successStep && step > 1 && <SuccessStep onClose={handleClose} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
