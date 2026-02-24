import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, RefreshCw, Loader2, Star, Tag } from "lucide-react";

const BASE = "https://fuspay-marketplace-api.fly.dev/api/v1";
const BASE_LINK = "https://buy.onshops.online";
const PAGE_SIZE = 12;
const AUTOPLAY_MS = 3500;

/* ── Types ── */
interface Price {
    currency: string;
    price: string;
    discount: string | null;
}
interface Product {
    id: string;
    name: string;
    description: string | null;
    images: string[];
    tags: string[];
    averageRating: string;
    status: string;
    category: { name: string } | null;
    store: {
        name: string;
        slug: string;
        logoUrl: string | null;
        industry: string | null;
    };
    prices: Price[];
    _count: { orderItems: number };
}

/* ── Helpers ── */
function buildProductUrl(slug: string): string {
    return `${BASE_LINK}/${slug}`;
}

function formatPrice(prices: Price[]): string {
    if (!prices.length) return "—";
    const p = prices[0];
    const sym = p.currency === "NGN" ? "₦" : p.currency === "GHS" ? "GH₵" : p.currency + " ";
    return `${sym}${Number(p.price).toLocaleString()}`;
}

function discountPct(prices: Price[]): number | null {
    if (!prices.length) return null;
    const d = Number(prices[0].discount);
    return d > 0 ? d : null;
}

/* ── Skeleton card ── */
function SkeletonCard() {
    return (
        <div className="rounded-2xl overflow-hidden bg-muted/60 animate-pulse ring-1 ring-border/30 w-full h-full flex flex-col">
            <div className="h-[180px] bg-muted flex-shrink-0" />
            <div className="p-3 space-y-2 flex-1">
                <div className="h-3.5 bg-muted-foreground/15 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
                <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                <div className="h-8 bg-primary/15 rounded-xl mt-2" />
            </div>
        </div>
    );
}

/* ── Product card ── */
function ProductCard({ product }: { product: Product }) {
    const img = product.images[0] ?? null;
    const logoUrl = product.store.logoUrl;
    const price = formatPrice(product.prices);
    const disc = discountPct(product.prices);
    const rating = parseFloat(product.averageRating) || 0;
    const sold = product._count.orderItems;

    return (
        <div
            className="group relative rounded-2xl overflow-hidden shadow-md ring-1 ring-border/40 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
            onClick={() => window.open(buildProductUrl(product.store.slug), "_blank", "noopener")}
        >
            {/* ── Image ── */}
            <div className="relative h-[180px] bg-gradient-to-br from-gray-800 via-slate-700 to-zinc-700 overflow-hidden flex-shrink-0">
                {img ? (
                    <img
                        src={img}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                ) : (
                    /* Placeholder when no product image */
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <ShoppingBag className="h-14 w-14 text-white" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Discount badge */}
                {disc && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{disc}%
                    </span>
                )}

                {/* Category badge */}
                {product.category && (
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-sm text-white border border-white/20 px-2 py-0.5 rounded-full">
                        {product.category.name}
                    </span>
                )}

                {/* Store logo watermark */}
                {logoUrl && (
                    <div className="absolute bottom-2.5 left-2.5 h-7 w-7 rounded-lg overflow-hidden ring-1 ring-white/30 bg-white shadow">
                        <img
                            src={logoUrl}
                            alt={product.store.name}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col flex-1 p-3 gap-1.5">
                {/* Store name */}
                <p className="text-[10px] font-bold text-primary uppercase tracking-wide line-clamp-1">
                    {product.store.name}
                </p>

                {/* Product name */}
                <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
                    {product.name}
                </h3>

                {/* Tags */}
                {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((t) => (
                            <span key={t} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                                <Tag className="h-2.5 w-2.5" />{t}
                            </span>
                        ))}
                    </div>
                )}

                {/* Rating + sold */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {rating > 0 ? rating.toFixed(1) : "New"}
                    </span>
                    {sold > 0 && <span>· {sold} sold</span>}
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between pt-1.5">
                    <span className="text-base font-black text-foreground">{price}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(buildProductUrl(product.store.slug), "_blank", "noopener");
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold px-3 py-1.5 transition-all duration-200 border border-primary/20 hover:border-primary"
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [current, setCurrent] = useState(0);
    const pausedRef = useRef(false);
    const maxIndexRef = useRef(0);

    /* ── Responsive visible count ── */
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

    /* ── Fetch ── */
    const fetchPage = useCallback(async (pg: number, append = false) => {
        append ? setLoadingMore(true) : setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${BASE}/products/public?page=${pg}&limit=${PAGE_SIZE}`);
            const json = await res.json();
            const list: Product[] = json.data?.data ?? [];
            const lastPage: number = json.data?.lastpage ?? 1;
            const active = list.filter((p) => p.status === "PUBLISHED" && p.isVisible !== false);
            setProducts((prev) => append ? [...prev, ...active] : active);
            setHasMore(pg < lastPage);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchPage(1); }, [fetchPage]);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPage(next, true);
    };

    /* ── Autoplay ── */
    const maxIndex = Math.max(0, products.length - visible);
    useEffect(() => { maxIndexRef.current = maxIndex; }, [maxIndex]);

    const next = useCallback(() => {
        setCurrent((c) => (c >= maxIndexRef.current ? 0 : c + 1));
    }, []);

    useEffect(() => {
        if (products.length === 0) return;
        const id = setInterval(() => {
            if (!pausedRef.current) next();
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products.length, next]);

    const cardW = 100 / visible;

    return (
        <section className="mt-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Our Offers</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Products from merchants across our marketplace
                    </p>
                </div>
                <a
                    href={BASE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary border border-primary/30 rounded-full px-3.5 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
                >
                    View All →
                </a>
            </div>

            {/* Loading */}
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
                    <button
                        onClick={() => fetchPage(1)}
                        className="flex items-center gap-2 text-sm font-bold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Try again
                    </button>
                </div>
            )}

            {/* Carousel */}
            {!loading && !error && products.length > 0 && (
                <div
                    className="relative w-full overflow-hidden"
                    onPointerEnter={() => { pausedRef.current = true; }}
                    onPointerLeave={() => { pausedRef.current = false; }}
                >
                    {/* Track — translate by full card slots, not % of element */}
                    <div className="overflow-hidden w-full">
                        <motion.div
                            className="flex w-full"
                            animate={{ x: `-${current * (100 / visible)}%` }}
                            style={{ width: `${(products.length / visible) * 100}%` }}
                            transition={{ type: "spring", stiffness: 260, damping: 32 }}
                        >
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex-shrink-0 px-1.5 box-border"
                                    style={{ width: `${100 / products.length}%` }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrent(i); pausedRef.current = true; setTimeout(() => { pausedRef.current = false; }, 5000); }}
                                className={`rounded-full transition-all duration-300 ${i === current ? "bg-primary w-5 h-2" : "bg-border hover:bg-muted-foreground w-2 h-2"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="flex items-center gap-2 text-sm font-bold text-primary border border-primary/30 rounded-full px-5 py-2.5 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-60"
                            >
                                {loadingMore
                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...</>
                                    : <>Load More Products</>
                                }
                            </button>
                        </div>
                    )}
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
