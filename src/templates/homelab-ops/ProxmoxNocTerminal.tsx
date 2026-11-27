import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cpu,
  HardDrive,
  Pause,
  Play,
  Search,
  Server,
  Terminal,
  Wifi,
  X,
} from 'lucide-react';

export type QuorumStatus = 'quorate' | 'degraded';
export type NodeStatus = 'online' | 'degraded' | 'offline';
export type ContainerStatus = 'running' | 'warning' | 'stopped';
export type TelemetrySeverity = 'ok' | 'warn' | 'crit';
export type SyslogLevel = 'INFO' | 'WARN' | 'ERR';

export interface ClusterNode {
  id: string;
  name: string;
  ip: string;
  status: NodeStatus;
  uptime: string;
  loadAvg: string;
  cpuTempC: number;
}

export interface TelemetryGauge {
  id: string;
  label: string;
  detail: string;
  percent: number;
  usedLabel: string;
  totalLabel: string;
  severity?: TelemetrySeverity;
}

export interface LxcContainer {
  vmid: number;
  hostname: string;
  node: string;
  os: string;
  status: ContainerStatus;
  ip: string;
  cpuPercent: number;
  memUsedMb: number;
  memTotalMb: number;
  uptime: string;
  ports?: string;
  notes?: string;
}

export interface SyslogEntry {
  id: string;
  timestamp: string;
  node: string;
  unit: string;
  level: SyslogLevel;
  message: string;
}

