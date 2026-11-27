import { InspectBox } from '../../components/InspectBox';
import type { TemplatePreviewProps } from '../types';
import {
  GlassPortfolioLayout,
  type GlassPortfolioLayoutProps,
} from './GlassPortfolioLayout';

const MOCK_PORTFOLIO: GlassPortfolioLayoutProps = {
  brandName: 'Soren Vance',
  brandSubtitle: 'Staff Design Engineer',
  brandMonogram: 'SV',
  navItems: [
    { id: 'work', label: 'Work', href: '#work' },
    { id: 'experience', label: 'Experience', href: '#experience' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ],
  navCtaLabel: 'Book Intro',
  navCtaHref: '#contact',
  drawerMeta: [
    { label: 'Location', value: 'San Francisco / Tokyo' },
    { label: 'Focus', value: 'Spatial UI & WebGL' },
    { label: 'Status', value: 'Open for Q2 Advisory' },
  ],
  hero: {
    availabilityText: 'Available for select Q2 advisory & builds',
    eyebrow: 'Design Engineering & Creative Systems',
    headline: 'Crafting tactile, optical software',
    headlineAccent: 'for the spatial web.',
    bio: 'I architect high-frame-rate interactive interfaces, GPU-accelerated design systems, and spatial developer tools that bridge industrial clarity with liquid glass optics.',
    location: 'San Francisco, CA',
    metrics: [
      { label: 'Experience', value: '9+ yrs' },
      { label: 'Shipped', value: '18 apps' },
      { label: 'Render Target', value: '120 Hz' },
    ],
    primaryCta: { label: 'Explore Case Studies', href: '#work' },
    secondaryCta: { label: 'soren@vancelab.io', href: 'mailto:soren@vancelab.io' },
  },
  workSectionTitle: 'Selected Work',
  workSectionSubtitle:
    'Two flagship multi-surface products built from shader prototype to global launch.',
  projects: [
    {
      id: 'project-lumina',
      indexLabel: 'Case 01',
      title: 'Lumina Spatial OS',
      role: 'Lead Design Engineer',
      year: '2026',
      summary:
        'A refractive windowing compositor and node-graph studio for spatial hardware prototypes, maintaining locked 120fps glass blur across 40+ live layers.',
      techTags: ['React 19', 'WebGL2', 'TypeScript', 'GLSL Shaders'],
      links: [
        { label: 'Live Sandbox', href: '#work', variant: 'primary' },
        { label: 'Architecture', href: '#experience', variant: 'secondary' },
      ],
      slides: [
        {
          id: 'lumina-1',
          title: 'Refractive Window Compositor',
          subtitle: 'Multi-depth frosted panels with live specular rim tracking',
          metricLabel: 'Latency',
          metricValue: '4.1ms',
          accentFrom: '#60A5FA',
          accentTo: '#818CF8',
          variant: 'glass-ui',
          badges: ['Compositor', '120fps'],
        },
        {
          id: 'lumina-2',
          title: 'Optical Sphere Shader Field',
          subtitle: 'Real-time fresnel caustics and pointer parallax rig',
          metricLabel: 'Draw Calls',
          metricValue: '14',
          accentFrom: '#38BDF8',
          accentTo: '#C084FC',
          variant: 'shader-orb',
          badges: ['GLSL', 'Fresnel'],
        },
        {
          id: 'lumina-3',
          title: 'Scene Node Patch Graph',
          subtitle: 'Reactive material pipeline for rapid spatial prototyping',
          metricLabel: 'Nodes',
          metricValue: '64 live',
          accentFrom: '#2DD4BF',
          accentTo: '#60A5FA',
          variant: 'node-graph',
          badges: ['Node Pipeline'],
        },
      ],
    },
    {
      id: 'project-aether',
      indexLabel: 'Case 02',
      title: 'Aether Spectral Synth',
      role: 'Founding Product Engineer',
      year: '2025',
      summary:
        'Browser-native polyphonic synthesizer and telemetry console pairing WebAudio DSP worklets with crisp spatial telemetry readouts.',
      techTags: ['WebAudio DSP', 'Canvas 2D', 'Tailwind v4', 'Rust WASM'],
      links: [
        { label: 'Launch Synth', href: '#work', variant: 'primary' },
        { label: 'DSP Notes', href: '#experience', variant: 'secondary' },
      ],
      slides: [
        {
          id: 'aether-1',
          title: 'Real-Time Harmonics Analyzer',
          subtitle: 'Zero-allocation FFT visualizer running on AudioWorklet',
          metricLabel: 'Buffer',
          metricValue: '128 smp',
          accentFrom: '#38BDF8',
          accentTo: '#2DD4BF',
          variant: 'waveform',
          badges: ['AudioWorklet', 'WASM'],
        },
        {
          id: 'aether-2',
          title: 'Spatial Modulation Matrix',
          subtitle: 'Multi-curve envelope routing with tactile snap points',
          metricLabel: 'Voices',
          metricValue: '32 poly',
          accentFrom: '#818CF8',
          accentTo: '#38BDF8',
          variant: 'spatial-grid',
          badges: ['Modulation'],
        },
        {
          id: 'aether-3',
          title: 'Live DSP Telemetry HUD',
          subtitle: 'Sub-millisecond voice scheduler & shader budget monitor',
          metricLabel: 'Jitter',
          metricValue: '<0.3ms',
          accentFrom: '#60A5FA',
          accentTo: '#34D399',
          variant: 'metrics-hud',
          badges: ['Telemetry'],
        },
      ],
    },
  ],
  workHistoryTitle: 'Work History',
  workHistory: [
    {
      id: 'work-1',
      period: '2024 — Present',
      title: 'Staff Design Engineer',
      organization: 'Kestrel Spatial Labs',
      location: 'San Francisco, CA',
      summary:
        'Led the core refractive UI system and 120Hz canvas architecture across web and headset companion apps, cutting shader overhead by 42%.',
      tags: ['Design Systems', 'WebGL2', 'React'],
    },
    {
      id: 'work-2',
      period: '2021 — 2024',
      title: 'Senior Frontend Architect',
      organization: 'Helios Audio Systems',
      location: 'Tokyo / Remote',
      summary:
        'Built browser-based spectral synthesis workstations in TypeScript and Rust WASM used by 140k+ sound designers.',
      tags: ['Rust WASM', 'Canvas', 'AudioWorklet'],
    },
    {
      id: 'work-3',
      period: '2018 — 2021',
      title: 'Product Engineer',
      organization: 'Monolith Cloud',
      location: 'Seattle, WA',
      summary:
        'Designed and shipped real-time observability dashboards and keyboard-first command workflows for distributed teams.',
      tags: ['TypeScript', 'Data Viz', 'Accessibility'],
    },
  ],
  educationTitle: 'Education & Fellowships',
  education: [
    {
      id: 'edu-1',
      period: '2016 — 2018',
      title: 'M.S. in Computer Graphics & HCI',
      organization: 'Carnegie Mellon University',
      location: 'Pittsburgh, PA',
      summary:
        'Thesis on real-time physically inspired glass refraction and sub-pixel typography legibility over translucent surfaces.',
      tags: ['Graphics', 'HCI', 'Optics'],
    },
    {
      id: 'edu-2',
      period: '2012 — 2016',
      title: 'B.S. in Computer Science & Media Arts',
      organization: 'University of Washington',
      location: 'Seattle, WA',
      summary:
        'Graduated Magna Cum Laude with honors capstone in generative audio-visual interfaces and interactive shader tooling.',
      tags: ['Magna Cum Laude', 'Shaders'],
    },
  ],
  capabilities: [
    'Design Systems',
    'HTML5 Canvas & WebGL',
    'Motion & Micro-Interactions',
    'React 19 & TypeScript',
    'Accessibility & Reduced Motion',
  ],
  contactHeadline:
    'Open to founding design engineering roles, advisory retainers, and bespoke interactive builds.',
  contactEmail: 'soren@vancelab.io',
  footerLinks: [
    { label: 'GitHub', href: '#top' },
    { label: 'X / Twitter', href: '#top' },
    { label: 'Read.cv', href: '#top' },
  ],
  copyrightText: '© 2026 Soren Vance — Liquid Glass Portfolio Template',
};

export default function GlassPortfolioPreview({ inspect }: TemplatePreviewProps) {
  return (
    <div
      data-inspect-mode={inspect ? 'true' : 'false'}
      className="min-h-screen bg-[#05060D]"
    >
      <InspectBox label="GlassPortfolioLayout" active={inspect}>
        <GlassPortfolioLayout {...MOCK_PORTFOLIO} />
      </InspectBox>
    </div>
  );
}
