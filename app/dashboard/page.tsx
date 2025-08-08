"use client";

import AppShell from '@/components/AppShell';
import { AiOutlineFileText, AiOutlineRobot, AiOutlineSearch } from 'react-icons/ai';

/**
 * Dashboard page shows quick links to core features. This page
 * is protected via AppShell, which checks the user session and shows
 * a loading indicator or redirects to /signin as needed.
 */
export default function Dashboard() {
  const cards = [
    {
      title: 'Build Resume',
      description: 'Create or import your resume and enhance it with AI.',
      href: '/resume',
      icon: <AiOutlineFileText className="text-3xl" />,
    },
    {
      title: 'Cover Letter',
      description: 'Generate a tailored cover letter for each position.',
      href: '/cover-letter',
      icon: <AiOutlineRobot className="text-3xl" />,
    },
    {
      title: 'Job Tracker',
      description: 'Discover and apply to jobs automatically across platforms.',
      href: '/job-tracker',
      icon: <AiOutlineSearch className="text-3xl" />,
    },
  ];
  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="text-indigo-600">{card.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-700">{card.description}</p>
          </a>
        ))}
      </div>
    </AppShell>
  );
}