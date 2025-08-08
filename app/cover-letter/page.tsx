"use client";

import { useState } from 'react';
import AppShell from '@/components/AppShell';

/**
 * Cover Letter Generator page allows users to input job details
 * and produces a draft cover letter. The generation is stubbed for now.
 */
export default function CoverLetter() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [letter, setLetter] = useState<string | null>(null);

  const generateLetter = () => {
    // TODO: Call OpenAI API to generate letter based on inputs
    const draft = `Dear Hiring Manager at ${company},\n\nI am excited to apply for the ${jobTitle} position. With my skills and experience, I believe I can contribute greatly to your team.\n\n${jobDescription}\n\nSincerely,\n[Your Name]`;
    setLetter(draft);
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Cover Letter Generator</h1>
      <div className="max-w-3xl bg-white/40 backdrop-blur p-6 rounded-2xl shadow border border-white/30">
        <div className="flex flex-col gap-4">
          <label className="text-sm text-gray-700">Job Title
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/70 text-gray-800 backdrop-blur placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Product Designer"
            />
          </label>
          <label className="text-sm text-gray-700">Company
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/70 text-gray-800 backdrop-blur placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. OpenAI"
            />
          </label>
          <label className="text-sm text-gray-700">Why you’re a good fit
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="mt-1 p-3 w-full rounded-lg bg-white/70 text-gray-800 backdrop-blur placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Highlight your relevant skills, experience, and achievements…"
            />
          </label>
          <button
            onClick={generateLetter}
            className="mt-4 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
          >
            Generate Letter
          </button>
        </div>
        {letter && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-inner whitespace-pre-wrap text-gray-800">
            {letter}
          </div>
        )}
      </div>
    </AppShell>
  );
}