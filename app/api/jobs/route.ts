import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { JobItem } from '@/types/job';

export const runtime = 'nodejs';

const parser = new Parser();

// RSS feed URLs
const FEEDS = {
  RemoteOK: 'https://remoteok.com/remote-jobs.rss',
  WeWorkRemotely: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
} as const;

type SourceKey = keyof typeof FEEDS;

function normalizeItem(
  item: Parser.Item,
  source: SourceKey,
  query?: string
): JobItem | null {
  const title = item.title || '';
  const link = item.link || '';
  if (!title || !link) return null;

  const lowerQ = query?.toLowerCase() || '';

  if (lowerQ) {
    const text = (title + ' ' + (item.contentSnippet || '')).toLowerCase();
    if (!text.includes(lowerQ)) return null;
  }

  let company = '';
  const location = '';

  if (!company && item.creator) {
    company = item.creator;
  }

  const job: JobItem = {
    id: `${source}-${item.guid || item.link}`,
    title,
    company: company || '(Unknown company)',
    location,
    link,
    source,
    publishedAt: item.isoDate,
    summary: item.contentSnippet,
  };

  return job;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const region = searchParams.get('region') || 'global';

  const sources: SourceKey[] = ['RemoteOK', 'WeWorkRemotely'];

  try {
    const jobs: JobItem[] = [];

    await Promise.all(
      sources.map(async (source) => {
        const url = FEEDS[source];
        try {
          const feed = await parser.parseURL(url);
          feed.items.forEach((item) => {
            const job = normalizeItem(item, source, query);
            if (job) jobs.push(job);
          });
        } catch (e) {
          console.error(`Error fetching ${source} feed`, e);
        }
      })
    );

    jobs.sort((a, b) => {
      const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return db - da;
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('API /api/jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
