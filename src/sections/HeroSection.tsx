import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const borderRefs = useRef<(SVGPathElement | null)[]>([]);
  const plateCenterRef = useRef<SVGGElement>(null);
  const plateLeft1Ref = useRef<SVGGElement>(null);
  const plateLeft2Ref = useRef<SVGGElement>(null);
  const plateRight1Ref = useRef<SVGGElement>(null);
  const plateRight2Ref = useRef<SVGGElement>(null);
  const tagineBaseRef = useRef<SVGGElement>(null);
  const tagineLidRef = useRef<SVGGElement>(null);
  const steamRefs = useRef<(SVGPathElement | null)[]>([]);
  const candleRef = useRef<SVGGElement>(null);
  const flameOuterRef = useRef<SVGPathElement>(null);
  const flameInnerRef = useRef<SVGPathElement>(null);
  const herbRefs = useRef<(SVGGElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      // Phase 1: Border draw-in (0-15%)
      borderRefs.current.forEach((border, i) => {
        if (!border) return;
        const length = border.getTotalLength?.() || 2000;
        gsap.set(border, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(
          border,
          { strokeDashoffset: 0, stroke: "#C9A96E", duration: 0.15, ease: "power2.inOut" },
          i * 0.01
        );
      });

      // Phase 2: Central plate slide-in (15-40%)
      if (plateCenterRef.current) {
        tl.fromTo(
          plateCenterRef.current,
          { y: "60vh", rotation: -15, opacity: 0 },
          { y: 0, rotation: 0, opacity: 1, duration: 0.25, ease: "power3.out" },
          0.1
        );
      }

      // Phase 3: Title character reveal (20-45%)
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll(".char");
        tl.fromTo(
          chars,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.015, duration: 0.25, ease: "power2.out" },
          0.18
        );
      }

      // Phase 4: Side plates slide-in (30-50%)
      const leftPlates = [plateLeft1Ref.current, plateLeft2Ref.current].filter(Boolean);
      const rightPlates = [plateRight1Ref.current, plateRight2Ref.current].filter(Boolean);

      leftPlates.forEach((plate, i) => {
        tl.fromTo(
          plate,
          { x: "-50vw", opacity: 0 },
          { x: 0, opacity: 1, duration: 0.2, ease: "power3.out" },
          0.28 + i * 0.05
        );
      });

      rightPlates.forEach((plate, i) => {
        tl.fromTo(
          plate,
          { x: "50vw", opacity: 0 },
          { x: 0, opacity: 1, duration: 0.2, ease: "power3.out" },
          0.28 + i * 0.05
        );
      });

      // Phase 5: Tagine assembly (40-55%)
      if (tagineBaseRef.current) {
        tl.fromTo(
          tagineBaseRef.current,
          { y: "-40vh", opacity: 0 },
          { y: 0, opacity: 1, duration: 0.15, ease: "power3.out" },
          0.35
        );
      }

      if (tagineLidRef.current) {
        tl.fromTo(
          tagineLidRef.current,
          { y: "-30vh", opacity: 0 },
          { y: 0, opacity: 1, duration: 0.12, ease: "power3.out" },
          0.42
        );
        tl.to(
          tagineLidRef.current,
          { y: -12, rotation: 3, duration: 0.08, ease: "power2.inOut" },
          0.52
        );
      }

      // Phase 6: Herbs pop-in (55-70%)
      herbRefs.current.forEach((herb, i) => {
        if (!herb) return;
        tl.fromTo(
          herb,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.08, ease: "back.out(1.7)" },
          0.55 + i * 0.015
        );
      });

      // Phase 7: Candle ignite (60-70%)
      if (candleRef.current) {
        tl.fromTo(
          candleRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.1, ease: "power2.out" },
          0.58
        );
      }

      // Phase 8: Steam rise (65-85%)
      steamRefs.current.forEach((steam, i) => {
        if (!steam) return;
        tl.fromTo(
          steam,
          { opacity: 0, y: 0 },
          { opacity: 0.6, y: -25, duration: 0.2, ease: "sine.inOut" },
          0.62 + i * 0.03
        );
      });

      // Fade out at end
      tl.to(content, { opacity: 0, duration: 0.1 }, 0.9);
    }, section);

    // Independent flame flicker animation
    const flameTl = gsap.timeline({ repeat: -1, yoyo: true });
    if (flameOuterRef.current) {
      flameTl.to(
        flameOuterRef.current,
        { scale: 1.15, transformOrigin: "bottom center", duration: 0.8, ease: "sine.inOut" },
        0
      );
    }
    if (flameInnerRef.current) {
      flameTl.to(
        flameInnerRef.current,
        { scale: 1.1, opacity: 0.9, transformOrigin: "bottom center", duration: 0.6, ease: "sine.inOut" },
        0.2
      );
    }

    // Ambient particle canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx2d = canvas.getContext("2d");
      if (ctx2d) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 25 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: 0.1 + Math.random() * 0.2,
          size: 1 + Math.random(),
        }));

        let animId: number;
        const animate = () => {
          ctx2d.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach((p) => {
            p.x += p.vx + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.1;
            p.y += p.vy + Math.cos(Date.now() * 0.001 + p.x * 0.01) * 0.1;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx2d.beginPath();
            ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx2d.fillStyle = `rgba(201, 169, 110, ${p.opacity})`;
            ctx2d.fill();
          });
          animId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
          cancelAnimationFrame(animId);
          ctx.revert();
        };
      }
    }

    return () => {
      ctx.revert();
    };
  }, []);

  const titleLine1 = "ALF LEILA";
  const titleLine2 = "WA LEILA";

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #14141B 0%, #0A0A0F 50%, #050508 100%)",
      }}
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Ambient particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      <div ref={contentRef} className="relative w-full h-full z-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gold Border Frame */}
          {/* Top edge */}
          <path
            ref={(el) => { borderRefs.current[0] = el; }}
            d="M 8 2 L 92 2"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          {/* Bottom edge */}
          <path
            ref={(el) => { borderRefs.current[1] = el; }}
            d="M 8 98 L 92 98"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          {/* Left edge */}
          <path
            ref={(el) => { borderRefs.current[2] = el; }}
            d="M 2 8 L 2 92"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          {/* Right edge */}
          <path
            ref={(el) => { borderRefs.current[3] = el; }}
            d="M 98 8 L 98 92"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          {/* Corner ornaments */}
          <path
            ref={(el) => { borderRefs.current[4] = el; }}
            d="M 2 8 Q 2 2 8 2"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          <path
            ref={(el) => { borderRefs.current[5] = el; }}
            d="M 92 2 Q 98 2 98 8"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          <path
            ref={(el) => { borderRefs.current[6] = el; }}
            d="M 98 92 Q 98 98 92 98"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />
          <path
            ref={(el) => { borderRefs.current[7] = el; }}
            d="M 8 98 Q 2 98 2 92"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.15"
          />

          {/* Central Plate */}
          <g ref={plateCenterRef} style={{ transformOrigin: "50px 55px" }}>
            <circle cx="50" cy="55" r="18" fill="none" stroke="#C9A96E" strokeWidth="0.4" />
            <circle
              cx="50"
              cy="55"
              r="15"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.2"
              strokeDasharray="1 0.5"
            />
            <circle cx="50" cy="55" r="12" fill="#14141B" fillOpacity="0.3" />
          </g>

          {/* Left Plate 1 */}
          <g ref={plateLeft1Ref} style={{ transformOrigin: "20px 40px" }}>
            <circle cx="20" cy="40" r="7" fill="none" stroke="#C9A96E" strokeWidth="0.25" />
            <circle
              cx="20"
              cy="40"
              r="5.5"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.15"
              strokeDasharray="0.8 0.4"
            />
          </g>

          {/* Left Plate 2 */}
          <g ref={plateLeft2Ref} style={{ transformOrigin: "20px 70px" }}>
            <circle cx="20" cy="70" r="7" fill="none" stroke="#C9A96E" strokeWidth="0.25" />
            <circle
              cx="20"
              cy="70"
              r="5.5"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.15"
              strokeDasharray="0.8 0.4"
            />
          </g>

          {/* Right Plate 1 */}
          <g ref={plateRight1Ref} style={{ transformOrigin: "80px 40px" }}>
            <circle cx="80" cy="40" r="7" fill="none" stroke="#C9A96E" strokeWidth="0.25" />
            <circle
              cx="80"
              cy="40"
              r="5.5"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.15"
              strokeDasharray="0.8 0.4"
            />
          </g>

          {/* Right Plate 2 */}
          <g ref={plateRight2Ref} style={{ transformOrigin: "80px 70px" }}>
            <circle cx="80" cy="70" r="7" fill="none" stroke="#C9A96E" strokeWidth="0.25" />
            <circle
              cx="80"
              cy="70"
              r="5.5"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.15"
              strokeDasharray="0.8 0.4"
            />
          </g>

          {/* Tagine - Top Center */}
          <g ref={tagineBaseRef} style={{ transformOrigin: "50px 25px" }}>
            {/* Base */}
            <ellipse cx="50" cy="28" rx="8" ry="4" fill="#8B7355" fillOpacity="0.6" />
            <ellipse cx="50" cy="27" rx="7" ry="3.5" fill="#C9A96E" fillOpacity="0.3" />
          </g>
          <g ref={tagineLidRef} style={{ transformOrigin: "50px 20px" }}>
            {/* Lid */}
            <path
              d="M 43 27 Q 50 12 57 27"
              fill="#C9A96E"
              fillOpacity="0.4"
              stroke="#8B7355"
              strokeWidth="0.2"
            />
          </g>

          {/* Steam */}
          <path
            ref={(el) => { steamRefs.current[0] = el; }}
            d="M 47 15 Q 46 10 48 8 Q 50 6 49 3"
            fill="none"
            stroke="#E8D5A3"
            strokeWidth="0.15"
            strokeLinecap="round"
            opacity="0"
          />
          <path
            ref={(el) => { steamRefs.current[1] = el; }}
            d="M 50 14 Q 49 9 51 7 Q 53 5 52 2"
            fill="none"
            stroke="#E8D5A3"
            strokeWidth="0.15"
            strokeLinecap="round"
            opacity="0"
          />
          <path
            ref={(el) => { steamRefs.current[2] = el; }}
            d="M 53 15 Q 52 10 54 8 Q 56 6 55 3"
            fill="none"
            stroke="#E8D5A3"
            strokeWidth="0.15"
            strokeLinecap="round"
            opacity="0"
          />

          {/* Candle - Bottom Right */}
          <g ref={candleRef} style={{ transformOrigin: "75px 82px" }}>
            {/* Candle body */}
            <rect x="73" y="78" width="4" height="6" rx="0.5" fill="#F5F0E8" fillOpacity="0.8" />
            {/* Wax drips */}
            <path
              d="M 73 79 Q 74 80.5 74.5 79.5 Q 75 81 75.5 79.5 Q 76 80.5 77 79"
              fill="none"
              stroke="#F5F0E8"
              strokeWidth="0.3"
              strokeOpacity="0.6"
            />
            {/* Flame outer */}
            <path
              ref={flameOuterRef}
              d="M 75 78 Q 73.5 75 75 73 Q 76.5 75 75 78"
              fill="#FF6B1A"
              fillOpacity="0.8"
              style={{ transformOrigin: "75px 78px" }}
            />
            {/* Flame inner */}
            <path
              ref={flameInnerRef}
              d="M 75 77.5 Q 74.2 76 75 74.8 Q 75.8 76 75 77.5"
              fill="#FFFFFF"
              fillOpacity="0.6"
              style={{ transformOrigin: "75px 77.5px" }}
            />
          </g>

          {/* Herbs and Accents */}
          <g ref={(el) => { herbRefs.current[0] = el; }} style={{ transformOrigin: "15px 75px" }}>
            <path d="M 15 75 Q 14 73 15 71 Q 16 73 15 75" fill="#2D5016" fillOpacity="0.7" />
            <path d="M 15 73 Q 13 72 14 70" fill="none" stroke="#2D5016" strokeWidth="0.2" />
          </g>
          <g ref={(el) => { herbRefs.current[1] = el; }} style={{ transformOrigin: "85px 20px" }}>
            <path d="M 85 20 Q 84 18 85 16 Q 86 18 85 20" fill="#2D5016" fillOpacity="0.6" />
          </g>
          <g ref={(el) => { herbRefs.current[2] = el; }} style={{ transformOrigin: "70px 85px" }}>
            <ellipse cx="70" cy="85" rx="1.5" ry="0.8" fill="#8B2500" fillOpacity="0.5" />
          </g>
          <g ref={(el) => { herbRefs.current[3] = el; }} style={{ transformOrigin: "30px 30px" }}>
            <path d="M 30 30 Q 29 28 30 26" fill="none" stroke="#2D5016" strokeWidth="0.25" />
            <circle cx="29" cy="28" r="0.4" fill="#2D5016" fillOpacity="0.5" />
          </g>
          <g ref={(el) => { herbRefs.current[4] = el; }} style={{ transformOrigin: "60px 88px" }}>
            <path d="M 60 88 Q 59 86 60 84 Q 61 86 60 88" fill="#2D5016" fillOpacity="0.5" />
          </g>
          <g ref={(el) => { herbRefs.current[5] = el; }} style={{ transformOrigin: "40px 15px" }}>
            <ellipse cx="40" cy="15" rx="1" ry="0.6" fill="#8B2500" fillOpacity="0.4" />
          </g>

          {/* Candle glow */}
          <radialGradient id="candleGlow" cx="75" cy="75" r="8">
            <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0" />
          </radialGradient>
          <circle cx="75" cy="76" r="8" fill="url(#candleGlow)" />
        </svg>

        {/* Title on central plate */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ transform: "translateY(2vh)" }}
        >
          <h1 className="font-display text-center leading-none">
            <span className="block text-[clamp(1.8rem,5vw,4rem)] text-gold-primary tracking-[-0.02em]" style={{ textShadow: "0 2px 20px rgba(201, 169, 110, 0.3)" }}>
              {titleLine1.split("").map((char, i) => (
                <span key={i} className="char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="block text-[clamp(1.5rem,4vw,3rem)] text-gold-light tracking-[-0.02em] mt-1" style={{ textShadow: "0 2px 20px rgba(201, 169, 110, 0.3)" }}>
              {titleLine2.split("").map((char, i) => (
                <span key={i} className="char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </h1>
          <p className="font-heading text-cream/60 text-sm tracking-[0.2em] mt-4" style={{ fontStyle: "italic" }}>
            A THOUSAND AND ONE NIGHTS OF FLAVOR
          </p>
        </div>
      </div>
    </section>
  );
}
