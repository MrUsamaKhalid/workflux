"use client";

import Link from "next/link";
import {
  FaBriefcase,
  FaFileUpload,
  FaFileAlt,
  FaSearch,
  FaMagic,
  FaGlobeAmericas,
  FaUserFriends,
  FaStar,
  FaComments,
} from "react-icons/fa";

/**
 * Landing page for Workflux using a dark, gradient style inspired by the
 * Remote Horizon design. This page highlights core features of the
 * platform and introduces the service to prospective users. Feel free to
 * adjust content, icons and links to suit your needs. The page is
 * responsive and uses Tailwind CSS classes for styling.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#12073b] via-[#2e014e] to-[#411080] text-white">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between py-6 px-4 md:px-8">
        <div className="text-xl md:text-2xl font-bold">Workflux</div>
        <nav className="hidden md:flex gap-8 text-sm">
          <Link href="#features" className="hover:text-purple-300 transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-purple-300 transition-colors">
            Pricing
          </Link>
          <Link href="#templates" className="hover:text-purple-300 transition-colors">
            Templates
          </Link>
          <Link href="#about" className="hover:text-purple-300 transition-colors">
            About
          </Link>
        </nav>
        <div className="flex gap-3">
          <Link
            href="/signin"
            className="py-2 px-4 rounded-full border border-purple-500 text-purple-100 hover:bg-purple-700 transition-colors text-sm"
          >
            Log In
          </Link>
          <Link
            href="/signin"
            className="py-2 px-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 transition-colors text-sm shadow-lg"
          >
            Get Access
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center text-center px-4 md:px-8 pt-12 pb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 max-w-3xl">
          Get Access to the Best Job Tools
        </h1>
        <p className="text-base md:text-lg text-purple-200 max-w-2xl mb-8">
          Automate your job search and career development with AI‑powered resumes,
          smart cover letters and job tracking — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-14">
          <Link
            href="/resume"
            className="py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg hover:brightness-110 transition-colors text-sm font-medium"
          >
            Build Resume
          </Link>
          <Link
            href="/cover-letter"
            className="py-3 px-6 rounded-full border border-purple-500 text-purple-200 hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Write Cover Letter
          </Link>
        </div>

        {/* Feature Cards in Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* AI Resumes */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-inner hover:shadow-xl transition-shadow">
            <div className="text-pink-400 text-3xl mb-4"><FaFileAlt /></div>
            <h3 className="text-lg font-semibold mb-2">AI‑Enhanced Resumes</h3>
            <p className="text-sm text-purple-200">
              Upload or paste your job history and let our AI craft a professional,
              ATS‑friendly resume.
            </p>
          </div>
          {/* Smart Letters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-inner hover:shadow-xl transition-shadow">
            <div className="text-purple-400 text-3xl mb-4"><FaMagic /></div>
            <h3 className="text-lg font-semibold mb-2">Smart Cover Letters</h3>
            <p className="text-sm text-purple-200">
              Generate personalized cover letters tailored to each role and
              organization in seconds.
            </p>
          </div>
          {/* Job Automation */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-inner hover:shadow-xl transition-shadow">
            <div className="text-indigo-400 text-3xl mb-4"><FaSearch /></div>
            <h3 className="text-lg font-semibold mb-2">Job Automation</h3>
            <p className="text-sm text-purple-200">
              Search and apply to jobs across platforms automatically and track your
              progress in one dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="container mx-auto py-12 px-4 md:px-8 flex flex-col items-center">
        <p className="uppercase tracking-widest text-xs text-purple-400 mb-4">
          Trusted by professionals at
        </p>
        <div className="flex flex-wrap justify-center gap-8 opacity-80">
          {['Google', 'Stripe', 'Airbnb', 'Spotify', 'Microsoft', 'Asana'].map((logo) => (
            <span key={logo} className="text-sm font-medium text-purple-300">
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* Services / Benefits */}
      <section id="features" className="container mx-auto py-16 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Endless Benefits of Our Platform
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-indigo-500 text-2xl mb-4"><FaFileUpload /></div>
            <h3 className="font-semibold text-lg mb-2">Easy Resume Import</h3>
            <p className="text-sm text-purple-200">
              Drag and drop your existing resume, upload from LinkedIn or start from
              scratch. We’ll handle the rest.
            </p>
          </div>
          {/* Service 2 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-pink-500 text-2xl mb-4"><FaBriefcase /></div>
            <h3 className="font-semibold text-lg mb-2">Job Match Recommendations</h3>
            <p className="text-sm text-purple-200">
              Receive curated job recommendations based on your skills, preferred
              location and industry.
            </p>
          </div>
          {/* Service 3 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-purple-500 text-2xl mb-4"><FaGlobeAmericas /></div>
            <h3 className="font-semibold text-lg mb-2">Global Opportunities</h3>
            <p className="text-sm text-purple-200">
              Unlock opportunities worldwide. Search roles across borders with
              multi‑country support.
            </p>
          </div>
          {/* Service 4 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-green-400 text-2xl mb-4"><FaUserFriends /></div>
            <h3 className="font-semibold text-lg mb-2">Networking Tools</h3>
            <p className="text-sm text-purple-200">
              Connect with peers and mentors through built‑in networking features and
              collaborative job boards.
            </p>
          </div>
          {/* Service 5 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-yellow-400 text-2xl mb-4"><FaStar /></div>
            <h3 className="font-semibold text-lg mb-2">Portfolio Showcase</h3>
            <p className="text-sm text-purple-200">
              Showcase your work with integrated portfolio pages and highlight your
              achievements.
            </p>
          </div>
          {/* Service 6 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-orange-400 text-2xl mb-4"><FaComments /></div>
            <h3 className="font-semibold text-lg mb-2">Interview Practice</h3>
            <p className="text-sm text-purple-200">
              Prepare for interviews with an AI‑driven practice buddy, tailored to your
              target roles.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto py-16 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Starter',
              price: 'Free',
              description: 'Basic tools to get started',
              features: ['AI resume builder', 'Cover letter generator', 'Limited job search'],
            },
            {
              name: 'Pro',
              price: '$9/mo',
              description: 'Unlock full job automation',
              features: [
                'Everything in Starter',
                'Unlimited job applications',
                'Portfolio showcase',
              ],
              highlight: true,
            },
            {
              name: 'Enterprise',
              price: 'Contact us',
              description: 'Custom solutions for teams',
              features: [
                'Team management',
                'Advanced analytics',
                'Dedicated support',
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all ${
                plan.highlight ? 'border-2 border-pink-500' : ''
              }`}
            >
              <div>
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-4">{plan.price}</p>
                <p className="text-sm text-purple-200 mb-4">{plan.description}</p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`mt-6 py-3 px-6 rounded-full text-sm font-medium ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg hover:brightness-110'
                    : 'border border-purple-500 text-purple-200 hover:bg-purple-700'
                } transition-colors`}
              >
                {plan.highlight ? 'Get Started' : 'Contact Us'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-16 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Hear from Our Users
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all"
            >
              <p className="text-sm text-purple-200 mb-4 italic">
                “Workflux took the hassle out of job hunting. Within a week I had a
                polished resume and several interviews lined up!”
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-300" />
                <div>
                  <p className="font-medium">Alex Johnson</p>
                  <p className="text-xs text-purple-400">Product Designer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto py-16 px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in the Loop</h2>
        <p className="text-purple-200 mb-8">
          Join our newsletter for weekly job updates, career tips and exclusive
          discounts.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 py-3 px-4 rounded-full bg-white/10 backdrop-blur border border-white/20 placeholder-purple-400 text-white focus:outline-none"
          />
          <button className="py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium shadow-lg hover:brightness-110">
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-purple-400">© {new Date().getFullYear()} Workflux. All rights reserved.</p>
          <nav className="flex gap-6 text-sm">
            <Link href="#" className="hover:text-purple-300">About</Link>
            <Link href="#" className="hover:text-purple-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-purple-300">Terms</Link>
            <Link href="#" className="hover:text-purple-300">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
