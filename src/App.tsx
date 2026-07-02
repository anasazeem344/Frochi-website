import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionValue, animate, type MotionValue } from "motion/react";
import {
  Sparkles,
  MapPin,
  Heart,
  ArrowRight,
  Check,
  Code,
  ExternalLink,
  ShoppingBag,
  ChevronRight,
  Maximize,
  HelpCircle,
  Clock,
  Plus,
  BookOpen,
  Mail
} from "lucide-react";
import { FLAVORS, TOPPINGS, GALLERY_ITEMS } from "./data";
import { Flavor, Topping, GalleryItem } from "./types";
import { generateWordPressCode } from "./WordPressCodeExporter";

// Dedicated flavor lineup for the "Our Flavours" showcase (its own order/subset, independent of FLAVORS)
const OUR_FLAVOURS = [
  { id: "acai", name: "Acai", description: "Packed with antioxidants and a tropical twist", cupImg: "https://frochi.ae/wp-content/uploads/2025/09/01-Acai-Plain-Cutout.png" },
  { id: "coconut", name: "Coconut", description: "Creamy and plant-based for a guilt-free dessert.", cupImg: "https://frochi.ae/wp-content/uploads/2025/09/08-Coconut-Plain-Cutout.png" },
  { id: "matcha", name: "Matcha", description: "A vibrant, earthy blend rich in antioxidants and natural energy.", cupImg: "https://frochi.ae/wp-content/uploads/2025/09/05-Matcha-Plain-Cutout.png" },
  { id: "taro", name: "Taro", description: "Smooth, creamy vibes with a hint of nuttiness and vanilla-like sweetness.", cupImg: "https://frochi.ae/wp-content/uploads/2025/09/06-Taro-Plain-Cutout.png" },
  { id: "salted-caramel", name: "Salted Caramel", description: "A deliciously decadent twist on the classic caramel favorite.", cupImg: "https://frochi.ae/wp-content/uploads/2025/09/07-Salted-Caramel-Plain-Cutout.png" }
];

// Shared stagger-reveal variant for the "Our Story" section
const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const } }
};

interface OurFlavourCupItemProps {
  key?: string;
  flavor: typeof OUR_FLAVOURS[number];
  idx: number;
  gap: number;
  stageWidth: number;
  trackX: MotionValue<number>;
  onClick: () => void;
  isDesktop: boolean;
}

// Renders one cup in the draggable "Our Flavours" track. Scale/opacity/z-index are derived
// continuously from the live drag position (trackX), so cups smoothly grow/shrink as they
// pass through the center while dragging, instead of snapping between fixed discrete states.
function OurFlavourCupItem({ flavor, idx, gap, stageWidth, trackX, onClick, isDesktop }: OurFlavourCupItemProps) {
  const scale = useTransform(trackX, (tx) => {
    const dist = Math.abs(idx * gap + tx) / gap;
    return Math.max(1.2 - dist * 0.25, 0.8);
  });
  const opacity = useTransform(trackX, (tx) => {
    const dist = Math.abs(idx * gap + tx) / gap;
    return Math.max(1 - dist * 0.3, 0.3);
  });
  // Capped below the flavor-text layer (z-60) so the text is never covered by a cup, even the centered one
  const zIndex = useTransform(trackX, (tx) => {
    const dist = Math.abs(idx * gap + tx) / gap;
    return Math.round(Math.max(50 - dist * 10, 1));
  });

  return (
    <motion.button
      type="button"
      aria-label={`Show ${flavor.name} flavour`}
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing bg-transparent border-none p-0"
      style={{ left: stageWidth / 2 + idx * gap, top: isDesktop ? "184px" : "152px", scale, opacity, zIndex }}
    >
      <img
        src={flavor.cupImg}
        alt={flavor.name}
        className="h-56 sm:h-78 w-auto object-contain drop-shadow-xl pointer-events-none"
        referrerPolicy="no-referrer"
        draggable={false}
      />
    </motion.button>
  );
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
}

function GalleryCard({ item, index }: GalleryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer group shadow-md hover:shadow-xl transition-all bg-white border border-gray-100"
    >
      <img
        src={item.img}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#82298a]/90 via-[#82298a]/35 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 w-full text-left">
        <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-1 drop-shadow-sm">
          {item.title}
        </h3>
        <p className="text-white/90 text-sm font-sans drop-shadow-sm">
          {item.subtitle}
        </p>
      </div>
    </motion.div>
  );
}


