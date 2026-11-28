import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'homelab-ops',
  name: 'Proxmox NOC Terminal',
  category: 'Infrastructure',
  styleTag: 'Phosphor Mono',
  styleFull: 'Phosphor Terminal NOC Mono',
  swatchBg: '#050505',
  swatchAccent: '#22C55E',
  swatchBorder: '#1F2937',
  accentFamily: 'emerald',
  description:
    'Pitch-black monospace Proxmox VE cluster and Alpine LXC NOC terminal with ASCII block telemetry bars, filterable container matrix, and live-style syslog tail.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/homelab-ops',
  defaultInstruction:
    'Implement a Proxmox homelab and infrastructure NOC dashboard using the Phosphor Terminal Mono template. Preserve the #050505 surface, 1px #1F2937 sharp borders, monospace typography, ASCII block bars, and phosphor green/amber/red telemetry semantics while wiring live cluster metrics and LXC container data through component props.',
  customFields: [
    {
      key: 'clusterName',
      label: 'Cluster Name',
      defaultValue: 'PVE-HOMELAB-01',
      placeholder: 'PVE-CLUSTER-01',
    },
    {
      key: 'datacenter',
      label: 'Datacenter / Rack',
      defaultValue: 'RACK-A // 10GbE SFP+',
      placeholder: 'RACK-A // 10GbE SFP+',
    },
    {
      key: 'pveVersion',
      label: 'PVE Version',
      defaultValue: 'pve-manager/8.3.2',
      placeholder: 'pve-manager/8.3.2',
    },
    {
      key: 'uptime',
      label: 'Cluster Uptime',
      defaultValue: '42d 18h 09m',
      placeholder: '42d 18h 09m',
    },
    {
      key: 'operatorTag',
      label: 'Operator Tag',
      defaultValue: 'root@pve-noc',
      placeholder: 'root@pve-noc',
    },
  ],
  design: {
    id: 'phosphor-noc-terminal',
    version: '1.0.0',
    mode: 'dark',
    summary:
      'Pitch-black (#050505) monospace Proxmox NOC terminal with sharp 1px #1F2937 grid framing, ASCII block progress bars, and phosphor green/amber/red telemetry semantics.',
    palette: {
      canvas: '#050505',
      surface: '#080A08',
      surfaceElevated: '#0D110D',
      text: '#F4F4F5',
      textMuted: '#A1A1AA',
      border: '#1F2937',
      accent: '#22C55E',
      accentForeground: '#050505',
      semantic: {
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
    typography: {
      display: 'Monospace (font-mono font-bold uppercase tracking-wider)',
      body: 'Monospace (font-mono text-xs)',
      mono: 'Monospace (font-mono tabular-nums) across 100% of the UI including headers, ASCII bars, tables, and syslog',
      headingScale:
        'Cluster title: text-sm font-bold uppercase tracking-wider; section labels: text-[11px] font-semibold uppercase tracking-wider',
      bodyScale:
        'Base terminal: text-xs; telemetry values: text-sm font-bold; table headers/badges/logs: text-[10px]–text-[11px] tabular-nums',
    },
    geometry: {
      radius:
        '0px sharp terminal edges (rounded-none on panels, buttons, inputs, status dots, and badges)',
      borderStyle:
        '1px crisp dark-slate hairlines (border border-[#1F2937], divide-y divide-[#1F2937])',
      spacing:
        'High-density terminal grid: p-3 sm:p-4 lg:p-6, gap-3, compact px-3 py-2 table cells and p-3 telemetry tiles',
      containerMaxWidth: 'max-w-[1440px]',
    },
    elevation:
      'Flat terminal grid separated by 1px #1F2937 borders and subtle #080A08 vs #050505 contrast; phosphor LED status dot glow (shadow-[0_0_8px_rgba(34,197,94,0.7)])',
    motion:
      'Instant crisp state transitions (transition-colors) for node selection, status tabs, table rows, and syslog LIVE/PAUSED toggle',
    components: [
      'ClusterHeader (top bar with quorum status, alert badge, PVE/kernel metadata, and clickable 3-node filter strip)',
      'NodeTelemetry (4-column KPI strip featuring [||||||....] ASCII block bars and NOMINAL/ELEVATED/CRITICAL badges)',
      'ContainerMatrix (status-tabbed and grep-searchable LXC guest table with ASCII CPU/RAM bars and pct config inspector strip)',
      'SyslogTail (journalctl -f log viewer with ALL/INFO/WARN/ERR level filters and LIVE/PAUSED stream toggle)',
    ],
    doRules: [
      'Keep font-mono and tabular-nums across every panel, metric, badge, input, and log line.',
      'Use #050505 as the base terminal canvas, #080A08 for panel containers, and 1px #1F2937 borders with rounded-none.',
      'Represent utilization metrics with ASCII block bars and strictly map ok/warn/crit to #22C55E / #F59E0B / #EF4444.',
      'Keep row heights and padding compact (px-3 py-2, text-xs / text-[11px]) for NOC information density.',
    ],
    dontRules: [
      'Do not introduce rounded-lg/rounded-xl corners or soft card shadows.',
      'Do not mix serif or proportional sans display fonts into terminal headers or tables.',
      'Do not use light-mode surfaces or decorative gradients.',
      'Do not dilute status semantics with arbitrary blue or violet hues.',
    ],
  },
};
