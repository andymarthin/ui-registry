import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'glass-portfolio',
  name: 'Liquid Glass Portfolio',
  category: 'Portfolio',
  styleTag: 'Liquid Glass',
  styleFull: 'Liquid Glass + Refractive Spheres',
  swatchBg: '#05060D',
  swatchAccent: '#60A5FA',
  swatchBorder: '#1E293B',
  accentFamily: 'sky',
  description:
    'A cosmic midnight personal portfolio featuring an animated HTML5 refractive glass spheres canvas, sticky frosted-glass pill navigation with an expandable drawer, multi-slide interactive project gallery cards, and a two-column work history & education timeline.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/glass-portfolio',
  defaultInstruction:
    'Wire your personal bio, metrics, multi-slide project showcases, work history, education, and social links into GlassPortfolioLayout via props without altering the refractive glass surfaces or cosmic midnight palette.',
  customFields: [
    {
      key: 'brandName',
      label: 'Name / Brand',
      defaultValue: 'Soren Vance',
      placeholder: 'Your name or studio',
    },
    {
      key: 'brandSubtitle',
      label: 'Role / Title',
      defaultValue: 'Staff Design Engineer',
      placeholder: 'Your role or discipline',
    },
    {
      key: 'headline',
      label: 'Hero Headline',
      defaultValue: 'Crafting tactile, optical software',
      placeholder: 'Main hero headline',
    },
    {
      key: 'bio',
      label: 'Hero Bio',
      defaultValue:
        'I architect high-frame-rate interactive interfaces, GPU-accelerated design systems, and spatial developer tools that bridge industrial clarity with liquid glass optics.',
      placeholder: 'Short bio statement',
      multiline: true,
    },
    {
      key: 'contactEmail',
      label: 'Contact Email',
      defaultValue: 'soren@vancelab.io',
      placeholder: 'you@domain.com',
    },
  ],
  design: {
    id: 'liquid-glass-midnight',
    version: '1.0.0',
    mode: 'dark',
    summary:
      'Cosmic midnight canvas (#05060D) layered with an animated HTML5 refractive glass spheres backdrop and frosted translucent panels with specular top-edge highlights.',
    palette: {
      canvas: '#05060D',
      surface: 'rgba(255, 255, 255, 0.04)',
      surfaceElevated: 'rgba(11, 16, 32, 0.80)',
      text: '#F1F5F9',
      textMuted: '#94A3B8',
      border: 'rgba(255, 255, 255, 0.14)',
      accent: '#60A5FA',
      accentForeground: '#EFF6FF',
      semantic: {
        success: '#34D399',
        info: '#818CF8',
      },
    },
    typography: {
      display: 'System Sans (font-sans, font-semibold tracking-tight)',
      body: 'System Sans (font-sans, leading-relaxed)',
      mono: 'Monospace (font-mono) for index labels, dates, slide counters, and HUD metrics',
      headingScale:
        'h1: text-3xl sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08] font-semibold tracking-tight; h2: text-2xl sm:text-3xl; h3: text-xl sm:text-2xl',
      bodyScale:
        'Body: text-sm sm:text-base; meta/labels: text-xs; eyebrows/pills: text-[10px]–text-[11px] uppercase tracking-[0.18em]–[0.2em]',
    },
    geometry: {
      radius:
        'Hero: rounded-[2rem]; Cards/Drawer: rounded-3xl; Sub-panels/Media: rounded-2xl; Pills/Nav/CTAs: rounded-full',
      borderStyle:
        '1px translucent hairline borders (border-white/[0.14] to border-white/[0.16], accent border-blue-300/35)',
      spacing:
        'Main px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-24; section gap mt-12 sm:mt-16; grid gap-6; card p-4 sm:p-6 (hero p-5 sm:p-10)',
      containerMaxWidth: 'max-w-5xl (1024px)',
    },
    elevation:
      'Heavy backdrop blur (backdrop-blur-2xl / backdrop-blur-md) paired with 1px top specular inset rims (inset 0 1px 0 rgba(255,255,255,0.18..0.24)) and deep cosmic drop shadows (0 24px 64px rgba(2,6,23,0.65) to 0 28px 80px rgba(2,6,23,0.7))',
    motion:
      'HTML5 Canvas 2D continuous sphere drift + pointer parallax (respects prefers-reduced-motion); availability animate-ping dot; transition-colors / transition-all duration-200–300 on nav pills, slide dots, and borders',
    components: [
      'GlassSpheresCanvas (full-bleed animated refractive orb backdrop with pointer parallax)',
      'FloatingGlassNav (sticky rounded-full pill header with expandable glass quick-nav drawer)',
      'HeroGlassCard (rounded-[2rem] hero with pulsing availability badge, gradient accent headline, dual CTAs, and 3-column metrics strip)',
      'ProjectGalleryCard (2-column cards with interactive multi-slide artwork switcher, counter pill, and dot tabs)',
      'ExperienceEducationTimeline (2-column vertical timeline with glowing node markers and capability chips)',
      'PortfolioFooter (compact glass contact card with mailto pill and external link chips)',
    ],
    doRules: [
      'Keep the #05060D cosmic midnight canvas and layer panels with bg-white/[0.04..0.06] + backdrop-blur-2xl.',
      'Pair translucent white borders (border-white/[0.14..0.16]) with top-edge inset specular highlights.',
      'Use rounded-full for nav bars, interactive pills, badges, and buttons, and rounded-3xl / rounded-2xl for cards and inner frames.',
      'Reserve font-mono at 10px–11px for slide counters, project indices, timeline periods, and technical HUD readouts.',
    ],
    dontRules: [
      'Do not use opaque light surfaces or solid slate fills that block the refractive spheres canvas.',
      'Do not mix sharp 0px corners onto cards, pills, or buttons.',
      'Do not drop backdrop-blur or replace translucent hairlines with heavy solid borders.',
      'Do not add high-saturation neon backgrounds that compete with the #60A5FA blue/indigo optical glow.',
    ],
  },
};