// 3-D tilt card — elevates and rotates toward the mouse cursor on hover
function TiltCard({ className, style, initial, whileInView, viewport, transition, children }: {
  key?: string | number;
  className?: string;
  style?: Record<string, unknown>;
  initial?: Record<string, unknown>;
  whileInView?: Record<string, unknown>;
  viewport?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  children: ReactNode;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 500, damping: 45 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 500, damping: 45 });

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      whileHover={{ y: -10, scale: 1.04, zIndex: 100 }}
      viewport={viewport}
      transition={transition}
      className={className}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ ...style, rotateX, rotateY } as any}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [activeIdx, setActiveIndex] = useState(0);
  const [ourFlavourIdx, setOurFlavourIdx] = useState(0);
  // "Our Flavours" drag/scroll carousel
  const ourFlavoursStageRef = useRef<HTMLDivElement>(null);
  const [ourFlavoursGap, setOurFlavoursGap] = useState(260);
  const [ourFlavoursStageWidth, setOurFlavoursStageWidth] = useState(1000);
  const ourFlavoursX = useMotionValue(0);

  useEffect(() => {
    if (!ourFlavoursStageRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          setOurFlavoursGap(w * 0.23);
          setOurFlavoursStageWidth(w);
        }
      }
    });
    observer.observe(ourFlavoursStageRef.current);
    return () => observer.disconnect();
  }, []);



  const snapOurFlavoursTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(OUR_FLAVOURS.length - 1, idx));
    animate(ourFlavoursX, -clamped * ourFlavoursGap, { type: "spring", stiffness: 220, damping: 28 });
    setOurFlavourIdx(clamped);
  };

  const handleOurFlavoursDragEnd = (_e: unknown, info: { velocity: { x: number } }) => {
    // Factor in flick velocity so a fast swipe carries momentum to the next cup, then settle on the nearest one
    const projected = ourFlavoursX.get() + info.velocity.x * 0.15;
    snapOurFlavoursTo(Math.round(-projected / ourFlavoursGap));
  };

  const prevActiveIdxRef = useRef(0);
  const prevActiveIdx = prevActiveIdxRef.current;

  useEffect(() => {
    prevActiveIdxRef.current = activeIdx;
  }); // Runs after every render to keep ref in sync for the next render

  // Gallery Refs & Layout States
  const galleryRef = useRef<HTMLDivElement>(null);
  const heroActiveCupRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [isDesktopLayout, setIsDesktopLayout] = useState(true);
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });
  const [easedProgress, setEasedProgress] = useState(0);

  // Setup scroll progress of gallery section:
  // Starts when gallery section top enters viewport bottom, ends when gallery is 25% from top
  const { scrollYProgress: rawProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "start 25%"]
  });

  const scrollProgress = useSpring(rawProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001
  });

  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  useMotionValueEvent(scrollProgress, "change", (latest) => {
    setEasedProgress(easeInOutQuad(latest));
  });

  const [easedCupProgress, setEasedCupProgress] = useState(0);

  // Drive cup position directly from spring-smoothed scrollProgress
  // so the cup moves in a soft, lagged, and elegant motion
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    setEasedCupProgress(easeInOutQuad(Math.min(Math.max(latest, 0), 1)));
  });

  // Calculate layout coordinates
  useEffect(() => {
    const handleResize = () => {
      setIsDesktopLayout(window.innerWidth >= 768);

      if (heroActiveCupRef.current && targetRef.current) {
        const heroRect = heroActiveCupRef.current.getBoundingClientRect();
        const targetRect = targetRef.current.getBoundingClientRect();

        // Calculate center coordinates for both elements to achieve perfect alignment
        const heroCenterX = heroRect.left + heroRect.width / 2;
        const heroCenterY = heroRect.top + heroRect.height / 2;

        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const xDiff = targetCenterX - heroCenterX;
        const yDiff = targetCenterY - heroCenterY;

        setOffsets({ x: xDiff, y: yDiff });
      }
    };

    // Calculate after rendering completes and layout is fully painted
    const timer = setTimeout(handleResize, 600);
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIdx]); // Recalculate if active flavor changes

  // Custom Cinematic Scroll Snapping Effect
  useEffect(() => {
    // Only apply scroll snapping on desktop layouts
    if (window.innerWidth < 768) return;

    let isAnimatingScroll = false;
    let lastScrollY = window.scrollY;

    const smoothScrollTo = (targetY: number, duration: number) => {
      isAnimatingScroll = true;
      const startY = window.scrollY;
      const difference = targetY - startY;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-in-out curve
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startY + difference * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          lastScrollY = window.scrollY;
          setTimeout(() => {
            isAnimatingScroll = false;
          }, 50);
        }
      };

      requestAnimationFrame(step);
    };

    const handleScroll = () => {
      if (isAnimatingScroll) {
        lastScrollY = window.scrollY;
        return;
      }

      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      const gallery = document.getElementById("gallery");
      if (!gallery) {
        lastScrollY = scrollY;
        return;
      }

      const galleryTop = gallery.offsetTop;
      const windowHeight = window.innerHeight;

      // 1. Hero -> Gallery snap
      // Target: scroll so the cup landing zone's BOTTOM aligns with the viewport bottom.
      // This gives a cinematic feel where the viewport "follows" the cup base as it lands.
      if (direction === "down" && lastScrollY <= 100 && scrollY > 100) {
        const cupTarget = document.getElementById("cup-landing-target");
        let snapTarget = galleryTop;
        if (cupTarget) {
          // Use getBoundingClientRect + scrollY to get true absolute document position
          // (offsetTop alone is relative to nearest positioned ancestor, not the document)
          const cupRect = cupTarget.getBoundingClientRect();
          const cupLandingBottom = cupRect.bottom + window.scrollY;
          // Scroll so the cup bottom sits at the viewport bottom (40px breathing room)
          snapTarget = Math.max(0, cupLandingBottom - windowHeight + 40);
        }
        smoothScrollTo(snapTarget, 2800);
      }
      // 2. Gallery -> Hero snap
      else if (direction === "up" && lastScrollY >= galleryTop - 10 && scrollY < galleryTop - 100) {
        smoothScrollTo(0, 2400);
      } else {
        lastScrollY = scrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Header springs matching inspiration signatures
  const headerY = useTransform(scrollProgress, [0, 0.8], [0, 175]);
  const headerScale = useTransform(scrollProgress, [0, 0.8], [0.95, 1]);
  // Subtext moves down below the cup — more travel than header to stay below as cup lands
  const subtextY = useTransform(scrollProgress, [0, 0.8], [0, 20]);

  const activeFlavor = FLAVORS[activeIdx];

  // Helper to compute the shortest circular difference in range [-1, 2] for 4 flavors
  const getRelativeDiff = (i: number, active: number) => {
    let diff = i - active;
    const len = FLAVORS.length;
    if (diff < -1) diff += len;
    if (diff > 2) diff -= len;
    return diff;
  };

  const getSlotProps = (diff: number) => {
    switch (diff) {
      case -2: return { left: "-15%", top: "-9%", rotate: 14, opacity: 0.75, scale: 1.0, zIndex: 5, pointerEvents: "auto" as const };
      case -1: return { left: "15%", top: "5%", rotate: 7, opacity: 0.95, scale: 1.0, zIndex: 10, pointerEvents: "auto" as const };
      case 0: return { left: "41%", top: "23%", rotate: 0, opacity: 1.0, scale: 1.125, zIndex: 15, pointerEvents: "auto" as const };
      case 1: return { left: "65%", top: "39%", rotate: -12, opacity: 0.9, scale: 1.0, zIndex: 20, pointerEvents: "auto" as const };
      case 2: return { left: "90%", top: "55%", rotate: -24, opacity: 0.9, scale: 0.8, zIndex: 25, pointerEvents: "auto" as const };
      default: return { left: "-20%", top: "-25%", rotate: 20, opacity: 0, scale: 1.0, zIndex: 1, pointerEvents: "none" as const };
    }
  };

  // Exporter Drawer State
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);



  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const wpCode = generateWordPressCode();

  return (
    <div className="min-h-screen bg-[#FDFDF9] text-[#2C2133] antialiased tracking-normal relative">
      {/* Subtle Noise Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Glassmorphism SVG Filters */}
      <svg style={{ display: "none" }}>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale="77" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Decorative Wavy Background SVG Pattern (Matching PDF Booklet Wavy Shapes) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none z-0 overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0,200 C 300,150 400,350 700,250 C 1000,150 1200,350 1500,250 L 1500,1080 L 0,1080 Z" fill="#82298a" />
          <path d="M 0,500 C 250,550 500,400 750,500 C 1000,600 1250,450 1500,500" stroke="#fbae17" strokeWidth="4" fill="none" />
          <path d="M 100,100 C 300,300 600,100 900,200" stroke="#60bb49" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* ADVANCED NAVIGATION SYSTEM */}
      <nav className="navbar-container">
        <div className="navbar">
          {/* Brand/Logo */}
          <a href="#" className="navbar-brand">
            <img src="https://frochi.ae/wp-content/uploads/2025/06/logo-clr.png" alt="Frochi Logo" className="h-6 md:h-7 w-auto object-contain drop-shadow-sm" />
          </a>

          {/* Navigation Links */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <a href="#hero-section" className="nav-link active">
                <span>Home</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#brand-story" className="nav-link">
                <span>Our Story</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#our-flavours" className="nav-link">
                <span>Flavours</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="https://frochi.ae/products/" className="nav-link" target="_blank" rel="noopener noreferrer">
                <span>Products</span>
              </a>
            </li>
          </ul>

          {/* Mobile Toggle */}
          <button
            className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <a href="#" className="mobile-menu-brand">
            <img src="https://frochi.ae/wp-content/uploads/2025/06/logo-clr.png" alt="Frochi Logo" className="h-6 w-auto object-contain" />
          </a>
          <button
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>×</span>
          </button>
        </div>

        <ul className="mobile-menu-nav">
          <li className="mobile-menu-item">
            <a href="#hero-section" className="mobile-menu-link active" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Home</span>
            </a>
          </li>
          <li className="mobile-menu-item">
            <a href="#brand-story" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Our Story</span>
            </a>
          </li>
          <li className="mobile-menu-item">
            <a href="#our-flavours" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Flavours</span>
            </a>
          </li>
          <li className="mobile-menu-item">
            <a href="https://frochi.ae/products/" className="mobile-menu-link" target="_blank" rel="noopener noreferrer">
              <span>Products</span>
            </a>
          </li>
        </ul>

        <div className="mobile-cta">
          <a href="#order" className="mobile-cta-button" onClick={() => setIsMobileMenuOpen(false)}>
            Order Now
          </a>
        </div>
      </div>

      {/* SEAMLESS HERO + GALLERY WRAPPER */}
      <div className="relative w-full bg-white border-b border-gray-100" style={{ overflowX: 'clip' }}>
        {/* Seamless Combined Background Gradient */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backgroundImage: "linear-gradient(225deg, rgba(130, 41, 138, 0.85) 0%, transparent 40%), linear-gradient(65deg, rgba(130, 41, 138, 0.85) 0%, transparent 60%)" }}
          />
        </div>

        {/* HERO SECTION */}
        <section id="hero-section" className="relative z-30 pb-16 pt-48 px-6 sm:px-10 lg:px-16 w-full bg-transparent min-h-[600px] sm:min-h-[700px] flex items-center">

          {/* Top-Right Stats Counter Overlay mimicking the Coffee Lounge video details */}
          <div className="absolute top-40 right-10 hidden md:flex items-center gap-6 z-30 font-sans select-none text-white">
            <div className="text-right">
              <span className="block text-2xl font-bold font-sans leading-none drop-shadow-sm">12+</span>
              <span className="text-[9px] uppercase tracking-wider font-bold font-sans opacity-90">Flavors</span>
            </div>
            <div className="w-px h-6 bg-white/40" />
            <div className="text-right">
              <span className="block text-2xl font-bold font-sans leading-none drop-shadow-sm">15K+</span>
              <span className="text-[9px] uppercase tracking-wider font-bold font-sans opacity-90">Fans</span>
            </div>
          </div>

          {/* FULL BLEED MULTI-CUP FLOATING STAGE BACKGROUND/MIDGROUND */}
          <div className="absolute inset-0 z-10 w-full h-full select-none pointer-events-none overflow-hidden">
            {/* Static reference placeholder for measuring dynamic offset coordinate updates */}
            <div
              ref={heroActiveCupRef}
              className="absolute w-[clamp(140px,22vw,300px)] aspect-[3/4] opacity-0 pointer-events-none"
              style={{ left: "40%", top: "23%", transform: "scale(1.125)" }}
            />


            {/* Orbiting Fruit items positioned relative only around the Active center cup (Cup 2) */}
            <div
              className="absolute z-10 w-[clamp(110px,18vw,320px)] aspect-square flex items-center justify-center pointer-events-none"
              style={{
                left: "40%",
                top: "23%",
                transform: "translate(-5%, -5%) scale(1.125)",
                opacity: isDesktopLayout ? Math.max(1 - easedCupProgress * 6.66, 0) : 1
              }}
            >
              <AnimatePresence mode="popLayout">
                {activeFlavor.fruits.map((fr, idx) => {
                  const angle = (idx * 2 * Math.PI) / activeFlavor.fruits.length;
                  const radiusX = typeof window !== "undefined" && window.innerWidth < 640 ? 60 : 110;
                  const radiusY = typeof window !== "undefined" && window.innerWidth < 640 ? 45 : 85;
                  const xOffset = Math.cos(angle) * radiusX;
                  const yOffset = Math.sin(angle) * radiusY;

                  return (
                    <motion.div
                      key={`${activeFlavor.id}-orbit-fr-${idx}`}
                      initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: [xOffset, xOffset + Math.sin(idx) * 12, xOffset],
                        y: [yOffset, yOffset + Math.cos(idx) * 12, yOffset],
                        rotate: [0, idx % 2 === 0 ? 360 : -360]
                      }}
                      exit={{ opacity: 0, scale: 0.2 }}
                      transition={{
                        opacity: { duration: 0.4 },
                        scale: { duration: 0.4 },
                        x: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 16 + idx * 4, repeat: Infinity, ease: "linear" }
                      }}
                      className="absolute w-8 h-8 sm:w-14 sm:h-14 rounded-full shadow-md overflow-hidden bg-white border border-gray-100 z-30 flex items-center justify-center cursor-pointer pointer-events-auto hover:scale-110 transition-transform"
                    >
                      <img
                        src={fr.img}
                        alt={fr.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          {/* CUPS — own container without overflow-hidden so the center cup can travel into the gallery on scroll */}
          <div className="absolute inset-0 z-30 w-full h-full select-none pointer-events-none" style={{ overflow: 'visible' }}>
            {/* CUPS — slot-based carousel, springs between fixed positions on swipe */}
            {FLAVORS.map((flavor, index) => {
              const diff = getRelativeDiff(index, activeIdx);
              const slot = getSlotProps(diff);
              const prevDiff = getRelativeDiff(index, prevActiveIdx);
              const prevSlot = getSlotProps(prevDiff);
              const isWrapping = Math.abs(parseFloat(slot.left) - parseFloat(prevSlot.left)) > 50;
              const isCenterActive = diff === 0;
              return (
                <motion.div
                  key={flavor.id}
                  className="absolute w-[clamp(140px,22vw,340px)] aspect-[3/4] select-none group"
                  animate={{ left: slot.left, top: slot.top, rotate: slot.rotate, opacity: slot.opacity }}
                  transition={{
                    left: isWrapping ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 },
                    top: isWrapping ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 },
                    rotate: isWrapping ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 },
                    opacity: { duration: 0.3 },
                  }}
                  style={{
                    pointerEvents: slot.pointerEvents,
                    x: isCenterActive && isDesktopLayout ? easedCupProgress * offsets.x : 0,
                    y: isCenterActive && isDesktopLayout ? easedCupProgress * offsets.y : 0,
                    zIndex: isCenterActive ? 50 : slot.zIndex,
                  }}
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    animate={{ scale: slot.scale }}
                    transition={{ scale: isWrapping ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 } }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveIndex(index)}
                    onDragEnd={(_, { offset, velocity }) => {
                      const projected = offset.x + velocity.x * 0.12;
                      const steps = Math.round(-projected / 100);
                      if (steps !== 0) setActiveIndex(prev => ((prev + steps) % FLAVORS.length + FLAVORS.length) % FLAVORS.length);
                    }}
                    className="relative w-full h-full flex flex-col items-center cursor-grab active:cursor-grabbing pointer-events-auto"
                  >
                    <motion.div className="relative w-full h-full">
                      <img
                        src={flavor.cupImg}
                        alt={flavor.name}
                        className="w-full h-full object-contain pointer-events-none select-none transition-shadow duration-300"
                        style={{ filter: isCenterActive ? "drop-shadow(0 25px 35px #82298a60)" : "drop-shadow(0 8px 16px rgba(0,0,0,0.08))" }}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        onClick={e => { e.stopPropagation(); setActiveIndex(index); }}
                      />
                      {!isCenterActive && (
                        <span
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm text-[9px] font-mono px-2 py-0.5 rounded-full text-gray-500 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                          onClick={e => { e.stopPropagation(); setActiveIndex(index); }}
                        >{flavor.name}</span>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* TYPOGRAPHY OVERLAY COLUMN WRAPPER */}
          <div className="relative w-full z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pt-32 min-h-[500px] sm:min-h-[550px] md:min-h-[600px] pointer-events-none">

            {/* HERO CONTENT: LEFT COLUMN - CLEANLY ALIGNED BOTTOM-LEFT UNDER THE SHIFTED CUPS */}
            <div className="lg:col-span-6 flex flex-col justify-end pointer-events-auto bg-white/80 backdrop-blur-md sm:backdrop-blur-none sm:bg-transparent p-6 sm:p-0 rounded-3xl border border-white/10 sm:border-none shadow-sm sm:shadow-none">
              <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-3 font-mono drop-shadow-md">
                <Sparkles size={14} className="animate-pulse" />
                <span>Premium Swirl of Dubai</span>
              </span>

              {/* Static Title */}
              <div>
                <h1 className="text-4xl sm:text-6xl font-display font-black leading-[1.05] tracking-tight relative mb-2">
                  <span className="uppercase font-extrabold text-[#82298a] block sm:inline drop-shadow-sm">IT'S FROCHI TIME.</span>
                </h1>
              </div>

              {/* Smooth transition for dynamic content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFlavor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight mt-1 select-none drop-shadow-md">
                      {activeFlavor.name.toLowerCase()} lounge
                    </p>
                  </div>
                  <p className="text-white leading-relaxed text-xs sm:text-sm font-sans max-w-md bg-[#82298a]/40 sm:bg-transparent p-3 sm:p-0 rounded-2xl drop-shadow-md">
                    {activeFlavor.description}
                  </p>

                  {/* Explore More Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = document.getElementById("our-flavours");
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="group inline-flex items-center gap-2 bg-[#82298a] hover:bg-[#6c1d73] active:scale-95 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all duration-300 pointer-events-auto cursor-pointer"
                    >
                      <span>Explore More</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: DUMMY COLUMN OFFERID ALIGNMENT SO BACKGROUND STRETCHES OUT FREELY */}
            <div className="lg:col-span-6 h-[120px] lg:h-full pointer-events-none select-none" />

          </div>

          {/* Scroll Down Indicator & Subtle Section Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#82298a]/20 to-transparent z-20" />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 cursor-pointer pointer-events-auto select-none"
            onClick={() => {
              const gallery = document.getElementById("gallery");
              if (gallery) {
                gallery.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#82298a]">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-[#82298a]/40 flex justify-center p-1"
            >
              <motion.div className="w-1 h-1.5 rounded-full bg-[#82298a]" />
            </motion.div>
          </motion.div>
        </section>

        {/* GALLERY SECTION (SHARE THE CHI) */}
        <section
          ref={galleryRef}
          id="gallery"
          className="py-24 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto bg-transparent relative z-20 min-h-[950px] md:min-h-[1450px] flex items-center justify-center overflow-visible"
        >
          <div className="relative w-full max-w-[1250px] mx-auto flex flex-col items-center min-h-[900px] md:h-[1350px] md:justify-start">

            {/* Logo & Header Title */}
            <motion.div
              style={isDesktopLayout ? {
                y: headerY,
                x: 0,
                scale: headerScale,
              } : {}}
              className="flex flex-col items-center text-center max-w-2xl mx-auto mb-2 z-20 origin-center"
            >
              <img
                src="https://frochi.ae/wp-content/uploads/2025/06/logo-clr.png"
                alt="Frochi Logo Icon"
                className="h-14 sm:h-16 w-auto object-contain mb-4"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-[#82298a] tracking-tight leading-none uppercase">
                Share the Chi!
              </h2>

            </motion.div>

            {/* Central Landing Target & Text Column */}
            <div className={
              isDesktopLayout
                ? "absolute top-[480px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center max-w-md z-30 pointer-events-none"
                : "flex flex-col items-center text-center max-w-md mx-auto my-4 z-30 pointer-events-none relative"
            }>
              {/* The invisible target anchor that the cup lands on */}
              <div
                ref={targetRef}
                id="cup-landing-target"
                className="w-[140px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-square flex items-center justify-center my-6 relative"
              >
                {/* The moving cup image only on mobile layout (on desktop the real cup moves down) */}
                {!isDesktopLayout && (
                  <img
                    src={activeFlavor.cupImg}
                    alt={activeFlavor.name}
                    className="w-full h-full object-contain"
                    style={{
                      filter: "drop-shadow(0 20px 30px #82298a60)"
                    }}
                  />
                )}
              </div>

              {/* Bottom Subtext: moves down with scroll like the header, always visible, stays below the cup */}
              <motion.div
                className="px-4"
                style={isDesktopLayout ? { y: subtextY } : {}}
              >
                <p className="text-[#82298a] font-semibold text-sm sm:text-base leading-snug">
                  Chi is an energy.
                </p>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mt-2 max-w-xs mx-auto">
                  It's a natural force that flows from one heart to another in the blink of an eye.
                </p>
              </motion.div>
            </div>

            {/* Floating Fan-arranged Cards */}
            <div className={
              isDesktopLayout
                ? "absolute top-[260px] left-0 right-0 h-[1100px] z-10 block"
                : "w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 z-10"
            }>
              {GALLERY_ITEMS.map((card, idx) => {
                const getMobileCardStyle = (index: number) => {
                  switch (index) {
                    case 0: return "rotate-[-2deg]";
                    case 1: return "rotate-[2deg]";
                    case 2: return "rotate-[-1deg]";
                    case 3: return "rotate-[1deg]";
                    case 4: return "rotate-[-2deg]";
                    case 5: return "rotate-[2deg]";
                    default: return "";
                  }
                };

                // Interpolates absolute positions and rotations of the cards based on scrollProgress
                const getInterpolatedStyles = (i: number, p: number) => {
                  const width = 44;
                  let targetRotate = 0;
                  if (i % 2 === 0) {
                    if (i === 0) targetRotate = -6;
                    else if (i === 2) targetRotate = -10;
                    else if (i === 4) targetRotate = -5;
                  } else {
                    if (i === 1) targetRotate = 6;
                    else if (i === 3) targetRotate = 10;
                    else if (i === 5) targetRotate = 5;
                  }
                  const rotate = p * targetRotate;

                  let left = 0;
                  if (i % 2 === 0) {
                    left = 0 + p * -15;
                  } else {
                    left = 56 + p * 15;
                  }

                  let top = 0;
                  if (i === 0 || i === 1) {
                    top = 0;
                  } else if (i === 2 || i === 3) {
                    top = 35;
                  } else if (i === 4 || i === 5) {
                    top = 70;
                  }

                  let zIndex = 10;
                  if (i === 0 || i === 1) {
                    zIndex = 30;
                  } else if (i === 2 || i === 3) {
                    zIndex = 20;
                  }

                  return {
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    rotate: `${rotate}deg`,
                    zIndex,
                  };
                };

                const dynamicStyle = isDesktopLayout
                  ? getInterpolatedStyles(idx, easedProgress)
                  : { zIndex: (idx === 0 || idx === 1) ? 30 : (idx === 2 || idx === 3) ? 20 : 10 };

                return (
                  <TiltCard
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.08,
                      y: { type: "spring", stiffness: 380, damping: 30, delay: idx * 0.08 },
                      scale: { type: "spring", stiffness: 380, damping: 30, delay: idx * 0.08 },
                    }}
                    className={
                      isDesktopLayout
                        ? "absolute aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-md border border-gray-100 bg-white cursor-pointer"
                        : `${getMobileCardStyle(idx)} relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-md border border-gray-100 bg-white cursor-pointer`
                    }
                    style={dynamicStyle}
                  >
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#5a1c61]/95 via-[#5a1c61]/45 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                      <h3 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs opacity-90 mt-1 font-sans font-medium">
                        {card.subtitle}
                      </p>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* CLOSE SEAMLESS HERO + GALLERY WRAPPER */}
      </div>


      {/* BRAND STORY & INTEGRITY SEGMENT */}
      <section id="brand-story" className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto z-10 border-t-2 border-[#efece2]">

        {/* CENTERED EDITORIAL HEADER — matches the header pattern used by every other section on the site */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-2xl mx-auto text-center mb-12 sm:mb-16"
        >
          <motion.span variants={fadeUpVariant} className="inline-flex items-center gap-2 text-xs font-bold font-mono text-[#82298a] uppercase tracking-widest mb-5">
            <span className="w-6 h-px bg-[#82298a]" />
            Our Story
            <span className="w-6 h-px bg-[#82298a]" />
          </motion.span>

        </motion.div>

        {/* VISUAL PROOF ROW — photo paired with the brand-meaning quote, height-balanced */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch mb-16 sm:mb-20">

          {/* IMAGE COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-5 relative flex justify-center items-center pt-6 pb-8"
          >
            {/* Morphing organic blob backdrop */}
            <motion.div
              className="absolute w-[88%] aspect-square bg-gradient-to-br from-[#e8eeae]/60 to-[#82298a]/10 blur-[40px] -z-10"
              animate={{
                borderRadius: [
                  "42% 58% 70% 30% / 45% 45% 55% 55%",
                  "70% 30% 52% 48% / 60% 40% 60% 40%",
                  "42% 58% 70% 30% / 45% 45% 55% 55%"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* "Est. 2024" sticker badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 13 }}
              className="absolute -top-3 left-2 sm:-left-4 z-20 bg-[#fbae17] text-[#2C2133] text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg"
            >
              Est. 2024 · Dubai
            </motion.div>

            <motion.img
              src="https://frochi.ae/wp-content/uploads/2025/07/team.png"
              alt="Muhammad and Abdullah Rashid"
              whileHover={{ rotate: 0, scale: 1.015 }}
              className="relative z-10 rounded-[2rem] shadow-2xl w-full max-w-md border-4 border-white -rotate-2 transition-transform duration-500 ease-out"
              referrerPolicy="no-referrer"
            />

            {/* Founders chip overlapping the bottom-right of the photo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-6 right-2 sm:-right-6 z-20 bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[200px] border border-[#efece2]"
            >
              <div className="flex items-center mb-1.5">
                <span className="w-7 h-7 rounded-full bg-[#82298a] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow">MR</span>
                <span className="w-7 h-7 -ml-2.5 rounded-full bg-[#fbae17] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow">AR</span>
              </div>
              <p className="text-[11px] font-semibold text-gray-700 leading-snug">
                Muhammad &amp; Abdullah Rashid
                <span className="block text-[10px] font-normal text-gray-400 mt-0.5">Founders</span>
              </p>
            </motion.div>
          </motion.div>

          {/* QUOTE PANEL — the single, prominent brand-meaning statement */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="lg:col-span-7 relative flex items-center bg-[#fcfbf7] border border-[#efe9dc] rounded-[2rem] px-8 py-12 sm:px-14 sm:py-16 overflow-hidden"
          >
            <span className="absolute top-2 left-6 text-[140px] leading-none font-display text-[#82298a]/[0.06] select-none">"</span>
            <p className="relative text-xl md:text-2xl font-display font-medium italic text-[#82298a] leading-relaxed">
              Fro-Chi began when Muhammad Rashid and his son Abdullah turned their love for Australian froyo culture into a Dubai original — swirled, probiotic-packed, and made with zero artificial preservatives, one playful flavor at a time.
            </p>
          </motion.div>
        </div>

        {/* FACTS STRIP — closes the section with quick, scannable proof points */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pt-10 border-t border-[#efece2]"
        >
          {[
            { label: "Founded", value: "2024" },
            { label: "Heritage", value: "Australian" },
            { label: "Home", value: "Dubai, UAE" },
            { label: "Promise", value: "100% Natural" }
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeUpVariant} className="text-center sm:text-left">
              <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{stat.label}</span>
              <span className="block text-lg md:text-xl font-display font-bold text-[#2C2133]">{stat.value}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* OUR FLAVOURS — cup showcase (center cup large, side cups smaller, evenly spaced) */}
      <section id="our-flavours" className="relative py-24 px-6 sm:px-10 lg:px-16 overflow-hidden border-t-2 border-[#efece2] z-0">
        {/* Ambient backdrop: brand-color soft glow, then store photo layered on top at low opacity */}
        <div className="absolute inset-0 -z-10 bg-[#fdfcf8]">
          <div className="absolute -top-10 left-[12%] w-[420px] h-[420px] bg-[#82298a]/10 rounded-full blur-[110px]" />
          <div className="absolute -bottom-10 right-[14%] w-[380px] h-[380px] bg-[#fbae17]/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-[6%] w-[260px] h-[260px] bg-[#8bc751]/10 rounded-full blur-[90px]" />
          <img
            src="https://frochi.ae/wp-content/uploads/2026/06/store-scaled.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.28]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Heading + hand-drawn style arrow pointing toward the active cup */}
        <div className="relative z-10 text-center mb-4">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-wide uppercase text-[#2C2133]">
            Our Flavours
          </h2>
          <svg width="84" height="64" viewBox="0 0 84 64" fill="none" className="mx-auto mt-1 text-[#2C2133]/60">
            <path d="M4 6 C42 2 66 12 60 32 C54 52 36 48 40 33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M33 36 L40 33 L43 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Cup carousel — drag/swipe horizontally with momentum, snaps to the nearest cup; full-bleed to the page edges */}
        <div
          ref={ourFlavoursStageRef}
          className="relative z-10 h-[520px] sm:h-[580px] -mx-6 sm:-mx-10 lg:-mx-16 overflow-hidden select-none"
        >
          <motion.div
            className="absolute top-0 h-full cursor-grab active:cursor-grabbing"
            style={{
              left: 0,
              width: (OUR_FLAVOURS.length - 1) * ourFlavoursGap + ourFlavoursStageWidth,
              x: ourFlavoursX,
              zIndex: 10 // sits between the white circle (z-5) and the flavor text (z-60); this wrapper has its own
              // stacking context (CSS transform creates one), so individual cups' z-index only orders them
              // relative to EACH OTHER — the group as a whole still needs to rank above the circle here.
            }}
            drag="x"
            dragElastic={0.1}
            dragMomentum={false}
            dragConstraints={{ left: -(OUR_FLAVOURS.length - 1) * ourFlavoursGap, right: 0 }}
            onDragEnd={handleOurFlavoursDragEnd}
          >
            {OUR_FLAVOURS.map((f, idx) => (
              <OurFlavourCupItem
                key={f.id}
                flavor={f}
                idx={idx}
                gap={ourFlavoursGap}
                stageWidth={ourFlavoursStageWidth}
                trackX={ourFlavoursX}
                onClick={() => snapOurFlavoursTo(idx)}
                isDesktop={isDesktopLayout}
              />
            ))}
          </motion.div>

          {/* White morphing blob backdrop behind the active cup */}
          <motion.div
            className="absolute left-1/2 bottom-[40px] sm:bottom-[46px] -translate-x-1/2 z-[5] w-60 h-60 sm:w-80 sm:h-80 bg-white shadow-xl pointer-events-none"
            animate={{
              borderRadius: [
                "42% 58% 70% 30% / 45% 45% 55% 55%",
                "70% 30% 52% 48% / 60% 40% 60% 40%",
                "42% 58% 30% 70% / 30% 70% 30% 70%",
                "60% 40% 70% 30% / 50% 50% 50% 50%",
                "42% 58% 70% 30% / 45% 45% 55% 55%"
              ],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Flavor name + description — pushed below the cup's bottom edge so it never overlaps */}
          <div className="absolute left-1/2 bottom-[134px] sm:bottom-[100px] -translate-x-1/2 z-[60] w-60 sm:w-80 flex justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={OUR_FLAVOURS[ourFlavourIdx].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center px-6"
              >
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2C2133]">
                  {OUR_FLAVOURS[ourFlavourIdx].name}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-[200px] mx-auto">
                  {OUR_FLAVOURS[ourFlavourIdx].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* BENTO SIGNATURE GALLERY (GRID OF PRODUCTS REFERRED IN XML) */}


      {/* FLOW SECTION — full-bleed brand image, scales to its natural aspect ratio at every breakpoint */}
      <section id="flow-section" className="relative w-full leading-[0]">
        <img
          src="https://frochi.ae/wp-content/uploads/2026/06/flow-section.png"
          alt="Flow"
          className="block w-full h-auto"
          referrerPolicy="no-referrer"
        />
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-[#120118] text-white relative z-10 overflow-hidden">
        {/* Subtle top accent gradient line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#82298a] via-[#fbae17] to-[#82298a]" />

        {/* Ambient glow blobs */}
        <div className="absolute -top-20 -left-20 w-[340px] h-[340px] bg-[#82298a]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-[260px] h-[260px] bg-[#fbae17]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Main grid */}
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-5">
            <span className="text-3xl font-display font-black tracking-tight leading-none">
              fro<span className="text-[#fbae17]">o</span>chi
            </span>
            <p className="text-white/45 text-sm leading-relaxed max-w-[260px]">
              Dubai's premium probiotic frozen yogurt — crafted with love, inspired by Australian froyo culture.
            </p>
            {/* Social pill */}
            <a
              href="https://www.instagram.com/frochiuae/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 self-start bg-white/8 hover:bg-[#82298a]/60 border border-white/10 hover:border-[#82298a]/60 text-white/70 hover:text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @frochiuae
            </a>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold font-mono text-white/30 mb-6">Explore</h4>
            <nav className="flex flex-col gap-3.5">
              {[
                { label: "Home", href: "#hero-section", external: false },
                { label: "Our Story", href: "#brand-story", external: false },
                { label: "Flavours", href: "#our-flavours", external: false },
                { label: "Products", href: "https://frochi.ae/products/", external: true },
              ].map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-white/55 hover:text-white text-sm font-medium transition-colors duration-200 w-fit"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold font-mono text-white/30 mb-6">Get in Touch</h4>
            <div className="flex flex-col gap-5">
              <a
                href="mailto:info@frochi.ae"
                className="flex items-center gap-3 text-white/55 hover:text-white transition-colors duration-200 group"
              >
                <span className="w-8 h-8 rounded-full bg-white/8 group-hover:bg-[#82298a]/50 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <Mail size={13} />
                </span>
                <span className="text-sm">info@frochi.ae</span>
              </a>

              <a
                href="https://www.instagram.com/frochiuae/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/55 hover:text-white transition-colors duration-200 group"
              >
                <span className="w-8 h-8 rounded-full bg-white/8 group-hover:bg-[#82298a]/50 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </span>
                <span className="text-sm">instagram.com/frochiuae</span>
              </a>

              <div className="flex items-center gap-3 text-white/40">
                <span className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                  <MapPin size={13} />
                </span>
                <span className="text-sm">Dubai, UAE</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/8">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-white/25 font-mono">
            <p>© 2026 Fro-Chi. All rights reserved.</p>
            <p>Made with love in Dubai 🇦🇪</p>
          </div>
        </div>
      </footer>

      {/* WORDPRESS EXPORTER SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {isExporterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExporterOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col border-l border-[#eae0d2]"
            >
              {/* Exporter header */}
              <div className="p-6 border-b border-[#f0ece1] flex justify-between items-center bg-[#fdfcf9]">
                <div>
                  <h3 className="text-lg font-bold text-[#82298a] flex items-center gap-1.5 leading-none">
                    <Code size={18} />
                    <span>WordPress Injection Center</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Copy and upload. Plain Vanilla HTML/CSS/JS with zero external dependencies.</p>
                </div>
                <button
                  onClick={() => setIsExporterOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-extrabold text-sm p-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Exporter body panels */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Information Card */}
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs lg:text-sm flex gap-3 text-left">
                  <BookOpen className="text-emerald-700 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold">WordPress Copier Instruction</h4>
                    <p className="mt-1 leading-relaxed text-emerald-800">
                      Copy the generated code segments below and load them into a <strong>Custom HTML block</strong>, Elementor <strong>HTML Widget</strong>, orDivi code container. It is self-contained and pre-configured for full layout responsiveness.
                    </p>
                  </div>
                </div>

                {/* HTML Panel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-700">1. HTML Segment</span>
                    <button
                      onClick={() => handleCopy(wpCode.html, "html")}
                      className="text-xs font-bold text-[#82298a] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSection === "html" ? <Check size={14} className="text-emerald-600" /> : <Maximize size={14} />}
                      <span>{copiedSection === "html" ? "Copied!" : "Copy HTML"}</span>
                    </button>
                  </div>
                  <pre className="bg-[#1C1625] text-emerald-400 text-xs p-4 rounded-xl overflow-x-auto max-h-56 no-scrollbar border border-black select-all font-mono leading-relaxed">
                    {wpCode.html}
                  </pre>
                </div>

                {/* CSS Panel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-700">2. Custom CSS Block (&lt;style&gt;)</span>
                    <button
                      onClick={() => handleCopy(wpCode.css, "css")}
                      className="text-xs font-bold text-[#82298a] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSection === "css" ? <Check size={14} className="text-emerald-600" /> : <Maximize size={14} />}
                      <span>{copiedSection === "css" ? "Copied!" : "Copy CSS"}</span>
                    </button>
                  </div>
                  <pre className="bg-[#1C1625] text-amber-300 text-xs p-4 rounded-xl overflow-x-auto max-h-56 no-scrollbar border border-black select-all font-mono leading-relaxed">
                    {wpCode.css}
                  </pre>
                </div>

                {/* JS Panel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-700">3. Vanilla JS Script (&lt;script&gt;)</span>
                    <button
                      onClick={() => handleCopy(wpCode.js, "js")}
                      className="text-xs font-bold text-[#82298a] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSection === "js" ? <Check size={14} className="text-emerald-600" /> : <Maximize size={14} />}
                      <span>{copiedSection === "js" ? "Copied!" : "Copy Script"}</span>
                    </button>
                  </div>
                  <pre className="bg-[#1C1625] text-sky-300 text-xs p-4 rounded-xl overflow-x-auto max-h-56 no-scrollbar border border-black select-all font-mono leading-relaxed">
                    {wpCode.js}
                  </pre>
                </div>

              </div>

              {/* Exporter Footer */}
              <div className="p-4 border-t border-[#f0ece1] bg-[#fcfbf9] text-center text-xs text-gray-400">
                To keep imports safe, please load before any dynamic scripts on the page body.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
