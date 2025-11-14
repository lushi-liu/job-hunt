export type JobSource =
  | 'RemoteOK'
  | 'WeWorkRemotely'
  | 'Remotive'
  | 'WorkingNomads'
  | 'JSRemotely';

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
