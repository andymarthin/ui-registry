import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'dev-portfolio',
  name: 'Editorial Paper Portfolio',
  category: 'Portfolio',
  styleTag: 'Editorial Paper',
  styleFull: 'Warm Editorial Paper & Serif',
  swatchBg: '#F5F2EB',
  swatchAccent: '#9A3412',
  swatchBorder: '#D6D0C4',
  description:
    'Warm archival #F5F2EB editorial portfolio pairing refined serif display typography with #1C1917 charcoal ink, #9A3412 terracotta markers, an asymmetric bio column, and a hairline-divided Selected Works index with expandable reading notes.',
  dependencies: ['lucide-react'],
  targetDir: 'src/components/dev-portfolio',
  defaultInstruction:
    'Preserve the #F5F2EB cream paper surface, #1C1917 ink, #D6D0C4 hairline dividers, #9A3412 terracotta accents, and font-serif headings. Populate author bio, disciplines, and expandable works via EditorialPortfolioProps.',
};
