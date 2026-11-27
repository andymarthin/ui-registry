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
  description:
    'Pitch-black monospace Proxmox VE cluster and Alpine LXC NOC terminal with ASCII block telemetry bars, filterable container matrix, and live-style syslog tail.',
  dependencies: ['lucide-react'],
  targetDir: 'src/components/homelab-ops',
  defaultInstruction:
    'Implement a Proxmox homelab and infrastructure NOC dashboard using the Phosphor Terminal Mono template. Preserve the #050505 surface, 1px #1F2937 sharp borders, monospace typography, ASCII block bars, and phosphor green/amber/red telemetry semantics while wiring live cluster metrics and LXC container data through component props.',
};
