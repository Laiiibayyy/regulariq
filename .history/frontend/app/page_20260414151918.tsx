"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { saveToken } from '@/lib/auth';


export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ───────── BACKGROUND ANIMATION ───────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4,
      a: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // soft glow
      const grd = ctx.createRadialGradient(w / 2, h * 0.1, 0, w / 2, h * 0.1, 400);
      grd.addColorStop(0, "rgba(0,255,200,0.08)");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.a})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="relative bg-[#070A16] text-white overflow-x-hidden">

      {/* BACKGROUND */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,200,0.08),transparent_40%)]" />

      {/* NAV */}
  <motion.nav className="fixed top-0 w-full z-50 flex items-center justify-between px-10 py-5 backdrop-blur-xl border-b border-white/10">

  {/* LEFT: Logo */}
  <div className="font-bold tracking-tight text-lg">
    Regular<span className="text-cyan-400">IQ</span>
  </div>

  {/* CENTER: Menu */}
  <div className="hidden md:flex gap-8 text-sm text-white/60">
    {["Platform", "Solutions", "Resources", "About"].map((t) => (
      <a key={t} className="hover:text-white transition" href="#">
        {t}
      </a>
    ))}
  </div>

  {/* RIGHT: Auth */}
  <div className="flex gap-3">
    <Link href="/login">
      <button className="text-white/60 hover:text-white transition">
        Sign in
      </button>
    </Link>

    <Link href="/login">
      <button className="bg-white text-black px-5 py-2 rounded-full font-medium hover:scale-105 transition">
        Get started
      </button>
    </Link>
  </div>

</motion.nav>

      {/* HERO */}
      <section className="relative z-10 pt-44 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex px-4 py-1 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-xs text-cyan-200"
        >
          Now powering compliance for 500+ US businesses
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mt-8 leading-tight"
        >
          Compliance that
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-purple-400 bg-clip-text text-transparent">
            actually works for you
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 max-w-2xl mx-auto mt-6"
        >
          We unify regulations, deadlines, and documentation into one intelligent system
          so your business never gets fined again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 mt-10"
        >
          <button className="bg-white text-black px-6 py-3 rounded-full font-medium hover:scale-105 transition">
            Start Demo
          </button>
          <button className="border border-white/20 px-6 py-3 rounded-full hover:bg-white/5 transition">
            Watch Video
          </button>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="relative z-10 mt-24 flex justify-center px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["$14B", "Fines prevented"],
            ["500+", "Businesses"],
            ["98.7%", "Success rate"],
            ["0$", "Setup cost"],
          ].map(([v, l]) => (
            <div key={l} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold">{v}</div>
              <div className="text-xs text-white/40 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="relative z-10 mt-24 px-6 flex justify-center">
        <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">

          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["Compliance Score", "92%"],
              ["Tracked Items", "47"],
              ["Deadlines", "3"],
            ].map((s) => (
              <div key={s[0]} className="p-4 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">{s[0]}</div>
                <div className="text-2xl font-bold">{s[1]}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 h-40 rounded-xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 mt-32 px-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Everything you need</h2>
          <p className="text-white/50 mt-3">
            Built for real-world compliance operations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {[
            "Smart Alerts",
            "AI Compliance Engine",
            "Document Vault",
            "Live Score",
            "Audit Reports",
            "Multi-location",
          ].map((f) => (
            <motion.div
              key={f}
              whileHover={{ y: -6 }}
              className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <div className="text-cyan-300 text-lg">✦</div>
              <h3 className="mt-3 font-semibold">{f}</h3>
              <p className="text-sm text-white/40 mt-2">
                Intelligent compliance automation built for scale.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mt-32 px-6 pb-32">
        <div className="max-w-4xl mx-auto text-center p-14 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl">
          <h2 className="text-4xl font-bold">Ready to stay compliant?</h2>
          <p className="text-white/50 mt-3">
            Start your free trial in less than 60 seconds.
          </p>

          <button className="mt-8 bg-gradient-to-r from-cyan-400 to-purple-500 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-10 text-white/40 border-t border-white/10">
        © 2026 RegularIQ — Built for compliance intelligence
      </footer>
    </div>
  );
}
