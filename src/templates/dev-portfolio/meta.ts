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
  design: {
    id: 'editorial-paper-serif',
    version: '1.0.0',
    mode: 'light',
    summary:
      'Warm archival paper (#F5F2EB) portfolio pairing refined serif display headings and pull quotes with charcoal ink (#1C1917), terracotta accents (#9A3412), and hairline dividers (#D6D0C4).',
    palette: {
      canvas: '#F5F2EB',
      surface: '#F5F2EB',
      surfaceElevated: '#EFECE3',
      text: '#1C1917',
      textMuted: '#57534E',
      border: '#D6D0C4',
      accent: '#9A3412',
      accentForeground: '#F5F2EB',
      semantic: {
        info: '#9A3412',
      },
    },
    typography: {
      display: 'Editorial Serif (font-serif font-normal tracking-[-0.02em])',
      body: 'System Sans (font-sans leading-[1.7] text-[#44403C])',
      mono: 'Monospace (font-mono text-[10px]–[11px] uppercase tracking-[0.12em]–[0.16em]) for issue labels, years, category tags, and metadata',
      headingScale:
        'h1: font-serif text-2xl sm:text-3xl font-normal tracking-[-0.02em]; blockquote: font-serif text-xl sm:text-2xl leading-[1.35]; h2: font-serif text-2xl sm:text-[28px]; h3: font-serif text-lg sm:text-xl',
      bodyScale:
        'Bio/summary: text-sm to text-[15px] leading-[1.7]; notes: text-xs leading-relaxed; colophon/meta: text-[10px]–text-xs',
    },
    geometry: {
      radius:
        'Sharp 0px rectangular boxes and hairline dividers; circular dot accents only (rounded-full on 4px–6px indicator dots)',
      borderStyle:
        '1px archival hairline rules (border-[#D6D0C4], divide-[#D6D0C4]) and 2px terracotta left quote rule (border-l-2 border-[#9A3412])',
      spacing:
        'Airy print-spread rhythm: px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10; 12-column split (lg:col-span-5 bio / lg:col-span-7 works) with gap-12 lg:gap-14',
      containerMaxWidth: 'max-w-[1180px]',
    },
    elevation:
      'Completely flat print-like layering using warm tint shifts (#EFECE3 over #F5F2EB) and 1px hairline borders; zero box shadows or blur',
    motion:
      'Minimal micro-interactions: ChevronDown 180° accordion rotation (duration-200), subtle arrow nudge on link hover, and soft row tint (hover:bg-[#EFECE3]/50)',
    components: [
      'ColophonHeader (single-line archival issue, location, and availability bar separated by border-[#D6D0C4])',
      'BioColumn (left 5-column spread with framed monogram seal, serif thesis blockquote, discipline tags, and copyable correspondence links)',
      'SelectedWorks (indexed 01–N accordion work rows expanding into reading notes & verified outcome panels)',
      'EssaysIndex (hairline-divided monograph list with dates and reading time)',
      'ColophonFooter (italic serif colophon paired with monospace archive stamp)',
    ],
    doRules: [
      'Use #F5F2EB as the primary paper canvas and #EFECE3 at full or partial opacity for subtle inset surfaces.',
      'Set display titles, pull quotes, work titles, and essay titles in font-serif with normal weight and tight negative tracking.',
      'Use #D6D0C4 1px hairlines to separate columns, list items, and sections instead of shadowed cards.',
      'Apply #9A3412 terracotta sparingly for indices, left quote rules, active icons, and underlined text links.',
    ],
    dontRules: [
      'Do not add drop shadows, frosted glass blur, or dark-mode panels.',
      'Do not use rounded pill cards or heavy 2px+ brutalist borders.',
      'Do not replace serif headings with heavy uppercase geometric sans.',
      'Do not introduce bright neon or cool blue/purple accents.',
    ],
  },
};
