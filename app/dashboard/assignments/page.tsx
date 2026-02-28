"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AssignmentItem {
  id: string;
  title: string;
  type: "interactive-reading" | "vocabulary" | "ipractice" | "writing" | "monitor" | "info";
}

interface AssignmentCategory {
  label: string;
  type: AssignmentItem["type"];
  items: AssignmentItem[];
  badgeColor: "red" | "green";
}

const categories: AssignmentCategory[] = [
  {
    label: "Interactive Reading",
    type: "interactive-reading",
    badgeColor: "red",
    items: [
      { id: "bomb-dogs", title: "Bomb Dogs: Canine Heroes", type: "interactive-reading" },
      { id: "turn-it-down", title: "Turn It Down!", type: "interactive-reading" },
      { id: "hidden-ads", title: "Hidden Ads", type: "interactive-reading" },
    ],
  },
  {
    label: "Study Plan",
    type: "vocabulary",
    badgeColor: "red",
    items: [
      { id: "study-plan-1", title: "Study Plan Week 1", type: "vocabulary" },
    ],
  },
  {
    label: "Vocabulary, Word Study, and Reading Comprehension",
    type: "vocabulary",
    badgeColor: "red",
    items: [
      { id: "long-vowels", title: "Long Vowels CVCe", type: "vocabulary" },
      { id: "word-slam", title: "Word Slam", type: "vocabulary" },
    ],
  },
  {
    label: "iPractice",
    type: "ipractice",
    badgeColor: "red",
    items: [
      { id: "multimedia", title: "Plan a Multimedia Presentation", type: "ipractice" },
      { id: "poem", title: "Write a Poem", type: "ipractice" },
      { id: "drama", title: "Elements of Drama", type: "ipractice" },
    ],
  },
  {
    label: "Writing",
    type: "writing",
    badgeColor: "green",
    items: [],
  },
  {
    label: "Monitor Progress",
    type: "monitor",
    badgeColor: "red",
    items: [
      { id: "grade-a-mid", title: "GRADE Level A — Middle of the Year", type: "monitor" },
      { id: "reading-check-7", title: "Reading Check 7", type: "monitor" },
    ],
  },
  {
    label: "Information",
    type: "info",
    badgeColor: "red",
    items: [
      { id: "lo-u3w1", title: "Learning Objectives, Unit 3, Week 1", type: "info" },
      { id: "lo-u5w1", title: "Learning Objectives, Unit 5, Week 1", type: "info" },
    ],
  },
];

// --- Particle network background ---

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const PARTICLE_COUNT = 40;
const CONNECTION_DISTANCE = 120;
const PARTICLE_OPACITY = 0.2;

function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.8,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // Pause animation when tab/page not visible
    let isVisible = true;
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Also pause when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting && document.visibilityState === "visible";
        if (isVisible && !animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const animate = () => {
      if (!isVisible) {
        animFrameRef.current = 0;
        return;
      }
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      ctx.strokeStyle = `rgba(255, 255, 255, ${PARTICLE_OPACITY * 0.6})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * PARTICLE_OPACITY * 0.6;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${PARTICLE_OPACITY})`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// --- Main page ---

export default function AssignmentsPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggle = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleItemClick = (item: AssignmentItem) => {
    if (item.type === "interactive-reading") {
      router.push(`/interactive/${item.id}`);
    }
  };

  return (
    <div className="relative min-h-full">
      {/* Particle network background */}
      <ParticleNetwork />

      {/* Content */}
      <div className="relative max-w-2xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-4" style={{ zIndex: 1 }}>
        {/* Header */}
        <div
          className="rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 backdrop-blur-sm"
          style={{
            background: "linear-gradient(135deg, rgba(140, 30, 80, 0.5) 0%, rgba(60, 30, 100, 0.5) 50%, rgba(30, 60, 130, 0.5) 100%)",
          }}
        >
          <h1 className="text-white text-xl font-bold tracking-wide text-center">
            Assignments
          </h1>
        </div>

        {/* Single white card with all categories */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          {categories.map((cat, catIndex) => {
            const isOpen = expanded.has(cat.label);
            const count = cat.items.length;
            const isLast = catIndex === categories.length - 1;

            return (
              <div key={cat.label}>
                {/* Category row */}
                <button
                  onClick={() => toggle(cat.label)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                    !isLast && !isOpen ? "border-b border-gray-200" : ""
                  }`}
                >
                  <span className="text-sm font-bold text-gray-900 text-left">
                    {cat.label}
                  </span>
                  <span
                    className={`min-w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold border-2 ${
                      cat.badgeColor === "green"
                        ? "border-green-500 text-green-600 bg-green-50"
                        : "border-red-500 text-red-600 bg-red-50"
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {/* Expanded items */}
                {isOpen && (
                  <div className={`bg-gray-50 ${!isLast ? "border-b border-gray-200" : ""}`}>
                    {cat.items.length > 0 ? (
                      cat.items.map((item, itemIndex) => (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`w-full text-left px-8 py-3 text-sm transition-colors ${
                            item.type === "interactive-reading"
                              ? "text-gray-800 hover:bg-gray-100 cursor-pointer"
                              : "text-gray-500 cursor-default"
                          } ${itemIndex < cat.items.length - 1 ? "border-b border-gray-100" : ""}`}
                        >
                          {item.title}
                        </button>
                      ))
                    ) : (
                      <div className="px-8 py-3 text-sm text-gray-400 italic">
                        All complete
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
