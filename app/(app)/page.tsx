"use client";

import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import {
  Dumbbell,
  Heart,
  Bike,
  Flame,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TIER_PRICING,
  TIER_DISPLAY_NAMES,
  TIER_DESCRIPTIONS,
  TIER_ACCESS,
  TIER_FEATURES,
  FREE_TRIAL_DAYS,
  type Tier,
} from "@/lib/constants/subscription";
import { motion } from "framer-motion";

// Helper component for background animations
const FloatingObject = ({ 
  children, 
  delay = 0, 
  duration = 15, // Faster default speed
  left = "10%", 
  top = "10%" 
}: { 
  children: React.ReactNode, 
  delay?: number, 
  duration?: number, 
  left?: string, 
  top?: string 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      y: [0, -60, 0, 60, 0], // Larger movement range
      x: [0, 40, 0, -40, 0],
      opacity: [0, 0.6, 0.2, 0.6, 0], // Increased visibility
      scale: [0.5, 1.2, 0.8, 1.2, 0.5],
      rotate: [0, 90, 180, 270, 360]
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      delay, 
      ease: "linear" // Linear feels more consistent for background "drift"
    }}
    className="absolute pointer-events-none z-10"
    style={{ left, top } as any}
  >
    {children}
  </motion.div>
);

const BackgroundDecorations = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {/* Doubled Quantity of Stars */}
    <FloatingObject top="5%" left="5%" duration={10} delay={0}><Star className="w-4 h-4 text-yellow-400 fill-yellow-400/30" /></FloatingObject>
    <FloatingObject top="15%" left="95%" duration={12} delay={2}><Star className="w-3 h-3 text-yellow-300 fill-yellow-300/30" /></FloatingObject>
    <FloatingObject top="45%" left="85%" duration={8} delay={4}><Star className="w-5 h-5 text-yellow-500 fill-yellow-500/30" /></FloatingObject>
    <FloatingObject top="75%" left="10%" duration={14} delay={1}><Star className="w-4 h-4 text-yellow-200 fill-yellow-200/30" /></FloatingObject>
    <FloatingObject top="35%" left="50%" duration={11} delay={3}><Star className="w-2 h-2 text-white fill-white/40" /></FloatingObject>
    <FloatingObject top="90%" left="40%" duration={13} delay={5}><Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" /></FloatingObject>
    <FloatingObject top="60%" left="95%" duration={9} delay={7}><Star className="w-3 h-3 text-white fill-white/20" /></FloatingObject>
    <FloatingObject top="20%" left="30%" duration={15} delay={6}><Star className="w-4 h-4 text-yellow-500 fill-yellow-500/30" /></FloatingObject>

    {/* Increased Fitness Icons quantity & speed */}
    <FloatingObject top="10%" left="80%" duration={20} delay={1}><Dumbbell className="w-8 h-8 text-primary/20" /></FloatingObject>
    <FloatingObject top="55%" left="2%" duration={25} delay={5}><Flame className="w-10 h-10 text-orange-500/20" /></FloatingObject>
    <FloatingObject top="80%" left="90%" duration={22} delay={3}><Heart className="w-6 h-6 text-rose-500/20" /></FloatingObject>
    <FloatingObject top="30%" left="15%" duration={18} delay={8}><Zap className="w-7 h-7 text-yellow-500/20" /></FloatingObject>
    <FloatingObject top="70%" left="50%" duration={28} delay={10}><Bike className="w-9 h-9 text-amber-500/20" /></FloatingObject>
    <FloatingObject top="40%" left="40%" duration={24} delay={12}><Sparkles className="w-6 h-6 text-primary/20" /></FloatingObject>
  </div>
);

const categories = [
  { name: "Yoga", icon: Heart, classes: "2,400+", color: "text-rose-500" },
  { name: "HIIT", icon: Flame, classes: "1,800+", color: "text-orange-500" },
  { name: "Cycling", icon: Bike, classes: "950+", color: "text-amber-500" },
  { name: "Strength", icon: Dumbbell, classes: "3,200+", color: "text-red-500" },
  { name: "Pilates", icon: Sparkles, classes: "1,100+", color: "text-pink-500" },
  { name: "Boxing", icon: Zap, classes: "720+", color: "text-orange-600" },
];

const stats = [
  { value: "10,000+", label: "Classes Available" },
  { value: "500+", label: "Partner Studios" },
  { value: "50,000+", label: "Active Members" },
  { value: "25+", label: "Cities" },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Plan",
    description:
      "Select a membership that fits your lifestyle. Start with a free trial.",
  },
  {
    number: "02",
    title: "Book Any Class",
    description:
      "Browse thousands of classes and book instantly at studios near you.",
  },
  {
    number: "03",
    title: "Show Up & Sweat",
    description:
      "Check in, work out, and track your progress. It's that simple.",
  },
];

