import type { TemplatePreviewProps } from '../types';
import {
  ProxmoxNocTerminal,
  type ClusterNode,
  type LxcContainer,
  type SyslogEntry,
  type TelemetryGauge,
} from './ProxmoxNocTerminal';

const MOCK_NODES: ClusterNode[] = [
  {
    id: 'pve-01',
    name: 'pve-01',
    ip: '10.10.10.11',
    status: 'online',
    uptime: '42d 18h',
    loadAvg: '1.14 1.08 0.96',
    cpuTempC: 54,
  },
  {
    id: 'pve-02',
    name: 'pve-02',
    ip: '10.10.10.12',
    status: 'online',
    uptime: '42d 18h',
    loadAvg: '0.82 0.79 0.71',
    cpuTempC: 49,
  },
  {
    id: 'pve-03',
    name: 'pve-03',
    ip: '10.10.10.13',
    status: 'degraded',
    uptime: '06d 04h',
    loadAvg: '3.91 3.42 2.88',
    cpuTempC: 73,
  },
];

const MOCK_TELEMETRY: TelemetryGauge[] = [
  {
    id: 'cpu',
    label: 'CLUSTER CPU',
    detail: '24c / 48t EPYC 4464P · 3.7 GHz',
    percent: 44,
    usedLabel: '10.6c',
    totalLabel: '24.0c',
    severity: 'ok',
  },
  {
    id: 'ram',
    label: 'ECC MEMORY',
    detail: 'DDR5-4800 ECC · KSM 3.2G saved',
    percent: 62,
    usedLabel: '79.4G',
    totalLabel: '128G',
    severity: 'ok',
  },
  {
    id: 'zfs',
    label: 'ZFS RPOOL',
    detail: 'raidz1-0 · scrub clean 0 errors',
    percent: 78,
    usedLabel: '6.24T',
    totalLabel: '8.00T',
    severity: 'warn',
  },
  {
    id: 'nvme',
    label: 'NVME VMSTORE',
    detail: 'Gen4 mirror · 412 MB/s · 0.3ms lat',
    percent: 38,
    usedLabel: '728G',
    totalLabel: '1.92T',
    severity: 'ok',
  },
];

const MOCK_CONTAINERS: LxcContainer[] = [
  {
    vmid: 101,
    hostname: 'ui-hub',
    node: 'pve-01',
    os: 'alpine-3.20',
    status: 'running',
    ip: '10.10.20.11',
    cpuPercent: 12,
    memUsedMb: 192,
    memTotalMb: 512,
    uptime: '19d 04h',
    ports: '80/tcp, 443/tcp',
    notes: 'Astro static build & nginx /r/*.md registry mirror',
  },
  {
    vmid: 102,
    hostname: 'traefik',
    node: 'pve-01',
    os: 'alpine-3.20',
    status: 'running',
    ip: '10.10.20.2',
    cpuPercent: 18,
    memUsedMb: 280,
    memTotalMb: 512,
    uptime: '42d 18h',
    ports: '80/tcp, 443/tcp, 8080/tcp',
    notes: 'Edge ingress router · Let’s Encrypt DNS-01 Cloudflare',
  },
  {
    vmid: 103,
    hostname: 'postgres',
    node: 'pve-02',
    os: 'alpine-3.20',
    status: 'running',
    ip: '10.10.20.21',
    cpuPercent: 31,
    memUsedMb: 2640,
    memTotalMb: 4096,
    uptime: '42d 17h',
    ports: '5432/tcp',
    notes: 'PostgreSQL 16.4 · WAL archiving to ZFS dataset tank/pg-wal',
  },
  {
    vmid: 104,
    hostname: 'grafana',
    node: 'pve-03',
    os: 'alpine-3.20',
    status: 'warning',
    ip: '10.10.20.30',
    cpuPercent: 72,
    memUsedMb: 1790,
    memTotalMb: 2048,
    uptime: '06d 04h',
    ports: '3000/tcp',
    notes: 'High heap pressure during Prometheus 90d rollup query',
  },
  {
    vmid: 105,
    hostname: 'pihole',
    node: 'pve-01',
    os: 'alpine-3.20',
    status: 'running',
    ip: '10.10.20.53',
    cpuPercent: 8,
    memUsedMb: 148,
    memTotalMb: 512,
    uptime: '42d 18h',
    ports: '53/udp, 53/tcp, 80/tcp',
    notes: 'Primary recursive Unbound + LAN blocklist (18.4% blocked)',
  },
  {
    vmid: 106,
    hostname: 'wireguard',
    node: 'pve-02',
    os: 'alpine-3.20',
    status: 'running',
    ip: '10.10.20.1',
    cpuPercent: 6,
    memUsedMb: 96,
    memTotalMb: 256,
    uptime: '42d 18h',
    ports: '51820/udp',
    notes: 'Site-to-site mesh · 4 active peers · 1.4ms RTT',
  },
  {
    vmid: 107,
    hostname: 'restic-bak',
    node: 'pve-03',
    os: 'alpine-3.20',
    status: 'stopped',
    ip: '10.10.20.44',
    cpuPercent: 0,
    memUsedMb: 0,
    memTotalMb: 1024,
    uptime: '00d 00h',
    ports: 'none',
    notes: 'Offsite S3 snapshot job exited 1 — B2 bucket lock check needed',
  },
];

