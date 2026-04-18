// @ts-ignore
import { AnalyticsConfig } from '@shipixen/pliny/analytics';
// @ts-ignore
import { CommentsConfig } from '@shipixen/pliny/comments';
// @ts-ignore
import { NewsletterConfig } from '@shipixen/pliny/newsletter';
// @ts-ignore
import { SearchConfig } from '@shipixen/pliny/search';

export interface SiteMetadata {
  title: string;
  description: string;
  domain: string;
  logoTitle: string;
  socialBanner: string;
  supportEmail: string;

  email: string;
  twitter: string;
  instagram: string;
  tiktok: string;
  github: string;
  linkedin: string;
  youtube: string;
  facebook: string;
  threads: string;
  mastodon: string;

  language: string;
  theme: 'system' | 'dark' | 'light';
  locale: string;
}

export interface SiteConfig extends SiteMetadata {
  allArticlesPath: string;
  disableAnalytics: boolean;
  analytics?: AnalyticsConfig | undefined;
  comments?: CommentsConfig | undefined;
  newsletter?: NewsletterConfig | undefined;
  search?: SearchConfig | undefined;
}
