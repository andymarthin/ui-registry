import type { TemplatePreviewProps } from '../types';
import { SwissLanding, type SwissLandingProps } from './SwissLanding';

const MOCK_SAAS_DATA: SwissLandingProps = {
  brandName: 'KINETIC // EDGE',
  brandCode: 'KE',
  releaseBadge: 'V4.2 ENGINE',
  navItems: [
    { label: 'Runtime', href: '#architecture' },
    { label: 'Benchmarks', href: '#architecture' },
    { label: 'Regions', href: '#architecture' },
    { label: 'Docs', href: '#deploy' },
  ],
  navCtaLabel: 'Deploy Cluster',
  heroKicker: '00 // Deterministic Edge Compute',
  headlineLine1: 'ZERO COLD STARTS.',
  headlineLine2: 'SUB-8MS ROUTING.',
  headlineLine3: 'GLOBAL BY DEFAULT.',
  subheadline:
    'Compile TypeScript and Rust isolates directly to 42 bare-metal PoPs. No container orchestration tax, no regional failover scripts, and deterministic p99 latency under load.',
  primaryCtaLabel: 'Start Free Deployment',
  secondaryCtaLabel: 'Read Architecture Spec',
  cliPromptLabel: 'Instant CLI Bootstrap',
  cliCommand: 'npx kinetic-edge@latest deploy --all-regions',
  cliHint: 'Deploys signed WebAssembly isolates across 42 PoPs in < 3.4s.',
  stats: [
    {
      index: 'STAT / 01',
      value: '6.8ms',
      label: 'Global P99 Latency',
      detail: 'Anycast BGP routing across 42 tier-1 colocation PoPs.',
    },
    {
      index: 'STAT / 02',
      value: '0.4ms',
      label: 'Isolate Cold Boot',
      detail: 'Pre-warmed V8 & Wasmtime snapshots per request.',
    },
    {
      index: 'STAT / 03',
      value: '420K',
      label: 'Req / Sec / Node',
      detail: 'Zero-copy kernel bypass packet pipeline on NVMe hosts.',
    },
    {
      index: 'STAT / 04',
      value: '99.99%',
      label: 'Uptime Guarantee',
      detail: 'Automatic BGP drain with sub-second health eviction.',
    },
  ],
  featuresHeading: 'Built For Predictable Throughput',
  featuresSubheading: 'Three primitives replacing multi-region Kubernetes sprawl',
  features: [
    {
      number: '01',
      tag: 'ISOLATES',
      title: 'Snapshot Boot Runtime',
      description:
        'Memory snapshots restore pre-initialized dependency graphs in 400 microseconds, eliminating container pull delays and cold-start tail spikes.',
      metric: '0.4MS BOOT',
    },
    {
      number: '02',
      tag: 'REPLICATION',
      title: 'Edge SQLite Mesh',
      description:
        'Read-local replicas sit on the same NVMe slice as your worker isolate with Raft-backed write forwarding and deterministic read-your-writes tokens.',
      metric: 'RAFT SYNC',
    },
    {
      number: '03',
      tag: 'TELEMETRY',
      title: 'Zero-Overhead Tracing',
      description:
        'Structured eBPF traces stream out-of-band over WireGuard without blocking the request path, retaining 100% of error spans for 30 days.',
      metric: 'EBPF TRACE',
    },
  ],
  footerLeft: '© 2026 Kinetic Edge Systems AG · Zurich / San Francisco',
  footerRight: 'STATUS: ALL 42 POPS OPERATIONAL',
};

export default function Preview({ inspect = false }: TemplatePreviewProps) {
  return (
    <div data-inspect-mode={inspect ? 'true' : 'false'}>
      <SwissLanding {...MOCK_SAAS_DATA} />
    </div>
  );
}
