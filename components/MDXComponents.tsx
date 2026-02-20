import TOCInline from '@shipixen/pliny/ui/TOCInline';
import Pre from '@shipixen/pliny/ui/Pre';
import BlogNewsletterForm from '@shipixen/pliny/ui/BlogNewsletterForm';
import type { MDXComponents } from 'mdx/types';
import Image from './app/Image';
import CustomLink from './app/Link';

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm,
};
