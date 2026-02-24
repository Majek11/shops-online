import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ReferralBanner from "@/components/ReferralBanner";
import ServiceCard from "@/components/ServiceCard";
import PurchaseModal, { type PurchaseType } from "@/components/PurchaseModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import airtimeImg from "@/assets/airtime-purchase.png";
import dataImg from "@/assets/data-purchase.png";
import electricityImg from "@/assets/electricity-purchase.png";
import bettingImg from "@/assets/betting.png";
import giftCardsImg from "@/assets/gift-cards.png";
import esimImg from "@/assets/esim.png";
import cableTvImg from "@/assets/cable-tv.png";

type ModalType = PurchaseType | null;

const services = [
  { title: "Airtime Purchase", description: "Don't run out of airtime for important call", image: airtimeImg, modalType: "airtime" as PurchaseType, bgColor: "#f5f5f0" },
  { title: "Data Purchase", description: "Don't miss important update on Instagram, Tiktok, stay connected", image: dataImg, modalType: "data" as PurchaseType, bgColor: "#f0f4f5" },
  { title: "Electricity Purchase", description: "Don't stay in darkness, make a quick recharge", image: electricityImg, modalType: "electricity" as PurchaseType, bgColor: "#f5f3f0" },
  { title: "Betting", description: "Fund your betting account with ease with 1% top up", image: bettingImg, modalType: "betting" as PurchaseType, bgColor: "#f0f5f2" },
  { title: "Gift Card Purchase", description: "Buy Gift cards of popular brands and pay online seamlessly", image: giftCardsImg, modalType: "giftcard" as PurchaseType, bgColor: "#f5f0f4" },
  { title: "Global E-Sim", description: "International Data recharge to stay connected to internet anywhere you go", image: esimImg, modalType: "esim" as PurchaseType, bgColor: "#f2f0f5" },
  { title: "Cable TV Subscription", description: "Don't miss family show, news update, renew your TV Cables", image: cableTvImg, modalType: "cabletv" as PurchaseType, bgColor: "#f0f3f5" },
];

const Index = () => {
  const [modalType, setModalType] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Main layout: Hero left, Referral + Services right */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Left column: Hero */}
          <div className="lg:w-[38%] lg:shrink-0 animate-fade-in lg:sticky lg:top-8 lg:self-start">
            <HeroSection />
          </div>

          {/* Right column: Referral + Services */}
          <div className="flex-1 flex flex-col gap-6 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <ReferralBanner />

            {/* Services header */}
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h2 className="text-2xl font-bold text-foreground">Our Services</h2>
                <Select defaultValue="nigeria">
                  <SelectTrigger className="w-[130px] rounded-full border-primary text-primary text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">In Nigeria</SelectItem>
                    <SelectItem value="ghana">In Ghana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Monitor your airtime, data, electricity, and cable payments</p>
            </div>

            {/* Service cards grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service, i) => (
                <div key={service.title} className="animate-fade-in" style={{ animationDelay: `${0.08 * (i + 1)}s`, animationFillMode: "both" }}>
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    image={service.image}
                    bgColor={service.bgColor}
                    onClick={service.modalType ? () => setModalType(service.modalType) : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PurchaseModal open={modalType !== null} onClose={() => setModalType(null)} type={modalType || "airtime"} />
    </div>
  );
};

export default Index;
