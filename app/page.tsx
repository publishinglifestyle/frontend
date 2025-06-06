"use client";

import React, { useState, useEffect, Key } from "react";
import Head from "next/head";
import {
  Button,
  Chip,
  Link,
  RadioGroup,
  Spacer,
  Tab,
  Tabs,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const frequencies = [
  {
    key: "yearly",
    label: "Pay Yearly",
    priceSuffix: "year",
    discount: "Save 16,6%",
  },
  { key: "monthly", label: "Pay Monthly", priceSuffix: "monthly" },
];

type Tier = {
  key: string;
  title: string;
  price: { yearly: string; monthly: string };
  description_month: string;
  description_year: string;
  mostPopular?: boolean;
};

const tiers: Tier[] = [
  {
    key: "basic",
    title: "Basic",
    price: { yearly: "€390", monthly: "€39" },
    description_month: "40,000,000 credits per month",
    description_year: "480,000,000 credits per year",
  },
  {
    key: "pro",
    title: "Pro",
    price: { yearly: "€490", monthly: "€49" },
    description_month: "60,000,000 credits per month",
    description_year: "720,000,000 credits per year",
    mostPopular: true,
  },
  {
    key: "star",
    title: "Star",
    price: { yearly: "€990", monthly: "€99" },
    description_month: "110,000,000 credits per month",
    description_year: "1,320,000,000 credits per year",
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
  }, []);

  const onFrequencyChange = (selectedKey: Key) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
    setSelectedFrequency(frequencies[frequencyIndex]);
  };

  return (
    <>
      {/* SEO and Head Elements */}
      {isClient && (
        <Head>
          <title>Low Content AI - AI-Powered Book Creation Platform</title>
          <meta
            name="description"
            content="Create low-content books like journals, planners, and coloring books using AI tools for Amazon publishing."
          />
          <meta
            name="keywords"
            content="Low Content AI, AI book creator, Amazon KDP, low-content books"
          />
          <meta name="robots" content="index, follow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
      )}

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center text-center gap-8 py-12 min-h-screen bg-[#1e1e2f] text-white"
        style={{ marginTop: "-5%" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
            Effortlessly Create Low-Content Books with AI
          </h1>
          <p className="text-lg text-gray-300 mt-6 sm:w-[600px] mx-auto">
            Generate high-quality content, including images and text, for
            journals, planners, and coloring books, ready to publish on Amazon.
          </p>
          <Button
            size="lg"
            className="bg-purple-600 text-white px-8 py-4 mt-8 text-lg hover:bg-purple-500 transition-transform transform hover:scale-105"
            onPress={() => router.push("/home")}
          >
            Get Started Now
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-64 bg-[#2a2a3c] text-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="container mx-auto text-center"
        >
          <h2 className="text-4xl font-semibold mb-12">
            Why Choose Low Content AI?
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: "ic:baseline-auto-awesome",
                title: "AI-Generated Content",
                description: "Create stunning images and text for your books.",
              },
              {
                icon: "mdi:amazon",
                title: "Amazon-Ready",
                description:
                  "Optimized content for direct publishing on Amazon.",
              },
              {
                icon: "mdi:clock-fast",
                title: "Save Time",
                description: "Produce books in minutes, not hours or days.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-8 bg-[#1e1e2f] rounded-lg shadow-lg hover:shadow-2xl"
              >
                <Icon
                  icon={feature.icon}
                  width={48}
                  className="mb-6 mx-auto text-purple-400"
                />
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Table */}
      <section className="py-64 bg-[#1e1e2f] text-white">
        <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8 sm:mb-12 break-words">Pricing</h2>
          <div className="mb-6 sm:mb-8 flex justify-center">
            <Tabs
              classNames={{ 
                tab: "data-[hover-unselected=true]:opacity-90",
                tabList: "bg-[#2a2a3c] p-1"
              }}
              radius="full"
              size="lg"
              onSelectionChange={onFrequencyChange}
            >
              {frequencies.map((frequency) => (
                <Tab
                  key={frequency.key}
                  title={
                    <div className="flex items-center gap-2 flex-wrap justify-center px-2">
                      <span className="whitespace-nowrap text-sm sm:text-base">{frequency.label}</span>
                      {frequency.discount && (
                        <Chip color="secondary" className="shrink-0 text-xs">{frequency.discount}</Chip>
                      )}
                    </div>
                  }
                />
              ))}
            </Tabs>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 mt-8 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto pricing-grid">
            {tiers.map((tier) => (
              <motion.div
                key={tier.key}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[320px] sm:min-h-[300px] flex flex-col justify-between pricing-card
        ${tier.mostPopular ? "bg-purple-700 border-2 border-yellow-400" : "bg-[#2a2a3c]"}`}
              >
                {tier.mostPopular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Chip
                      color="warning"
                      className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
                    >
                      Most Popular
                    </Chip>
                  </div>
                )}
                <div className="flex-1 pt-6 sm:pt-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 break-words leading-tight pricing-title">{tier.title}</h3>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-300 break-words leading-none pricing-price">
                      {tier.price[selectedFrequency.key as keyof typeof tier.price]}
                    </p>
                    <span className="text-xs sm:text-sm md:text-lg text-gray-400 block mt-1 break-words">
                      /{selectedFrequency.priceSuffix}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed break-words hyphens-auto pricing-description">
                    {selectedFrequency.key === "yearly"
                      ? tier.description_year
                      : tier.description_month}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-64 bg-[#2a2a3c] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Sarah",
                quote:
                  "Low Content AI saved me hours of work! I created my first journal in minutes and published it on Amazon the same day.",
              },
              {
                name: "John",
                quote:
                  "The AI tools are amazing. My coloring books look professional, and I finally hit my first 100 sales on Amazon.",
              },
              {
                name: "Emma",
                quote:
                  "This platform is a game-changer for anyone in the low-content book business. Simple, fast, and effective!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-8 bg-[#1e1e2f] rounded-lg shadow-lg hover:shadow-2xl"
              >
                <p className="italic text-gray-300 mb-6">
                  "{testimonial.quote}"
                </p>
                <h4 className="text-purple-400 font-semibold">
                  - {testimonial.name}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 bg-purple-600 text-white text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-3xl font-semibold mb-6"
        >
          Ready to Create Your Next Bestseller?
        </motion.h2>
        <Button
          className="bg-white text-purple-600 px-8 py-4 text-lg hover:bg-gray-200 transition-transform transform hover:scale-105"
          onPress={() => router.push("/home")}
        >
          Get Started for Free
        </Button>
      </footer>
    </>
  );
}
