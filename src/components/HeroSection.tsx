import { useState, useEffect } from "react";
import slide1 from "@/assets/slide-1.png";
import slide2 from "@/assets/slide-2.png";
import slide3 from "@/assets/slide-3.png";
import heroLogo from "@/assets/shopsonline-logo.svg";


const slides = [slide1, slide2, slide3];

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy" style={{ height: "85vh", minHeight: 480 }}>
      {/* Sliding background images */}
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: activeSlide === i ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between p-8 h-full">
        {/* Top logo */}
        <div className="flex items-center gap-2">
          <img src={heroLogo} alt="ShopsOnline" className="h-6 brightness-0 invert" />
        </div>

        {/* Bottom content */}
        <div>
          <h1 className="mb-4 text-3xl font-bold text-primary-foreground leading-tight">
            Get <span className="text-success">1%</span> Bonus On Your<br />
            Utility Purchase
          </h1>
          <p className="mb-6 max-w-xs text-sm text-primary-foreground/70 leading-relaxed">
            OnShops.online is a growing digital directory of shops, SMEs, professionals, and service providers
            integrated into the digital economy across Africa.
          </p>
          <button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Visit Marketplace
          </button>
          <div className="mt-6 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? "w-6 bg-primary" : "w-6 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
