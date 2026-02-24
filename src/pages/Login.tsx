import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { otpLogin, verifyOtpLogin } from "@/lib/billstackApi";
import logo from "@/assets/shopsonline-logo.svg";

type Step = "email" | "otp" | "success";

const RESEND_SECONDS = 60;

export default function Login() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startResendTimer = () => {
        setResendTimer(RESEND_SECONDS);
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // ─── Step 1: Send OTP ────────────────────────────────────────────────────────
    const handleSendOtp = async () => {
        setError("");
        if (!email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        const res = await otpLogin(email);
        setLoading(false);
        if (res.success) {
            setStep("otp");
            startResendTimer();
            setTimeout(() => otpRefs.current[0]?.focus(), 150);
        } else {
            setError(res.message || "Failed to send OTP. Please try again.");
        }
    };

    // ─── Step 2: Verify OTP ──────────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        const token = otp.join("");
        if (token.length < 6) {
            setError("Please enter all 6 digits.");
            return;
        }
        setError("");
        setLoading(true);
        const res = await verifyOtpLogin(email, token);
        setLoading(false);
        if (res.success) {
            setStep("success");
            setTimeout(() => navigate("/dashboard"), 1800);
        } else {
            setError(res.message || "Invalid or expired code. Try again.");
            setOtp(Array(6).fill(""));
            setTimeout(() => otpRefs.current[0]?.focus(), 50);
        }
    };

    // ─── OTP box handlers ────────────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
        // Auto-submit when last box filled
        if (index === 5 && digit) {
            const fullToken = [...newOtp.slice(0, 5), digit].join("");
            if (fullToken.length === 6) {
                setTimeout(() => handleVerifyWithToken(fullToken), 100);
            }
        }
    };

    const handleVerifyWithToken = async (token: string) => {
        setError("");
        setLoading(true);
        const res = await verifyOtpLogin(email, token);
        setLoading(false);
        if (res.success) {
            setStep("success");
            setTimeout(() => navigate("/dashboard"), 1800);
        } else {
            setError(res.message || "Invalid or expired code. Try again.");
            setOtp(Array(6).fill(""));
            setTimeout(() => otpRefs.current[0]?.focus(), 50);
        }
    };

    const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === "Enter") handleVerifyOtp();
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setError("");
        setOtp(Array(6).fill(""));
        setLoading(true);
        const res = await otpLogin(email);
        setLoading(false);
        if (res.success) {
            startResendTimer();
            setTimeout(() => otpRefs.current[0]?.focus(), 150);
        } else {
            setError(res.message || "Failed to resend OTP.");
        }
    };

    // ─── Animations ──────────────────────────────────────────────────────────────
    const slideVariants = {
        enter: { x: 40, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -40, opacity: 0 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Link to="/">
                        <img src={logo} alt="ShopsOnline" className="h-9" />
                    </Link>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === "email" && (
                            <motion.div
                                key="email"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="p-8"
                            >
                                {/* Icon */}
                                <div className="mb-5 flex justify-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                        <Mail className="h-7 w-7 text-primary" />
                                    </div>
                                </div>

                                <h1 className="mb-1 text-center text-2xl font-bold text-foreground">
                                    Welcome back
                                </h1>
                                <p className="mb-7 text-center text-sm text-muted-foreground">
                                    Enter your email to receive a one-time login code
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                            Email Address
                                        </label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                                            className="rounded-xl h-12 text-base"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-destructive"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <Button
                                        className="w-full h-12 rounded-xl text-base font-semibold"
                                        onClick={handleSendOtp}
                                        disabled={loading || !email}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Continue"
                                        )}
                                    </Button>
                                </div>

                                <p className="mt-6 text-center text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link to="/" className="font-semibold text-primary hover:underline">
                                        Buy as guest
                                    </Link>
                                </p>
                            </motion.div>
                        )}

                        {step === "otp" && (
                            <motion.div
                                key="otp"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="p-8"
                            >
                                {/* Back button */}
                                <button
                                    onClick={() => { setStep("email"); setError(""); setOtp(Array(6).fill("")); }}
                                    className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>

                                <div className="mb-5 flex justify-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                        <ShieldCheck className="h-7 w-7 text-primary" />
                                    </div>
                                </div>

                                <h1 className="mb-1 text-center text-2xl font-bold text-foreground">
                                    Check your email
                                </h1>
                                <p className="mb-1 text-center text-sm text-muted-foreground">
                                    We sent a 6-digit code to
                                </p>
                                <p className="mb-7 text-center text-sm font-semibold text-foreground break-all">
                                    {email}
                                </p>

                                {/* OTP Boxes */}
                                <div className="mb-4 flex justify-center gap-2.5">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`h-13 w-11 rounded-xl border-2 bg-background text-center text-xl font-bold transition-all outline-none
                        ${digit ? "border-primary text-primary" : "border-border text-foreground"}
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                        ${error ? "border-destructive" : ""}
                      `}
                                            style={{ height: "3.25rem" }}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-3 text-center text-sm text-destructive"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <Button
                                    className="w-full h-12 rounded-xl text-base font-semibold"
                                    onClick={handleVerifyOtp}
                                    disabled={loading || otp.join("").length < 6}
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Verify & Log In"
                                    )}
                                </Button>

                                {/* Resend */}
                                <p className="mt-5 text-center text-sm text-muted-foreground">
                                    Didn't receive a code?{" "}
                                    <button
                                        onClick={handleResend}
                                        disabled={resendTimer > 0 || loading}
                                        className={`font-semibold transition-colors ${resendTimer > 0
                                                ? "text-muted-foreground cursor-default"
                                                : "text-primary hover:underline cursor-pointer"
                                            }`}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-8 flex flex-col items-center text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.1 }}
                                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </motion.div>
                                <h2 className="mb-2 text-2xl font-bold text-foreground">You're in! 🎉</h2>
                                <p className="text-sm text-muted-foreground">
                                    Login successful. Redirecting to your dashboard…
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <a href="#" className="underline hover:text-foreground">Terms</a> and{" "}
                    <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
