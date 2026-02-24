import { motion } from "framer-motion";

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  bgColor?: string;
  onClick?: () => void;
}

const ServiceCard = ({ title, description, image, bgColor, onClick }: ServiceCardProps) => {
  return (
    <motion.div
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border"
      style={{ backgroundColor: bgColor || "hsl(var(--card))" }}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <div className="p-4 pb-2">
        <h3 className="text-sm font-bold text-foreground mb-0.5">{title}</h3>
        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2 leading-relaxed">{description}</p>
        <motion.span
          className="text-xs font-medium text-primary inline-block"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 600 }}
        >
          Buy Now →
        </motion.span>
      </div>
      <div className="h-48 overflow-hidden flex items-end justify-center">
        <motion.img
          src={image}
          alt={title}
          className="max-h-full max-w-full object-contain"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

export default ServiceCard;
