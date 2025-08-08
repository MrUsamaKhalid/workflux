"use client";

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/utils/supabaseClient';

/**
 * Page for building or enhancing a resume. The process is divided into
 * three steps: collecting input, choosing a template, and reviewing
 * the generated resume. For now, AI functions are stubbed; they can
 * be integrated later via API routes.
 */
export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const templates = [
    { id: 1, name: 'Classic', preview: '/template1.png' },
    { id: 2, name: 'Modern', preview: '/template2.png' },
    { id: 3, name: 'Creative', preview: '/template3.png' },
  ];

  // Handler to move to next step after saving input
  const handleSubmitInput = async () => {
    // TODO: Call AI API to parse and enhance resumeText
    // For now, just go to next step
    setStep(2);
  };
  const handleGenerateResume = async () => {
    // TODO: Generate resume HTML from selected template and AI-enhanced data
    // Here we'll create a simple stub preview
    setGeneratedHtml(
      `<div style="padding:2rem;font-family:Arial">
        <h1 style="font-size:32px">Your Name</h1>
        <h2 style="font-size:20px;color:gray">Job Title</h2>
        <p>${resumeText.substring(0, 200)}...</p>
      </div>`
    );
    setStep(3);
  };
  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Resume Builder</h1>
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
              step === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white/30 text-gray-700 border border-white/50'
            }`}
          >
            {s}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="bg-white/40 backdrop-blur-lg p-6 rounded-2xl border border-white/30 shadow max-w-3xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Step 1: Provide your information</h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content or work history here…"
            rows={8}
            className="w-full p-4 rounded-lg bg-white/70 text-gray-800 placeholder-gray-500 backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSubmitInput}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
            >
              Next: Choose Template
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="max-w-5xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Step 2: Choose a template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`border rounded-xl p-4 cursor-pointer backdrop-blur-lg bg-white/40 transition-colors hover:border-indigo-500 ${
                  selectedTemplate === tpl.id ? 'border-indigo-600' : 'border-white/30'
                }`}
                onClick={() => setSelectedTemplate(tpl.id)}
              >
                <div className="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400 text-sm">
                  Template {tpl.id} Preview
                </div>
                <h3 className="text-lg font-medium text-gray-900">{tpl.name}</h3>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-full bg-white/70 text-gray-800 border border-gray-300 hover:bg-white/80"
            >
              Back
            </button>
            <button
              onClick={handleGenerateResume}
              disabled={selectedTemplate === null}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow disabled:opacity-50"
            >
              Generate Resume
            </button>
          </div>
        </div>
      )}
      {step === 3 && generatedHtml && (
        <div className="max-w-5xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Step 3: Review & export</h2>
          <div className="bg-white rounded-xl p-6 shadow-md overflow-auto max-h-[600px]">
            {/* dangerouslySetInnerHTML used for demo; sanitize in production */}
            <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-full bg-white/70 text-gray-800 border border-gray-300 hover:bg-white/80"
            >
              Back
            </button>
            <button
              onClick={async () => {
                // Save resume to Supabase or trigger PDF generation
                const { data, error } = await supabase
                  .from('resumes')
                  .insert({ content: resumeText, template: selectedTemplate });
                if (error) {
                  alert(error.message);
                } else {
                  alert('Resume saved!');
                }
              }}
              className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow"
            >
              Save Resume
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}