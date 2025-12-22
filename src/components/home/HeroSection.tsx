import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <motion.section
      className="relative pt-12 pb-20 md:pt-32 md:pb-48 overflow-hidden min-h-[85vh] flex items-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      { }
      <div className="absolute inset-0 z-0">
        {[
          '/hero-1.jpg',
          '/hero-2.jpg'
        ].map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={img}
              alt="Students learning"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/40 to-black/40" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-orange-400 font-semibold tracking-wider uppercase mb-4 block"></span>
          <h1 className="font-display text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Online Education <br />
            Academy
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Podcasting operational change management inside of workflows to establish a framework. Taking seamless key performance indicators offline.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-md transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get started
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base bg-white text-orange-600 hover:bg-orange-50 border-0 rounded-md transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      { }
    </motion.section>
  );
}