'use client';

import { KBarSearchProvider } from '@shipixen/pliny/search/KBar';
import { useRouter } from 'next/navigation';
import { searchLinks } from '@/data/config/searchLinks';

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <KBarSearchProvider
      kbarConfig={{
        searchDocumentsPath: '/search.json',
        onSearchDocumentsLoad(_json) {
          return [
            ...searchLinks.map((link) => {
              return {
                id: link.id,
                name: link.name,
                keywords: link.keywords,
                section: link.section,
                perform: () => router.push(link.href),
              };
            }),
          ];
        },
      }}
    >
      {children}
    </KBarSearchProvider>
  );
};

export default SearchProvider;
