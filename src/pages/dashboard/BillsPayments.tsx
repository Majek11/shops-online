import { useState } from "react";
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

const services = [
  { title: "Airtime Purchase", description: "Don't run out of airtime for important call", image: airtimeImg, modalType: "airtime" as PurchaseType, bgColor: "#f5f5f0" },
  { title: "Data Purchase", description: "Don't miss important update on Instagram, Tiktok, stay connected", image: dataImg, modalType: "data" as PurchaseType, bgColor: "#f0f4f5" },
  { title: "Electricity Purchase", description: "Don't stay in darkness, make a quick recharge", image: electricityImg, modalType: "electricity" as PurchaseType, bgColor: "#f5f3f0" },
  { title: "Cable TV Subscription", description: "Don't miss family show, news update, renew your TV Cables", image: cableTvImg, modalType: "cabletv" as PurchaseType, bgColor: "#f0f3f5" },
  { title: "Betting", description: "Fund your betting account with ease with 1% top up", image: bettingImg, modalType: "betting" as PurchaseType, bgColor: "#f0f5f2" },
  { title: "Gift Card Purchase", description: "Buy Gift cards of popular brands and pay online seamlessly", image: giftCardsImg, modalType: "giftcard" as PurchaseType, bgColor: "#f5f0f4" },
  { title: "Global E-Sim", description: "International Data recharge to stay connected to internet anywhere you go", image: esimImg, modalType: "esim" as PurchaseType, bgColor: "#f2f0f5" },
];

const BillsPayments = () => {
  const [modalType, setModalType] = useState<PurchaseType | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Our Services</h1>
          <p className="text-sm text-muted-foreground">Monitor your airtime, data, electricity, and cable payments</p>
        </div>
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

      {/* Offer banner */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
        <p className="text-xs font-semibold text-primary mb-1">Offer</p>
        <h2 className="text-xl font-bold text-foreground mb-1">Get 1% of all your Utility Purchase</h2>
        <p className="text-sm text-muted-foreground">For every utility purchase you make, you get 1% value in airtime automatically to your phone number.</p>
      </div>

      <h2 className="text-xl font-bold text-foreground">Utility Services</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            description={service.description}
            image={service.image}
            bgColor={service.bgColor}
            onClick={() => setModalType(service.modalType)}
          />
        ))}
      </div>

      <PurchaseModal open={modalType !== null} onClose={() => setModalType(null)} type={modalType || "airtime"} />
    </div>
  );
};

export default BillsPayments;
