import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import slide1 from "@/assets/slide-1.png";
import slide2 from "@/assets/slide-2.png";
import slide3 from "@/assets/slide-3.png";
import heroLogo from "@/assets/shopsonline-logo.svg";

const slides = [slide1, slide2, slide3];

/* Same slide content as the modal PromoSidebar */
const slideContent = [
  {
    title: (
      <>
        <span className="text-primary">Discover</span> Sellers, SMEs,
        <br />Professionals Across
        <br />Markets
      </>
    ),
    description:
      "OnShops.online is a growing digital directory of shops, SMEs, professionals, and service providers integrated into the digital economy across Africa.",
    cta: "Visit Marketplace",
    href: "https://www.onshops.online/",
  },
  {
    title: (
      <>
        <span className="text-primary">Recharge</span> Airtime &amp; Data
        <br />Instantly,
        <br />Anytime
      </>
    ),
    description:
      "Top up your phone or a loved one's in seconds — MTN, Airtel, Glo, 9mobile — with a 1% loyalty bonus on every ₦1,000+ purchase.",
    cta: "Buy Airtime Now",
    href: "#",
  },
  {
    title: (
      <>
        <span className="text-primary">Pay Bills</span> Without
        <br />Leaving
        <br />Your Seat
      </>
    ),
    description:
      "Electricity, cable TV, betting wallets and more — pay all your utility bills in one place and earn loyalty rewards on every transaction.",
    cta: "Pay a Bill",
    href: "#",
  },
];

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-navy"
      style={{ height: "85vh", minHeight: 480 }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Sliding background images */}
      {slides.map((slide, i) => (
        <motion.img
          key={i}
          src={slide}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          animate={{ opacity: activeSlide === i ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      ))}

      {/* Gradient overlay — same as modal's "from-navy/95 via-navy/55" style */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/60 to-navy/20" />

      <div className="relative z-10 flex flex-col justify-between p-8 h-full">
        {/* Top logo */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <img src={heroLogo} alt="ShopsOnline" className="h-10 brightness-0 invert" />
        </motion.div>

        {/* Bottom — per-slide text with AnimatePresence, same as PromoSidebar */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <h1 className="mb-4 text-xl md:text-4xl font-bold text-primary-foreground leading-tight">
                {slideContent[activeSlide].title}
              </h1>
              <p className="mb-6 max-w-sm text-sm text-primary-foreground/70 leading-relaxed">
                {slideContent[activeSlide].description}
              </p>
              <motion.a
                href={slideContent[activeSlide].href}
                className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {slideContent[activeSlide].cta}
              </motion.a>
            </motion.div>
          </AnimatePresence>

          {/* Pill dots — same animated width as the modal */}
          <div className="mt-6 flex gap-2">
            {slides.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveSlide(i)}
                animate={{
                  width: i === activeSlide ? 24 : 8,
                  backgroundColor:
                    i === activeSlide
                      ? "hsl(var(--primary))"
                      : "rgba(255,255,255,0.3)",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
