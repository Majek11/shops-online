interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  bgColor?: string;
  onClick?: () => void;
}

const ServiceCard = ({ title, description, image, bgColor, onClick }: ServiceCardProps) => {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{ backgroundColor: bgColor || "hsl(var(--card))" }}
      onClick={onClick}
    >
      <div className="p-4 pb-2">
        <h3 className="text-sm font-bold text-foreground mb-0.5">{title}</h3>
        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2 leading-relaxed">{description}</p>
        <span className="text-xs font-medium text-primary group-hover:underline">
          Buy Now →
        </span>
      </div>
      <div className="h-48 overflow-hidden flex items-end justify-center">
        <img
          src={image}
          alt={title}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </div>
  );
};

export default ServiceCard;
