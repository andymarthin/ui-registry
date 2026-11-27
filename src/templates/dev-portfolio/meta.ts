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
  accentFamily: 'amber',
  description:
    'Warm archival #F5F2EB editorial portfolio pairing refined serif display typography with #1C1917 charcoal ink, #9A3412 terracotta markers, an asymmetric bio column, and a hairline-divided Selected Works index with expandable reading notes.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/dev-portfolio',
  defaultInstruction:
    'Preserve the #F5F2EB cream paper surface, #1C1917 ink, #D6D0C4 hairline dividers, #9A3412 terracotta accents, and font-serif headings. Populate author bio, disciplines, and expandable works via EditorialPortfolioProps.',
  customFields: [
    {
      key: 'authorName',
      label: 'Author Name',
      defaultValue: 'Henrik Lindqvist',
      placeholder: 'Your full name',
    },
    {
      key: 'authorRole',
      label: 'Role / Discipline',
      defaultValue: 'Principal Systems Architect & Essayist',
      placeholder: 'Your role or title',
    },
    {
      key: 'thesisStatement',
      label: 'Thesis Statement',
      defaultValue:
        'Reliable infrastructure reads like well-edited prose: every abstraction earns its ink or gets cut.',
      placeholder: 'Editorial pull quote',
      multiline: true,
    },
    {
      key: 'availabilityLabel',
      label: 'Availability',
      defaultValue: 'Advisory Open · Q3',
      placeholder: 'Availability status',
    },
    {
      key: 'email',
      label: 'Email',
      defaultValue: 'henrik@lindqvist-systems.ch',
      placeholder: 'you@domain.com',
    },
  ],
};
