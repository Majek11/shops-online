import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import slide1 from "@/assets/slide-1.png";
import slide2 from "@/assets/slide-2.png";
import slide3 from "@/assets/slide-3.png";
import heroLogo from "@/assets/shopsonline-logo.svg";

const slides = [slide1, slide2, slide3];

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

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
          initial={{ opacity: 0 }}
          animate={{ opacity: activeSlide === i ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between p-8 h-full">
        {/* Top logo */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <img src={heroLogo} alt="ShopsOnline" className="h-6 brightness-0 invert" />
        </motion.div>

        {/* Bottom content */}
        <div>
          <motion.h1
            className="mb-4 text-3xl font-bold text-primary-foreground leading-tight"
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            Get <span className="text-success">1%</span> Bonus On Your<br />
            Utility Purchase
          </motion.h1>
          <motion.p
            className="mb-6 max-w-xs text-sm text-primary-foreground/70 leading-relaxed"
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            OnShops.online is a growing digital directory of shops, SMEs, professionals, and service providers
            integrated into the digital economy across Africa.
          </motion.p>
          <motion.button
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Visit Marketplace
          </motion.button>
          <motion.div
            className="mt-6 flex gap-2"
            custom={3}
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            {slides.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveSlide(i)}
                animate={{ width: activeSlide === i ? 24 : 8, backgroundColor: activeSlide === i ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
