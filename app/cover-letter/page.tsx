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

  const generateLetter = async () => {
    // Call our API route to generate the cover letter using OpenAI
    try {
      const response = await fetch('/api/generateCoverLetter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          company,
          details: jobDescription,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate cover letter');
      }
      setLetter(json.result || '');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-white">Cover Letter Generator</h1>
      <div className="max-w-3xl bg-white/10 backdrop-blur p-6 rounded-2xl shadow border border-white/20">
        <div className="flex flex-col gap-4">
          <label className="text-sm text-purple-200">Job Title
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/20 text-white backdrop-blur placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g. Product Designer"
            />
          </label>
          <label className="text-sm text-purple-200">Company
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/20 text-white backdrop-blur placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g. OpenAI"
            />
          </label>
          <label className="text-sm text-purple-200">Why you’re a good fit
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="mt-1 p-3 w-full rounded-lg bg-white/20 text-white backdrop-blur placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Highlight your relevant skills, experience, and achievements…"
            />
          </label>
          <button
            onClick={generateLetter}
            className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium shadow hover:brightness-110"
          >
            Generate Letter
          </button>
        </div>
        {letter && (
          <div className="mt-6 p-4 bg-white/10 rounded-xl shadow-inner whitespace-pre-wrap text-white">
            {letter}
          </div>
        )}
      </div>
    </AppShell>
  );
}