const testimonials = [
  {
    name: "Jane Doe",
    role: "Yoga Enthusiast",
    feedback: "FitPass transformed my fitness journey! The variety of classes is unmatched.",
  },
  {
    name: "John Smith",
    role: "Professional Athlete",
    feedback: "The platform makes booking and tracking workouts effortless.",
  },
];

const instructors = [
  { name: "Alice Green", specialty: "Yoga", img: "/instructors/alice.png" },
  { name: "Mark Lee", specialty: "Strength Training", img: "/instructors/mark.webp" },
  { name: "Sophia Kim", specialty: "HIIT", img: "/instructors/sophia.webp" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden relative">
      <BackgroundDecorations />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-0 right-0 w-150 h-150 bg-linear-to-bl from-primary/20 to-transparent rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          className="absolute bottom-0 left-0 w-100 h-100 bg-linear-to-tr from-primary/15 to-transparent rounded-full blur-3xl -z-10"
        />

        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {FREE_TRIAL_DAYS}-day free trial on all plans
            </Badge>

            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Your Fitness Journey{" "}
              <span className="text-primary">Starts Here</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              One membership. Thousands of classes. Unlimited possibilities.
              From yoga to boxing, find your perfect workout at studios near
              you.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="text-lg px-8 h-14 rounded-full transition-transform hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 rounded-full transition-transform hover:scale-105"
                  asChild
                >
                  <Link href="/classes">
                    Browse Classes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 relative">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent)]"
        />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-20 md:py-28 relative">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect Workout
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From high-intensity training to mindful movement, explore classes
            that match your fitness goals.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4 group-hover:scale-110 transition-transform duration-300 ${category.color}`}
                  >
                    <category.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.classes} classes
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-20 md:py-28 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How FitPass Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started is easy. You'll be booking your first class in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-linear-to-r from-primary/40 to-primary/10" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary text-3xl font-bold mb-6 backdrop-blur-sm">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Instructors Section */}
      <section className="container mx-auto px-4 py-20 md:py-28 relative">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Instructors</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn from the best. Our expert instructors guide you every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {instructors.map((instructor, i) => (
            <motion.div
              key={instructor.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="text-center rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-transform hover:-translate-y-1 bg-background"
            >
              <img src={instructor.img} alt={instructor.name} className="w-full h-56 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{instructor.name}</h3>
                <p className="text-sm text-muted-foreground">{instructor.specialty}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-20 md:py-28 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Members Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from our members who love FitPass.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-primary/5 p-6 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1 backdrop-blur-sm"
              >
                <p className="text-muted-foreground mb-4">"{t.feedback}"</p>
                <h4 className="font-semibold">{t.name}</h4>
                <span className="text-sm text-muted-foreground">{t.role}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 md:py-28 relative">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your fitness routine. All plans include a {FREE_TRIAL_DAYS}-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(["basic", "performance", "champion"] as Tier[]).map((tier, i) => {
            const isPopular = tier === "performance";
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <Card
                  className={`relative transition-all duration-300 hover:shadow-xl bg-background/80 backdrop-blur-md ${
                    isPopular
                      ? "border-primary shadow-lg scale-105 md:scale-110"
                      : "hover:-translate-y-1"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1 text-sm font-semibold shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{TIER_DISPLAY_NAMES[tier]}</CardTitle>
                    <CardDescription>{TIER_DESCRIPTIONS[tier]}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-5xl font-bold">${TIER_PRICING[tier].monthly}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{TIER_ACCESS[tier]}</p>
                    <ul className="space-y-3 text-left">
                      {TIER_FEATURES[tier].map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <Button className="w-full h-12 text-base" variant={isPopular ? "default" : "outline"}>
                          Start Free Trial
                        </Button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Button className="w-full h-12 text-base" variant={isPopular ? "default" : "outline"} asChild>
                        <Link href="/upgrade">Choose Plan</Link>
                      </Button>
                    </SignedIn>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a {FREE_TRIAL_DAYS}-day free trial. Cancel anytime. No commitment.
        </p>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <motion.div
          animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"
        />
        <motion.div
          animate={{ rotate: [0, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]"
        />

        <div className="container relative mx-auto px-4 py-20 md:py-28 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join 50,000+ members who've discovered a better way to stay fit.
              Start your {FREE_TRIAL_DAYS}-day free trial today.
            </p>

            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="text-lg px-10 h-14 rounded-full font-semibold transition-transform hover:scale-105">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" variant="secondary" className="text-lg px-10 h-14 rounded-full font-semibold transition-transform hover:scale-105" asChild>
                <Link href="/classes">
                  Browse Classes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </SignedIn>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{FREE_TRIAL_DAYS}-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>No commitment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20 relative z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/classes" className="hover:text-foreground transition">
                Classes
              </Link>
              <Link href="/map" className="hover:text-foreground transition">
                Studios
              </Link>
              <Link href="/upgrade" className="hover:text-foreground transition">
                Pricing
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FitPass. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}