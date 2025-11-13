export type JobSource = 'TokyoDev' | 'RemoteOK' | 'WeWorkRemotely';

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  link: string;
  source: JobSource;
  publishedAt?: string; // ISO date
  summary?: string;
}