const MOCK_SYSLOG: SyslogEntry[] = [
  {
    id: 'log-1',
    timestamp: '18:34:41',
    node: 'pve-01',
    unit: 'traefik[102]',
    level: 'INFO',
    message: 'TLS certificate renewed cleanly for *.homelab.internal (valid 89d)',
  },
  {
    id: 'log-2',
    timestamp: '18:34:44',
    node: 'pve-03',
    unit: 'grafana[104]',
    level: 'WARN',
    message: 'memory cgroup usage reached 87.4% (1790M/2048M) during TSDB compaction',
  },
  {
    id: 'log-3',
    timestamp: '18:34:46',
    node: 'pve-02',
    unit: 'postgres[103]',
    level: 'INFO',
    message: 'checkpoint complete: wrote 418 buffers (2.6%); 0 WAL file(s) added',
  },
  {
    id: 'log-4',
    timestamp: '18:34:48',
    node: 'pve-03',
    unit: 'pve-lxc[107]',
    level: 'ERR',
    message: 'container restic-bak stopped unexpectedly (exit code 1: remote lock timeout)',
  },
  {
    id: 'log-5',
    timestamp: '18:34:50',
    node: 'pve-01',
    unit: 'pihole[105]',
    level: 'INFO',
    message: 'gravity reload complete: 214,890 domains active on vlan20-dns',
  },
  {
    id: 'log-6',
    timestamp: '18:34:51',
    node: 'pve-02',
    unit: 'wireguard[106]',
    level: 'INFO',
    message: 'wg0 handshake completed for peer rack-b-offsite (rx 14.2G / tx 8.9G)',
  },
  {
    id: 'log-7',
    timestamp: '18:34:52',
    node: 'pve-01',
    unit: 'ui-hub[101]',
    level: 'INFO',
    message: 'GET /r/homelab-ops.md 200 OK (1.2ms) via 10.10.20.2',
  },
];

export default function HomelabOpsPreview({ inspect }: TemplatePreviewProps) {
  return (
    <div data-inspect-mode={inspect ? 'true' : 'false'}>
      <ProxmoxNocTerminal
        clusterName="PVE-HOMELAB-01"
        datacenter="RACK-A // 10GbE SFP+"
        pveVersion="pve-manager/8.3.2"
        kernelVersion="6.8.12-4-pve"
        uptime="42d 18h 09m"
        quorumStatus="quorate"
        nodes={MOCK_NODES}
        telemetry={MOCK_TELEMETRY}
        containers={MOCK_CONTAINERS}
        syslog={MOCK_SYSLOG}
      />
    </div>
  );
}
