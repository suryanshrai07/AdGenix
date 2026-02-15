import { UploadIcon, VideoIcon, ZapIcon } from "lucide-react";

export const featuresData = [
  {
    icon: <UploadIcon className="w-6 h-6" />,
    title: "Smart Upload",
    desc: "Drag & drop your assets. We auto-optimize formats and sizes.",
  },
  {
    icon: <ZapIcon className="w-6 h-6" />,
    title: "Instant Generation",
    desc: "Optimized models deliver output in seconds with great fidelity.",
  },
  {
    icon: <VideoIcon className="w-6 h-6" />,
    title: "Video Synthesis",
    desc: "Bring product shots to life with short-form, social-ready videos.",
  },
];

export const plansData = [
  {
    id: "starter",
    name: "Free",
    price: "$0",
    desc: "Always free",
    credits: "",
    features: [
      "20 Free Credits",
      "Standard quality",
      "No watermark",
      "Slower generation speed",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    desc: "Only billed monthly",
    credits: "Month",
    features: [
      "80 Monthly Credits",
      "HD quality",
      "No watermark",
      "Video generation",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "ultra",
    name: "Premium",
    price: "$29",
    desc: "Only billed monthly",
    credits: "Month",
    features: [
      "No watermark",
      "240 Monthly Credit",
      "FHD quality",
      "Fast generation speed",
      "Chat + Email support",
    ],
  },
];

export const faqData = [
  {
    question: "How does the AI generation work?",
    answer:
      "We use state-of-the-art diffusion models trained on millions of product images to seamlessly blend your product into realistic scenes, while preserving fine details, accurate lighting, and natural reflections.",
  },
  {
    question: "Do I own the generated images?",
    answer:
      "Yes — you receive full commercial rights to all images and videos generated on the platform. You’re free to use them for advertisements, e-commerce listings, social media, and more.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes — you can cancel your subscription directly from your dashboard. You’ll continue to have access until the end of your current billing period.",
  },
  {
    question: "What input formats do you support?",
    answer:
      "We support JPG, PNG, and WEBP uploads. Outputs are delivered as high-resolution PNG images and MP4 videos optimized for social and marketing platforms.",
  },
];

export const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "Home", url: "#" },
      { name: "Services", url: "#" },
      { name: "Work", url: "#" },
      { name: "Contact", url: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "Twitter", url: "#" },
      { name: "LinkedIn", url: "#" },
      { name: "GitHub", url: "#" },
    ],
  },
];
