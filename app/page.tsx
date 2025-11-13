'use client';

import { FormEvent, useState } from 'react';
import { Search, Globe, ExternalLink } from 'lucide-react';
import { JobItem } from '@/types/job';

type Region = 'japan' | 'global';

function cls(...arr: (string | false | undefined)[]) {
  return arr.filter(Boolean).join(' ');
}

export default function Home() {
  const [query, setQuery] = useState('react developer');
  const [region, setRegion] = useState<Region>('japan');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entryOnly, setEntryOnly] = useState(false);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        q: query,
        region,
      });
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch jobs');
      } else {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
      setError('Network error while fetching jobs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        {/* Hero */}
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Job Search Aggregator
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Search software jobs from multiple sources (TokyoDev, RemoteOK,
            WeWorkRemotely) in one place. No login, no tracking, just links to real
            listings.
          </p>
        </header>

        {/* Search form */}
        <section className="rounded-2xl border bg-white p-4 md:p-5 space-y-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3 md:items-center"
          >
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 flex-1">
              <Search size={16} />
              <input
                className="w-full outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. react, frontend, data, tokyo"
              />
            </div>

            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span className="text-sm text-slate-600">Region:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRegion('japan')}
                  className={cls(
                    'rounded-xl px-3 py-1.5 border text-sm',
                    region === 'japan' ? 'bg-black text-white' : 'bg-white'
                  )}
                >
                  Japan-focused
                </button>
                <button
                  type="button"
                  onClick={() => setRegion('global')}
                  className={cls(
                    'rounded-xl px-3 py-1.5 border text-sm',
                    region === 'global' ? 'bg-black text-white' : 'bg-white'
                  )}
                >
                  Global
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Searching…' : 'Search jobs'}
            </button>
          </form>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={entryOnly}
              onChange={(e) => setEntryOnly(e.target.checked)}
            />
            <span className="text-sm">Entry-level only</span>
          </div>

          <p className="text-xs text-slate-500">
            Data is fetched live from public RSS feeds. Always verify details on the
            original job page.
          </p>
        </section>

        {/* Results */}
        <section className="space-y-3">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <p className="text-slate-500 text-sm">
              No results yet. Try searching for &quot;frontend&quot;, &quot;react&quot;,
              or &quot;engineer&quot;, then click &quot;Search jobs&quot;.
            </p>
          )}

          {loading && <p className="text-slate-500 text-sm">Loading job listings…</p>}

          <div className="space-y-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border bg-white p-4 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold">{job.title}</h2>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                    {job.source}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {job.company}
                  {job.location ? ` · ${job.location}` : ''}
                </p>
                {job.publishedAt && (
                  <p className="text-xs text-slate-400">
                    {new Date(job.publishedAt).toLocaleDateString()}
                  </p>
                )}
                {job.summary && (
                  <p className="text-sm text-slate-700 mt-1 line-clamp-3">
                    {job.summary}
                  </p>
                )}
                <div className="mt-2">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    View job <ExternalLink size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="text-xs text-slate-500 text-center py-4">
          This is an unofficial aggregator. Always apply via the original job page.
        </footer>
      </div>
    </main>
  );
}
