/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, HelpCircle, ChevronDown, ChevronUp, Mail, BookOpen } from "lucide-react";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to Settings > Account > Reset Password. You'll get an email with instructions to create a new password.",
  },
  {
    question: "How can I upload a video?",
    answer:
      "Navigate to the Upload section from the sidebar and select your video file. Fill in the details and hit 'Upload'.",
  },
  {
    question: "Why can't I comment on some videos?",
    answer:
      "Comments may be disabled by the video owner. If it's your video, go to Video Settings and enable comments.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "Click the three dots (⋮) next to the video or comment and select 'Report'. Our team will review it.",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="text-blue-500" size={30} />
          <h1 className="text-3xl font-bold">Help Center</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Find answers to common questions or reach out for support.
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
        />
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-xl dark:border-gray-700 overflow-hidden"
            >
              <button
                className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 pt-0 text-gray-600 dark:text-gray-400"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No results found.</p>
        )}
      </div>

      {/* Contact */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Need more help?</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:support@yourapp.com"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Mail size={20} className="text-blue-500" />
            <span>Email Support</span>
          </a>
          <a
            href="/docs"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <BookOpen size={20} className="text-green-500" />
            <span>Read Documentation</span>
          </a>
        </div>
      </div>
    </div>
  );
}
