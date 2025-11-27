"use client";

import React, { useState, useEffect, Key } from "react";
import Head from "next/head";
import { Button, Chip, Tab, Tabs } from "@heroui/react";
import { useRouter } from "next/navigation";
import { captureUtmParams } from "../utils/utm";
import { motion } from "framer-motion";

// Icons
const SparklesIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const AmazonIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 12.5c0 2.5-3.5 5-9.5 5s-9.5-2.5-9.5-5" />
    <path d="M3 7.5c0-2.5 3.5-5 9.5-5s9.5 2.5 9.5 5" />
    <path d="M3 7.5v5" />
    <path d="M21 7.5v5" />
    <path d="M12 3v14" />
    <path d="M8 10l4 4 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="opacity-20">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const frequencies = [
  {
    key: "yearly",
    label: "Pay Yearly",
    priceSuffix: "year",
    discount: "Save 16.6%",
  },
  { key: "monthly", label: "Pay Monthly", priceSuffix: "month" },
];

type Tier = {
  key: string;
  title: string;
  price: { yearly: string; monthly: string };
  description_month: string;
  description_year: string;
  mostPopular?: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    key: "basic",
    title: "Basic",
    price: { yearly: "€390", monthly: "€39" },
    description_month: "40,000,000 credits per month",
    description_year: "480,000,000 credits per year",
    features: ["AI Image Generation", "AI Text Generation", "Basic Templates", "Email Support"],
  },
  {
    key: "pro",
    title: "Pro",
    price: { yearly: "€490", monthly: "€49" },
    description_month: "60,000,000 credits per month",
    description_year: "720,000,000 credits per year",
    mostPopular: true,
    features: ["Everything in Basic", "Priority Generation", "Advanced Templates", "Priority Support"],
  },
  {
    key: "star",
    title: "Star",
    price: { yearly: "€990", monthly: "€99" },
    description_month: "110,000,000 credits per month",
    description_year: "1,320,000,000 credits per year",
    features: ["Everything in Pro", "Unlimited Templates", "API Access", "Dedicated Support"],
  },
];

const features = [
  {
    icon: SparklesIcon,
    title: "AI-Generated Content",
    description: "Create stunning images and text for your books using cutting-edge AI technology.",
  },
  {
    icon: AmazonIcon,
    title: "Amazon-Ready",
    description: "Optimized content formatted perfectly for direct publishing on Amazon KDP.",
  },
  {
    icon: ClockIcon,
    title: "Save Time",
    description: "Produce professional books in minutes, not hours or days. Focus on scaling your business.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Self-Publisher",
    quote: "Low Content AI saved me hours of work! I created my first journal in minutes and published it on Amazon the same day.",
    rating: 5,
  },
  {
    name: "John D.",
    role: "KDP Entrepreneur",
    quote: "The AI tools are amazing. My coloring books look professional, and I finally hit my first 100 sales on Amazon.",
    rating: 5,
  },
  {
    name: "Emma R.",
    role: "Content Creator",
    quote: "This platform is a game-changer for anyone in the low-content book business. Simple, fast, and effective!",
    rating: 5,
  },
];

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<{
    key: string;
    label: string;
    priceSuffix: string;
    discount?: string;
  }>(frequencies[0]);

  useEffect(() => {
    setIsClient(true);
    const searchParams = new URLSearchParams(window.location.search);
    captureUtmParams(searchParams);
  }, []);

  const onFrequencyChange = (selectedKey: Key) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
    setSelectedFrequency(frequencies[frequencyIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* SEO and Head Elements */}
      {isClient && (
        <Head>
          <title>Low Content AI - AI-Powered Book Creation Platform</title>
          <meta
            content="Create low-content books like journals, planners, and coloring books using AI tools for Amazon publishing."
            name="description"
          />
          <meta
            content="Low Content AI, AI book creator, Amazon KDP, low-content books"
            name="keywords"
          />
          <meta content="index, follow" name="robots" />
          <meta
            content="width=device-width, initial-scale=1.0"
            name="viewport"
          />
        </Head>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
              <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
            </svg>
            <span className="text-purple-400 text-sm font-medium">AI-Powered Book Creation</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Effortlessly Create{" "}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Low-Content Books
            </span>{" "}
            with AI
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Generate high-quality content, including images and text, for journals, planners, and coloring books, ready to publish on Amazon.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              onPress={() => router.push("/home")}
              size="lg"
            >
              Get Started Now
            </Button>
            <Button
              className="px-8 py-6 text-lg font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300"
              onPress={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
              size="lg"
              variant="bordered"
            >
              View Pricing
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/40 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 md:py-32 px-4" id="features">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Low Content AI?
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Everything you need to create, publish, and sell low-content books on Amazon
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                key={index}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 md:py-32 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. All plans include access to our AI tools.
            </p>

            {/* Frequency Toggle */}
            <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full">
              <Tabs
                classNames={{
                  tab: "data-[hover-unselected=true]:opacity-90 px-6 py-2",
                  tabList: "bg-transparent gap-0",
                  cursor: "bg-gradient-to-r from-purple-600 to-violet-600",
                }}
                onSelectionChange={onFrequencyChange}
                radius="full"
                size="lg"
              >
                {frequencies.map((frequency) => (
                  <Tab
                    key={frequency.key}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{frequency.label}</span>
                        {frequency.discount && (
                          <Chip className="bg-green-500/20 text-green-400 text-xs" size="sm">
                            {frequency.discount}
                          </Chip>
                        )}
                      </div>
                    }
                  />
                ))}
              </Tabs>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                className={`relative bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${
                  tier.mostPopular
                    ? "border-purple-500/50 scale-105 shadow-2xl shadow-purple-500/20"
                    : "border-white/10 hover:border-purple-500/30"
                }`}
                initial={{ opacity: 0, y: 20 }}
                key={tier.key}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                {tier.mostPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium py-2 text-center">
                    Most Popular
                  </div>
                )}

                <div className={`p-8 ${tier.mostPopular ? "pt-14" : ""}`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.title}</h3>
                  <p className="text-white/50 text-sm mb-6">
                    {selectedFrequency.key === "yearly" ? tier.description_year : tier.description_month}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-bold text-white">
                      {tier.price[selectedFrequency.key as keyof typeof tier.price]}
                    </span>
                    <span className="text-white/50 ml-2">/{selectedFrequency.priceSuffix}</span>
                  </div>

                  <Button
                    className={`w-full py-6 font-semibold rounded-xl transition-all duration-300 ${
                      tier.mostPopular
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    }`}
                    onPress={() => router.push("/home")}
                    size="lg"
                  >
                    Get Started
                  </Button>

                  <div className="mt-8 space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <div className="flex items-center gap-3" key={featureIndex}>
                        <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                          <CheckIcon />
                        </div>
                        <span className="text-white/70 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 md:py-32 px-4" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Join thousands of creators who are already using Low Content AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                key={index}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <QuoteIcon />
                <p className="text-white/70 mb-6 mt-2">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-white/50 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-b from-purple-500/20 to-violet-500/10 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your Next Bestseller?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join thousands of publishers who are creating and selling low-content books with AI.
            </p>
            <Button
              className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              onPress={() => router.push("/home")}
              size="lg"
            >
              Get Started for Free
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Low Content AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a className="text-white/40 hover:text-white/70 text-sm transition-colors" href="/privacy">
              Privacy Policy
            </a>
            <a className="text-white/40 hover:text-white/70 text-sm transition-colors" href="/terms">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
