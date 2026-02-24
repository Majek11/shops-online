import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, RefreshCw, Star, Tag } from "lucide-react";

const BASE = "https://fuspay-marketplace-api.fly.dev/api/v1";
const BASE_LINK = "https://www.onshops.online/shops/all?type=Product";
const PAGE_SIZE = 12;
const AUTOPLAY_MS = 3800;

/* ── Types ── */
interface Price { currency: string; price: string; discount: string | null; }
interface Product {
    id: string;
    name: string;
    description: string | null;
    images: string[];
    tags: string[];
    averageRating: string;
    status: string;
    isVisible: boolean;
    category: { name: string } | null;
    store: { name: string; slug: string; logoUrl: string | null; industry: string | null; };
    prices: Price[];
    _count: { orderItems: number };
}

/* ── Helpers ── */
const buildUrl = (slug: string) => `${BASE_LINK}/${slug}`;

function formatPrice(prices: Price[]): string {
    if (!prices.length) return "";
    const p = prices[0];
    const sym = p.currency === "NGN" ? "₦" : p.currency === "GHS" ? "GH₵" : `${p.currency} `;
    return `${sym}${Number(p.price).toLocaleString()}`;
}

function discountPct(prices: Price[]): number | null {
    if (!prices.length) return null;
    const d = Number(prices[0].discount);
    return d > 0 ? d : null;
}

/* ── Skeleton ── */
function SkeletonCard() {
    return (
        <div className="rounded-2xl overflow-hidden bg-muted/60 animate-pulse ring-1 ring-border/30 flex flex-col">
            <div className="h-48 bg-muted" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-muted-foreground/15 rounded w-1/3" />
                <div className="h-4 bg-muted-foreground/15 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                <div className="h-8 bg-primary/15 rounded-xl mt-2" />
            </div>
        </div>
    );
}

/* ── Card ── */
function ProductCard({ product }: { product: Product }) {
    const img = product.images[0] ?? null;
    const logo = product.store.logoUrl;
    const price = formatPrice(product.prices);
    const disc = discountPct(product.prices);
    const stars = parseFloat(product.averageRating) || 0;
    const sold = product._count.orderItems;

    return (
        <div
            className="group rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card shadow hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={() => window.open(BASE_LINK, "_blank", "noopener")}
        >
            {/* Image area — h-36 mobile, h-48 sm+ */}
            <div className="relative w-full h-36 sm:h-48 bg-muted flex-shrink-0 overflow-hidden">
                {img ? (
                    <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Discount */}
                {disc && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{disc}%
                    </span>
                )}

                {/* Category */}
                {product.category && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                        {product.category.name}
                    </span>
                )}

                {/* Store logo */}
                {logo && (
                    <div className="absolute bottom-2 left-2 h-7 w-7 rounded-lg overflow-hidden ring-1 ring-white/30 bg-white shadow flex-shrink-0">
                        <img
                            src={logo}
                            alt={product.store.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1 sm:gap-1.5 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-wide truncate">{product.store.name}</p>

                <h3 className="font-bold text-foreground text-xs sm:text-sm leading-snug line-clamp-2">{product.name}</h3>

                {product.tags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((t) => (
                            <span key={t} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                                <Tag className="h-2.5 w-2.5 flex-shrink-0" />{t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        {stars > 0 ? stars.toFixed(1) : "New"}
                    </span>
                    {sold > 0 && <span>· {sold} sold</span>}
                </div>

                <div className="mt-auto flex items-center justify-between pt-1 gap-2 min-w-0">
                    <span className="text-sm sm:text-base font-black text-foreground truncate">{price || "—"}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(BASE_LINK, "_blank", "noopener"); }}
                        className="flex-shrink-0 flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold px-2.5 sm:px-3 py-1.5 transition-all border border-primary/20 hover:border-primary"
                    >
                        <ShoppingBag className="h-3 w-3" /> Buy
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main ── */
export default function OurOffers() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const pausedRef = useRef(false);

    /* Responsive: how many cards to show at once */
    const getVisible = () => {
        if (typeof window === "undefined") return 3;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    };
    const [visible, setVisible] = useState(getVisible);
    useEffect(() => {
        const h = () => setVisible(getVisible());
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    /* Fetch */
    const fetchPage = useCallback(async (pg: number, append = false) => {
        append ? null : setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${BASE}/products/public?page=${pg}&limit=${PAGE_SIZE}`);
            const json = await res.json();
            const list: Product[] = json.data?.data ?? [];
            const active = list.filter((p) => p.status === "PUBLISHED" && p.isVisible !== false);
            setProducts((prev) => append ? [...prev, ...active] : active);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPage(1); }, [fetchPage]);

    /* Autoplay — advances by 1 product each tick, wraps around */
    const totalSlides = Math.max(1, products.length - visible + 1);

    const tickNext = useCallback(() => {
        setSlideIndex((i) => (i + 1) >= totalSlides ? 0 : i + 1);
    }, [totalSlides]);

    useEffect(() => {
        if (products.length === 0) return;
        const id = setInterval(() => { if (!pausedRef.current) tickNext(); }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [products.length, tickNext]);

    /* Slice — only render the visible window */
    const visibleProducts = products.slice(slideIndex, slideIndex + visible);

    return (
        <section className="mt-8 w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Our Offers</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Products from merchants across our marketplace</p>
                </div>
                <a
                    href={BASE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary border border-primary/30 rounded-full px-3.5 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap flex-shrink-0"
                >
                    View All →
                </a>
            </div>

            {/* Loading skeletons */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl bg-muted/30 border border-border">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-foreground">Couldn't load products</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Check your connection and try again</p>
                    <button onClick={() => fetchPage(1)} className="flex items-center gap-2 text-sm font-bold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all">
                        <RefreshCw className="h-3.5 w-3.5" /> Try again
                    </button>
                </div>
            )}

            {/* Carousel — grid swap, no sliding track = zero overflow */}
            {!loading && !error && products.length > 0 && (
                <div
                    onPointerEnter={() => { pausedRef.current = true; }}
                    onPointerLeave={() => { pausedRef.current = false; }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={slideIndex}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {visibleProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Dot indicators */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                        {Array.from({ length: totalSlides }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setSlideIndex(i); pausedRef.current = true; setTimeout(() => { pausedRef.current = false; }, 5000); }}
                                className={`rounded-full transition-all duration-300 ${i === slideIndex ? "bg-primary w-5 h-2" : "bg-border hover:bg-muted-foreground w-2 h-2"
                                    }`}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Load more → redirects to marketplace */}
                    <div className="flex justify-center mt-6">
                        <a
                            href={BASE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-primary border border-primary/30 rounded-full px-5 py-2.5 hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                            Load More Products →
                        </a>
                    </div>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 rounded-2xl bg-muted/30 border border-border">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-foreground">No products yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Merchants are adding products daily!</p>
                </div>
            )}
        </section>
    );
}