export interface ProxmoxNocTerminalProps {
  clusterName: string;
  datacenter?: string;
  pveVersion?: string;
  kernelVersion?: string;
  uptime: string;
  quorumStatus: QuorumStatus;
  nodes: ClusterNode[];
  telemetry: TelemetryGauge[];
  containers: LxcContainer[];
  syslog: SyslogEntry[];
  operatorTag?: string;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildAsciiBar(percent: number, width = 10): string {
  const safe = clampPercent(percent);
  const filled = Math.round((safe / 100) * width);
  return `[${'|'.repeat(filled)}${'.'.repeat(Math.max(0, width - filled))}]`;
}

function resolveTelemetrySeverity(gauge: TelemetryGauge): TelemetrySeverity {
  if (gauge.severity) return gauge.severity;
  if (gauge.percent >= 90) return 'crit';
  if (gauge.percent >= 75) return 'warn';
  return 'ok';
}

function formatMemoryMb(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)}G`;
  }
  return `${mb}M`;
}

const SEVERITY_TEXT_CLASS: Record<TelemetrySeverity, string> = {
  ok: 'text-[#22C55E]',
  warn: 'text-[#F59E0B]',
  crit: 'text-[#EF4444]',
};

const CONTAINER_STATUS_STYLE: Record<
  ContainerStatus,
  { badge: string; dot: string; label: string }
> = {
  running: {
    badge: 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]',
    dot: 'bg-[#22C55E]',
    label: 'RUNNING',
  },
  warning: {
    badge: 'border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
    label: 'WARNING',
  },
  stopped: {
    badge: 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]',
    dot: 'bg-[#EF4444]',
    label: 'STOPPED',
  },
};

const LOG_LEVEL_STYLE: Record<SyslogLevel, string> = {
  INFO: 'text-[#22C55E]',
  WARN: 'text-[#F59E0B]',
  ERR: 'text-[#EF4444]',
};

export function ProxmoxNocTerminal({
  clusterName,
  datacenter = 'RACK-01 // HOMELAB',
  pveVersion = 'pve-manager/8.3.2',
  kernelVersion = '6.8.12-4-pve',
  uptime,
  quorumStatus,
  nodes,
  telemetry,
  containers,
  syslog,
  operatorTag = 'root@pve-noc',
}: ProxmoxNocTerminalProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | ContainerStatus>('all');
  const [nodeFilter, setNodeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVmid, setSelectedVmid] = useState<number | null>(
    containers[0]?.vmid ?? null,
  );
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | SyslogLevel>('ALL');
  const [tailPaused, setTailPaused] = useState(false);

  const counts = useMemo(() => {
    let running = 0;
    let warning = 0;
    let stopped = 0;
    for (const c of containers) {
      if (c.status === 'running') running += 1;
      else if (c.status === 'warning') warning += 1;
      else stopped += 1;
    }
    return { all: containers.length, running, warning, stopped };
  }, [containers]);

  const degradedNodeCount = useMemo(
    () => nodes.filter((n) => n.status !== 'online').length,
    [nodes],
  );

  const hasClusterAlert =
    quorumStatus === 'degraded' ||
    degradedNodeCount > 0 ||
    counts.stopped > 0 ||
    counts.warning > 0;

  const filteredContainers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return containers.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (nodeFilter !== 'all' && c.node !== nodeFilter) return false;
      if (!q) return true;
      return (
        String(c.vmid).includes(q) ||
        c.hostname.toLowerCase().includes(q) ||
        c.ip.toLowerCase().includes(q) ||
        c.os.toLowerCase().includes(q) ||
        (c.notes?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [containers, statusFilter, nodeFilter, searchQuery]);

  const selectedContainer = useMemo(() => {
    return (
      filteredContainers.find((c) => c.vmid === selectedVmid) ??
      containers.find((c) => c.vmid === selectedVmid) ??
      filteredContainers[0] ??
      null
    );
  }, [filteredContainers, containers, selectedVmid]);

  const filteredLogs = useMemo(() => {
    return syslog.filter((entry) => {
      if (logLevelFilter !== 'ALL' && entry.level !== logLevelFilter) {
        return false;
      }
      if (nodeFilter !== 'all' && entry.node !== nodeFilter) {
        return false;
      }
      return true;
    });
  }, [syslog, logLevelFilter, nodeFilter]);

  return (
    <div className="min-h-screen w-full bg-[#050505] font-mono text-xs text-zinc-200 selection:bg-[#22C55E]/25 selection:text-[#22C55E]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4 lg:p-6">
        {/* 1. Cluster Header Bar */}
        <header
          data-inspect-label="ClusterHeader"
          className="rounded-none border border-[#1F2937] bg-[#080A08]"
        >
          <div className="flex flex-col gap-3 border-b border-[#1F2937] px-3 py-2.5 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-none ${
                    quorumStatus === 'quorate' && degradedNodeCount === 0
                      ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.7)]'
                      : 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  }`}
                />
                <Terminal className="h-4 w-4 text-[#22C55E]" />
                <span className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
                  {clusterName}
                </span>
              </div>

              <span className="border border-[#1F2937] bg-[#050505] px-2 py-0.5 text-[11px] text-zinc-400">
                {datacenter}
              </span>

              <span
                className={`border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${
                  quorumStatus === 'quorate'
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]'
                    : 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444]'
                }`}
              >
                {quorumStatus === 'quorate' ? 'QUORUM: OK' : 'QUORUM: DEGRADED'}
              </span>

              {hasClusterAlert && (
                <span className="inline-flex items-center gap-1.5 border border-[#EF4444]/60 bg-[#EF4444]/15 px-2 py-0.5 text-[11px] font-semibold text-[#EF4444] uppercase">
                  <AlertTriangle className="h-3 w-3" />
                  {counts.stopped > 0
                    ? `ALERT: ${counts.stopped} DOWN / ${counts.warning} WARN`
                    : `ALERT: ${counts.warning} DEGRADED`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 tabular-nums">
              <span>
                VER: <span className="text-zinc-200">{pveVersion}</span>
              </span>
              <span className="hidden sm:inline">
                KERNEL: <span className="text-zinc-200">{kernelVersion}</span>
              </span>
              <span>
                UPTIME: <span className="text-[#22C55E]">{uptime}</span>
              </span>
            </div>
          </div>

          {/* Cluster Nodes Strip */}
          <div className="grid grid-cols-1 divide-y divide-[#1F2937] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
            {nodes.map((node) => {
              const isSelected = nodeFilter === node.name;
              const nodeColor =
                node.status === 'online'
                  ? 'text-[#22C55E]'
                  : node.status === 'degraded'
                    ? 'text-[#F59E0B]'
                    : 'text-[#EF4444]';
              const tempColor =
                node.cpuTempC >= 80
                  ? 'text-[#EF4444]'
                  : node.cpuTempC >= 68
                    ? 'text-[#F59E0B]'
                    : 'text-zinc-300';

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() =>
                    setNodeFilter((prev) =>
                      prev === node.name ? 'all' : node.name,
                    )
                  }
                  className={`flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors sm:px-4 ${
                    isSelected
                      ? 'bg-[#22C55E]/10'
                      : 'bg-[#050505] hover:bg-[#0D110D]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Server className={`h-3.5 w-3.5 shrink-0 ${nodeColor}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">
                          {node.name}
                        </span>
                        <span className={`text-[10px] uppercase ${nodeColor}`}>
                          [{node.status}]
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-zinc-500 tabular-nums">
                        {node.ip} · up {node.uptime}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-[11px] tabular-nums">
                    <div className="text-zinc-300">load {node.loadAvg}</div>
                    <div className={tempColor}>{node.cpuTempC}°C</div>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        {/* 2. ASCII Block Progress Telemetry Grid */}
        <section
          data-inspect-label="NodeTelemetry"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {telemetry.map((item, index) => {
            const severity = resolveTelemetrySeverity(item);
            const bar = buildAsciiBar(item.percent, 10);
            const pct = clampPercent(item.percent);
            const Icon =
              index === 0
                ? Cpu
                : index === 1
                  ? Activity
                  : index === 2
                    ? HardDrive
                    : Wifi;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-2 rounded-none border border-[#1F2937] bg-[#080A08] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${SEVERITY_TEXT_CLASS[severity]}`} />
                    <span className="text-[11px] font-semibold tracking-wider text-zinc-300 uppercase">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`border px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      severity === 'ok'
                        ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]'
                        : severity === 'warn'
                          ? 'border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]'
                          : 'border-[#EF4444]/50 bg-[#EF4444]/15 text-[#EF4444]'
                    }`}
                  >
                    {severity === 'ok'
                      ? 'NOMINAL'
                      : severity === 'warn'
                        ? 'ELEVATED'
                        : 'CRITICAL'}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2 tabular-nums">
                  <span
                    className={`text-sm font-bold tracking-tight ${SEVERITY_TEXT_CLASS[severity]}`}
                  >
                    {bar} {String(pct).padStart(2, '0')}%
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {item.usedLabel} / {item.totalLabel}
                  </span>
                </div>

                <div className="truncate border-t border-[#1F2937] pt-1.5 text-[11px] text-zinc-500">
                  {item.detail}
                </div>
              </div>
            );
          })}
        </section>

        {/* 3. Proxmox LXC Container Matrix */}
        <section
          data-inspect-label="ContainerMatrix"
          className="min-w-0 overflow-hidden rounded-none border border-[#1F2937] bg-[#080A08]"
        >
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col gap-2.5 border-b border-[#1F2937] p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                LXC_GUESTS
              </span>

              {(
                [
                  { key: 'all', label: 'ALL', count: counts.all },
                  { key: 'running', label: 'RUN', count: counts.running },
                  { key: 'warning', label: 'WARN', count: counts.warning },
                  { key: 'stopped', label: 'STOP', count: counts.stopped },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`rounded-none border px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors ${
                      active
                        ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                        : 'border-[#1F2937] bg-[#050505] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}:{tab.count}
                  </button>
                );
              })}

              {nodeFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setNodeFilter('all')}
                  className="inline-flex items-center gap-1 border border-[#F59E0B]/50 bg-[#F59E0B]/10 px-2 py-1 text-[11px] text-[#F59E0B]"
                >
                  NODE:{nodeFilter}
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="grep vmid / hostname / ip..."
                aria-label="Filter LXC containers"
                className="w-full rounded-none border border-[#1F2937] bg-[#050505] py-1.5 pr-7 pl-8 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#22C55E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dense Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left tabular-nums">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#050505] text-[10px] tracking-wider text-zinc-500 uppercase">
                  <th className="px-3 py-2 font-semibold">VMID</th>
                  <th className="px-3 py-2 font-semibold">HOSTNAME</th>
                  <th className="px-3 py-2 font-semibold">NODE</th>
                  <th className="px-3 py-2 font-semibold">STATUS</th>
                  <th className="px-3 py-2 font-semibold">IPv4 ADDR</th>
                  <th className="px-3 py-2 font-semibold">CPU BAR</th>
                  <th className="px-3 py-2 font-semibold">RAM BAR</th>
                  <th className="px-3 py-2 text-right font-semibold">UPTIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredContainers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-6 text-center text-xs text-zinc-500"
                    >
                      NO LXC GUESTS MATCH CURRENT FILTER ({searchQuery || statusFilter})
                    </td>
                  </tr>
                ) : (
                  filteredContainers.map((ct) => {
                    const st = CONTAINER_STATUS_STYLE[ct.status];
                    const memPct =
                      ct.memTotalMb > 0
                        ? clampPercent((ct.memUsedMb / ct.memTotalMb) * 100)
                        : 0;
                    const cpuSev: TelemetrySeverity =
                      ct.status === 'stopped'
                        ? 'ok'
                        : ct.cpuPercent >= 85
                          ? 'crit'
                          : ct.cpuPercent >= 65
                            ? 'warn'
                            : 'ok';
                    const memSev: TelemetrySeverity =
                      ct.status === 'stopped'
                        ? 'ok'
                        : memPct >= 88
                          ? 'crit'
                          : memPct >= 75
                            ? 'warn'
                            : 'ok';
                    const isSelected = selectedContainer?.vmid === ct.vmid;

                    return (
                      <tr
                        key={ct.vmid}
                        onClick={() => setSelectedVmid(ct.vmid)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#22C55E]/[0.07]'
                            : 'bg-[#080A08] hover:bg-[#0D110D]'
                        }`}
                      >
                        <td className="px-3 py-2 font-semibold text-zinc-300">
                          {ct.vmid}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-100">
                              {ct.hostname}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {ct.os}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-zinc-400">{ct.node}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px] font-semibold ${st.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-zinc-300">{ct.ip}</td>
                        <td
                          className={`px-3 py-2 ${
                            ct.status === 'stopped'
                              ? 'text-zinc-600'
                              : SEVERITY_TEXT_CLASS[cpuSev]
                          }`}
                        >
                          {buildAsciiBar(ct.cpuPercent, 8)}{' '}
                          {String(clampPercent(ct.cpuPercent)).padStart(2, '0')}%
                        </td>
                        <td
                          className={`px-3 py-2 ${
                            ct.status === 'stopped'
                              ? 'text-zinc-600'
                              : SEVERITY_TEXT_CLASS[memSev]
                          }`}
                        >
                          {buildAsciiBar(memPct, 8)}{' '}
                          <span className="text-zinc-400">
                            {formatMemoryMb(ct.memUsedMb)}/
                            {formatMemoryMb(ct.memTotalMb)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {ct.uptime}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Selected Container Inspector Strip */}
          {selectedContainer && (
            <div className="flex flex-col gap-2 border-t border-[#1F2937] bg-[#050505] px-3 py-2.5 text-[11px] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[#22C55E]">
                  pct config {selectedContainer.vmid}
                </span>
                <span className="text-zinc-400">
                  HOST:{' '}
                  <span className="text-zinc-100">
                    {selectedContainer.hostname}
                  </span>
                </span>
                {selectedContainer.ports && (
                  <span className="text-zinc-400">
                    PORTS:{' '}
                    <span className="text-zinc-200">
                      {selectedContainer.ports}
                    </span>
                  </span>
                )}
              </div>
              {selectedContainer.notes && (
                <div className="text-zinc-400">{selectedContainer.notes}</div>
              )}
            </div>
          )}
        </section>

        {/* 4. Live-Style Syslog Tail Panel */}
        <section
          data-inspect-label="SyslogTail"
          className="rounded-none border border-[#1F2937] bg-[#050505]"
        >
          <div className="flex flex-col gap-2 border-b border-[#1F2937] bg-[#080A08] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 ${
                  tailPaused ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
                }`}
              />
              <span className="text-[11px] font-semibold tracking-wider text-zinc-200 uppercase">
                SYSLOG // JOURNALCTL -F
              </span>
              <span className="text-[10px] text-zinc-500">
                ({filteredLogs.length} lines)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'INFO', 'WARN', 'ERR'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLogLevelFilter(lvl)}
                  className={`border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    logLevelFilter === lvl
                      ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                      : 'border-[#1F2937] bg-[#050505] text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setTailPaused((prev) => !prev)}
                className={`ml-1 inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  tailPaused
                    ? 'border-[#F59E0B]/60 bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'border-[#1F2937] bg-[#050505] text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {tailPaused ? (
                  <>
                    <Play className="h-2.5 w-2.5" />
                    PAUSED
                  </>
                ) : (
                  <>
                    <Pause className="h-2.5 w-2.5" />
                    LIVE
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto px-3 py-2 text-[11px] leading-relaxed tabular-nums">
            {filteredLogs.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-0.5 border-b border-[#1F2937]/40 py-1 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-3"
              >
                <span className="shrink-0 text-zinc-500">{entry.timestamp}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-zinc-400">{entry.node}</span>
                  <span className={`font-bold ${LOG_LEVEL_STYLE[entry.level]}`}>
                    [{entry.level}]
                  </span>
                  <span className="text-zinc-300">{entry.unit}:</span>
                </div>
                <span className="min-w-0 break-words text-zinc-300">
                  {entry.message}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[#1F2937] bg-[#080A08] px-3 py-1.5 text-[11px] text-zinc-500">
            <span className="min-w-0 break-all sm:break-normal">
              <span className="text-[#22C55E]">{operatorTag}</span>:~# journalctl
              -u pve-cluster -n 50 --no-pager
            </span>
            <span className="hidden sm:inline text-zinc-600">
              {tailPaused ? 'STREAM HELD' : 'STREAMING @ 2s'}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProxmoxNocTerminal;
