"use client";

import { useState } from 'react';
import AppShell from '@/components/AppShell';

interface Message {
  id: number;
  role: 'ai' | 'user';
  content: string;
}

/**
 * Interview Buddy simulates an interview by asking questions one at a time.
 * This is a stub that cycles through a fixed set of questions. An AI model
 * could be integrated later to generate questions based on the resume and
 * evaluate answers.
 */
export default function InterviewBuddy() {
  const questions = [
    'Tell me about yourself.',
    'What is your greatest strength?',
    'Why are you interested in this role?',
  ];
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'ai', content: questions[0] },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: 'user', content: input.trim() },
    ]);
    setInput('');
    // Add next question if exists
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < questions.length) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: prev.length, role: 'ai', content: questions[nextIdx] },
        ]);
      }, 500);
      setCurrentQuestionIndex(nextIdx);
    } else {
      // End of interview
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: prev.length, role: 'ai', content: 'Thank you for your answers. We will get back to you!' },
        ]);
      }, 500);
    }
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Interview Buddy</h1>
      <div className="flex flex-col max-w-3xl w-full bg-white/40 backdrop-blur p-6 rounded-2xl shadow border border-white/30">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4" style={{ maxHeight: '50vh' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${msg.role === 'ai' ? 'bg-indigo-100 text-gray-800 self-start' : 'bg-white text-gray-800 self-end'}`}
              style={{ alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end' }}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer…"
            className="flex-1 p-3 rounded-lg bg-white/70 backdrop-blur text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
          >
            Send
          </button>
        </form>
      </div>
    </AppShell>
  );
}