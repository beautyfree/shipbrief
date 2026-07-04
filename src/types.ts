export type ArgValue = string | boolean | string[];

export interface ParsedArgs extends Record<string, ArgValue | string[] | undefined> {
  _: string[];
}

export interface TelegramConfig {
  botTokenEnv: string;
  chatIdEnv: string;
  threadIdEnv?: string;
}

export interface ShipbriefConfig {
  roots: string[];
  exclude: string[];
  maxDepth: number;
  includeNested: boolean;
  outputDir: string;
  send?: boolean;
  telegram: TelegramConfig;
}

export interface Period {
  since: string;
  until: string;
  label: string;
}

export interface CommitInfo {
  hash: string;
  shortHash: string;
  date: string;
  authorName: string;
  authorEmail: string;
  refs: string;
  subject: string;
  body: string;
  notes: string[];
  codex: boolean;
}

export interface ProjectReport {
  name: string;
  path: string;
  commits: CommitInfo[];
}

export interface ShipbriefReport {
  generatedAt: string;
  period: Period;
  roots: string[];
  repoCount: number;
  projectCount: number;
  commitCount: number;
  projects: ProjectReport[];
}
