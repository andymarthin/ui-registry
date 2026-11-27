import type { TemplatePreviewProps } from '../types';
import {
  EditorialPortfolio,
  type EditorialPortfolioProps,
} from './EditorialPortfolio';

const MOCK_PORTFOLIO_DATA: EditorialPortfolioProps = {
  issueLabel: 'Vol. IV · Monograph 12',
  locationLabel: 'Basel & Remote (CET)',
  availabilityLabel: 'Advisory Open · Q3',
  monogram: 'H.L.',
  authorName: 'Henrik Lindqvist',
  authorRole: 'Principal Systems Architect & Essayist',
  thesisStatement:
    'Reliable infrastructure reads like well-edited prose: every abstraction earns its ink or gets cut.',
  bioParagraph:
    'I design deterministic storage engines, Raft-backed metadata planes, and fault-injection harnesses for infrastructure teams. Previously Staff Engineer at Veridian Cloud; author of long-form notes on crash consistency, log compaction, and boring distributed systems.',
  disciplines: [
    'Storage Engines',
    'Raft & Paxos',
    'Deterministic Simulation',
    'Rust / Go',
    'Technical Writing',
  ],
  email: 'henrik@lindqvist-systems.ch',
  links: [
    { label: 'GitHub', href: '#github', meta: '@hlindqvist' },
    { label: 'Monograph Archive', href: '#essays', meta: '24 Essays' },
    { label: 'Curriculum Vitae', href: '#cv', meta: 'PDF · 140KB' },
  ],
  worksHeading: 'Selected Works',
  worksSubheading: 'Systems & Monographs',
  works: [
    {
      id: 'kestrel-kv',
      year: '2025',
      title: 'KestrelKV — Deterministic Raft Metadata Engine',
      role: 'Lead Architect · Core Storage Team',
      category: 'Storage',
      summary:
        'Designed an embedded multi-group Raft metadata store powering multi-tenant cluster scheduling with deterministic simulation testing across 10,000 virtualized network partitions.',
      readingNotes: [
        'Replaced wall-clock timers with monotonic logical ticks so every election timeout and packet reorder reproduces from a 64-bit seed.',
        'Introduced segmented WAL pre-allocation using io_uring, eliminating fsync tail spikes during leader snapshots.',
        'Documented failure-mode invariants in a 28-page internal specification still used for onboarding.',
      ],
      outcome: 'Cut p99 metadata commit latency from 42ms to 4.1ms across 9-node quorums.',
      href: '#kestrel-kv',
      linkLabel: 'Architecture Note',
    },
    {
      id: 'palimpsest-log',
      year: '2024',
      title: 'Palimpsest — Zero-Copy Compaction Pipeline',
      role: 'Principal Systems Consultant',
      category: 'Compaction',
      summary:
        'Re-architected an append-only event log compactor struggling with stop-the-world GC pauses and write amplification on NVMe RAID arrays.',
      readingNotes: [
        'Moved index lookups to immutable mmap-backed roaring bitmaps aligned to 4KB page boundaries.',
        'Bounded background compaction IOPS via token-bucket pacing tied directly to foreground p95 latency.',
      ],
      outcome: 'Reduced write amplification from 6.4x to 1.8x and reclaimed 38% cluster SSD capacity.',
      href: '#palimpsest',
      linkLabel: 'Case Study',
    },
    {
      id: 'clockwork-sim',
      year: '2023',
      title: 'Clockwork — Fault-Injection Test Harness',
      role: 'Creator & Maintainer',
      category: 'Tooling',
      summary:
        'Built an open-source simulation runner in Rust that intercepts socket, disk, and clock syscalls to uncover split-brain bugs before code reaches staging.',
      readingNotes: [
        'Models asymmetric packet loss, partial sector writes, and grey failures (slow disks rather than dead disks).',
        'Shrunk minimal failing schedules automatically via delta debugging in under 90 seconds.',
      ],
      outcome: 'Caught 14 pre-production consensus regressions across three storage teams.',
      href: '#clockwork',
      linkLabel: 'Source & Paper',
    },
    {
      id: 'meridian-gateway',
      year: '2022',
      title: 'Meridian — Programmable Anycast Ingress',
      role: 'Staff Infrastructure Engineer',
      category: 'Networking',
      summary:
        'Led the migration from legacy hardware load balancers to an eBPF XDP packet forwarder with consistent-hash ring draining.',
      readingNotes: [
        'Implemented Maglev-inspired lookup tables updated atomically via BPF map swaps with zero dropped TCP flows.',
        'Authored the operational runbook for graceful PoP evacuation under fiber cuts.',
      ],
      outcome: 'Sustained 1.2M RPS per edge rack at 18% CPU utilization.',
      href: '#meridian',
      linkLabel: 'Postmortem & Notes',
    },
  ],
  essaysHeading: 'Recent Field Notes & Essays',
  essays: [
    {
      date: '2026-02',
      title: 'Why Gray Failures Break Naive Heartbeat Loops',
      readingTime: '11 min read',
      href: '#essay-gray-failures',
    },
    {
      date: '2025-11',
      title: 'Fsync Is Not Enough: Directory Entry Durability on Linux',
      readingTime: '8 min read',
      href: '#essay-fsync',
    },
    {
      date: '2025-07',
      title: 'Designing Invariants Before Writing the State Machine',
      readingTime: '14 min read',
      href: '#essay-invariants',
    },
  ],
  colophonNote:
    'Typeset in Editorial Serif & Monospace · Archival warm cream paper (#F5F2EB).',
};

export default function Preview({ inspect = false }: TemplatePreviewProps) {
  return (
    <div data-inspect-mode={inspect ? 'true' : 'false'}>
      <EditorialPortfolio {...MOCK_PORTFOLIO_DATA} />
    </div>
  );
}
