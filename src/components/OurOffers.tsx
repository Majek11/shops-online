import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
    ExternalLink,
    MapPin, ShoppingBag, RefreshCw, Loader2,
} from "lucide-react";

const BASE = "https://fuspay-marketplace-api.fly.dev/api/v1";
const BASE_LINK = "https://buy.onshops.online";

/* Build storefront URL: https://buy.onshops.online/{slug} */
function buildStoreUrl(store: { slug: string }): string {
    return `${BASE_LINK}/${store.slug}`;
}
const PAGE_SIZE = 10;
const AUTOPLAY_MS = 3800;

/* ── Types ── */
interface Branding {
    heroBanner?: string | null;
}
interface Store {
    id: string;
    name: string;
    slug: string;
    industry: string | null;
    logoUrl: string | null;
    description: string | null;
    address: string | null;
    storeUrl: string;
    country: string;
    status: string;
    branding?: Branding | null;
}

/* ── Skeleton ── */
function SkeletonCard() {
    return (
        <div className="rounded-2xl overflow-hidden bg-muted/60 animate-pulse ring-1 ring-border/30 flex-shrink-0 w-full">
            <div className="h-[200px] bg-muted" />
            <div className="p-4 space-y-2.5">
                <div className="h-4 bg-muted-foreground/15 rounded w-2/3" />
                <div className="h-3 bg-muted-foreground/10 rounded w-1/3" />
                <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                <div className="h-9 bg-primary/15 rounded-xl mt-3" />
            </div>
        </div>
    );
}

/* ── Card ── */
function OfferCard({ store }: { store: Store }) {
    const hero = store.branding?.heroBanner;
    const logo = store.logoUrl;

    return (
        <div
            className="group relative rounded-2xl overflow-hidden shadow-md ring-1 ring-border/40 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
            onClick={() => window.open(buildStoreUrl(store), "_blank", "noopener")}
        >
            {/* ── Banner ── */}
            <div className="relative h-[200px] bg-gradient-to-br from-gray-800 via-slate-700 to-zinc-800 overflow-hidden flex-shrink-0">
                {hero ? (
                    <img
                        src={hero}
                        alt={store.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                ) : logo ? (
                    <img
                        src={logo}
                        alt={store.name}
                        className="absolute inset-0 w-full h-full object-contain p-8 opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                ) : null}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Industry badge */}
                {store.industry && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-full">
                        {store.industry}
                    </span>
                )}

                {/* Logo pill (bottom-left) */}
                {logo && (
                    <div className="absolute bottom-3 left-3 h-9 w-9 rounded-xl overflow-hidden ring-2 ring-white/30 shadow-lg bg-white">
                        <img
                            src={logo}
                            alt={`${store.name} logo`}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col flex-1 p-4 gap-2">
                <div>
                    <h3 className="font-bold text-foreground text-base leading-tight line-clamp-1">{store.name}</h3>
                    {store.address && (
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">{store.address}</span>
                        </p>
                    )}
                </div>

                {store.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                        {store.description}
                    </p>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(buildStoreUrl(store), "_blank", "noopener");
                    }}
                    className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold py-2.5 transition-all duration-200 border border-primary/20 hover:border-primary"
                >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Shop Now
                    <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
            </div>
        </div>
    );
}

/* ── Main ── */
export default function OurOffers() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pausedRef = useRef(false);

    /* ── Visible cards per viewport ── */
    const getVisible = () => {
        if (typeof window === "undefined") return 3;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    };
    const [visible, setVisible] = useState(getVisible);
    useEffect(() => {
        const handler = () => setVisible(getVisible());
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    /* ── Fetch ── */
    const fetchPage = useCallback(async (pg: number, append = false) => {
        append ? setLoadingMore(true) : setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${BASE}/stores?page=${pg}&limit=${PAGE_SIZE}`);
            const json = await res.json();
            const list: Store[] = json.data?.stores ?? [];
            const total: number = json.data?.count ?? 0;
            const active = list.filter((s) => s.status === "ACTIVE" || !s.status);
            setStores((prev) => append ? [...prev, ...active] : active);
            setHasMore((pg * PAGE_SIZE) < total);
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

    /* ── Autoplay — ref-based so interval never goes stale ── */
    const maxIndex = Math.max(0, stores.length - visible);
    const maxIndexRef = useRef(maxIndex);
    useEffect(() => { maxIndexRef.current = maxIndex; }, [maxIndex]);

    const next = useCallback(() => {
        setCurrent((c) => (c >= maxIndexRef.current ? 0 : c + 1));
    }, []);

    useEffect(() => {
        if (stores.length === 0) return;
        const id = setInterval(() => {
            if (!pausedRef.current) next();
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stores.length, next]);

    /* ── Translate offset ── */
    const cardW = 100 / visible;   // % width per card

    return (
        <section className="mt-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Our Offers</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Discover merchants &amp; products from our marketplace
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

            {/* ── Loading ── */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl bg-muted/30 border border-border">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-foreground">Couldn't load offers</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Check your connection and try again</p>
                    <button
                        onClick={() => fetchPage(1)}
                        className="flex items-center gap-2 text-sm font-bold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Try again
                    </button>
                </div>
            )}

            {/* ── Carousel ── */}
            {!loading && !error && stores.length > 0 && (
                <div
                    className="relative"
                    onPointerEnter={() => { setPaused(true); pausedRef.current = true; }}
                    onPointerLeave={() => { setPaused(false); pausedRef.current = false; }}
                >
                    {/* Track */}
                    <div className="overflow-hidden rounded-2xl">
                        <motion.div
                            className="flex"
                            animate={{ x: `-${current * cardW}%` }}
                            transition={{ type: "spring", stiffness: 260, damping: 32 }}
                        >
                            {stores.map((store) => (
                                <div
                                    key={store.id}
                                    className="flex-shrink-0 px-1.5"
                                    style={{ width: `${cardW}%` }}
                                >
                                    <OfferCard store={store} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrent(i); setPaused(true); }}
                                className={`rounded-full transition-all duration-300 ${i === current
                                    ? "bg-primary w-5 h-2"
                                    : "bg-border hover:bg-muted-foreground w-2 h-2"
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
                                {loadingMore ? (
                                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more...</>
                                ) : (
                                    <>Load More Offers</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && stores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 rounded-2xl bg-muted/30 border border-border">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-foreground">No offers right now</p>
                    <p className="text-xs text-muted-foreground mt-1">Merchants are adding products daily. Check back soon!</p>
                </div>
            )}
        </section>
    );
}
