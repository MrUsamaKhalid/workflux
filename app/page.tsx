"use client";

import Link from "next/link";
import { AiOutlineFileText, AiOutlineRobot, AiOutlineSearch } from "react-icons/ai";

/**
 * Landing page for Workflux.
 *
 * This page introduces users to the platform and directs them to
 * sign up or sign in. It embraces a modern, glassmorphic look
 * inspired by the Nixtio dashboard: a soft gradient background,
 * floating cards, large typography and minimal clutter.
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      {/* Hero Section */}
      <div className="max-w-3xl w-full bg-white/40 backdrop-blur-lg rounded-3xl shadow-md p-8 md:p-16 mb-12 border border-white/30">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Workflux</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Automate your job search, build stunning resumes, and craft personalized cover letters — all powered by AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signin"
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow transition-colors"
          >
            Sign In / Sign Up
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 rounded-full border border-indigo-500 text-indigo-700 hover:bg-indigo-50 backdrop-blur-md font-medium transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <section id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 shadow border border-white/30">
          <div className="text-indigo-600 text-3xl mb-4 flex justify-center"><AiOutlineFileText /></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">AI-Enhanced Resumes</h3>
          <p className="text-gray-700 text-sm">
            Upload, paste or import your job history and let AI craft an ATS-friendly, professional resume for you.
          </p>
        </div>
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 shadow border border-white/30">
          <div className="text-indigo-600 text-3xl mb-4 flex justify-center"><AiOutlineRobot /></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Cover Letters</h3>
          <p className="text-gray-700 text-sm">
            Generate personalized cover letters tailored to each position and company with a click.
          </p>
        </div>
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 shadow border border-white/30">
          <div className="text-indigo-600 text-3xl mb-4 flex justify-center"><AiOutlineSearch /></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Job Automation</h3>
          <p className="text-gray-700 text-sm">
            Discover and apply to jobs across LinkedIn and Indeed automatically, while tracking your progress.
          </p>
        </div>
      </section>
    </div>
  );
}