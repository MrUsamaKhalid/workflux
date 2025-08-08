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

  // Handler to move to next step after saving input. In the future this could
  // call an API endpoint to preprocess and extract key details from the raw
  // resume text. For now we simply advance to template selection.
  const handleSubmitInput = async () => {
    setStep(2);
  };

  // Handler to generate the resume using the selected template and AI. This
  // calls the server-side API route /api/generateResume, passing the raw
  // resume text. The API returns a rewritten resume which we wrap in a
  // simple HTML structure for preview. Errors are surfaced via alert.
  const handleGenerateResume = async () => {
    if (!selectedTemplate) return;
    try {
      const response = await fetch('/api/generateResume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: resumeText }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate resume');
      }
      const content = json.result || '';
      // Basic HTML wrapper; in a real application you could apply the
      // selectedTemplate design here.
      setGeneratedHtml(
        `<div style="padding:2rem;font-family:Arial;color:#f5f5f5;background-color:#12073b;">
          ${content.replace(/\n/g, '<br/>')}
        </div>`
      );
      setStep(3);
    } catch (err: any) {
      alert(err.message);
    }
  };
  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-white">Resume Builder</h1>
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
              step === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-purple-300 border border-white/30'
            }`}
          >
            {s}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow max-w-3xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Step 1: Provide your information</h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content or work history here…"
            rows={8}
            className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-400 backdrop-blur focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSubmitInput}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 text-white font-medium shadow"
            >
              Next: Choose Template
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="max-w-5xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Step 2: Choose a template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`border rounded-xl p-4 cursor-pointer backdrop-blur-lg bg-white/10 transition-colors hover:border-pink-500 ${
                  selectedTemplate === tpl.id ? 'border-pink-600' : 'border-white/20'
                }`}
                onClick={() => setSelectedTemplate(tpl.id)}
              >
                <div className="h-40 bg-white/20 rounded mb-3 flex items-center justify-center text-purple-400 text-sm">
                  Template {tpl.id} Preview
                </div>
                <h3 className="text-lg font-medium text-white">{tpl.name}</h3>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-full border border-white/30 text-purple-200 hover:bg-white/10"
            >
              Back
            </button>
            <button
              onClick={handleGenerateResume}
              disabled={selectedTemplate === null}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium shadow disabled:opacity-50 hover:brightness-110"
            >
              Generate Resume
            </button>
          </div>
        </div>
      )}
      {step === 3 && generatedHtml && (
        <div className="max-w-5xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Step 3: Review & export</h2>
          <div className="bg-white/10 rounded-xl p-6 shadow-md overflow-auto max-h-[600px]">
            {/* dangerouslySetInnerHTML used for demo; sanitize in production */}
            <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-full border border-white/30 text-purple-200 hover:bg-white/10"
            >
              Back
            </button>
            <button
              onClick={async () => {
                // Save resume to Supabase
                const { error } = await supabase
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