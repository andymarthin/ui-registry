import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Filter,
  Package,
  Plane,
  Plus,
  Search,
  Ship,
  Train,
  Truck,
  X,
} from 'lucide-react';

export type ShipmentStatus = 'Delivered' | 'In Transit' | 'Customs';
export type FreightMode = 'Maritime' | 'Air' | 'Rail' | 'Road';
export type StatusFilter = 'All' | ShipmentStatus;

export interface ShipmentEvent {
  timestamp: string;
  location: string;
  status: string;
  detail: string;
}

export interface ShipmentRecord {
  id: string;
  trackingId: string;
  reference: string;
  mode: FreightMode;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  carrier: string;
  vesselOrFlight: string;
  eta: string;
  weightKg: number;
  containersOrPieces: string;
  status: ShipmentStatus;
  customsStatus: string;
  incoterm: string;
  temperature?: string;
  lastMilestone: string;
  timeline: ShipmentEvent[];
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaTone: 'positive' | 'negative' | 'neutral';
  sublabel: string;
  iconKey: 'shipments' | 'ontime' | 'customs' | 'transit';
}

export interface LogisticsWorkspaceProps {
  breadcrumbs?: string[];
  workspaceTitle?: string;
  searchPlaceholder?: string;
  newShipmentLabel?: string;
  exportCsvLabel?: string;
  kpis?: KpiMetric[];
  shipments: ShipmentRecord[];
  initialStatusFilter?: StatusFilter;
  initialSelectedId?: string;
  onNewShipment?: (shipment: ShipmentRecord) => void;
  onExportCsv?: (rows: ShipmentRecord[]) => void;
  className?: string;
}

const DEFAULT_KPIS: KpiMetric[] = [
  {
    id: 'active-shipments',
    label: 'Active Shipments',
    value: '1,284',
    delta: '+4.2%',
    deltaTone: 'positive',
    sublabel: 'vs. prior 7d dispatch',
    iconKey: 'shipments',
  },
  {
    id: 'on-time-rate',
    label: 'On-Time Rate',
    value: '96.4%',
    delta: '+0.8pp',
    deltaTone: 'positive',
    sublabel: 'SLA target 95.0%',
    iconKey: 'ontime',
  },
  {
    id: 'customs-hold',
    label: 'Customs Hold',
    value: '18',
    delta: '-3 holds',
    deltaTone: 'positive',
    sublabel: 'Avg clearance 6.2h',
    iconKey: 'customs',
  },
  {
    id: 'avg-transit',
    label: 'Avg Transit Time',
    value: '11.4d',
    delta: '-0.6d',
    deltaTone: 'neutral',
    sublabel: 'Weighted ocean & air',
    iconKey: 'transit',
  },
];

const STATUS_BADGE_CLASSES: Record<ShipmentStatus, string> = {
  Delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'In Transit': 'border-blue-200 bg-blue-50 text-blue-700',
  Customs: 'border-amber-200 bg-amber-50 text-amber-800',
};

const STATUS_DOT_CLASSES: Record<ShipmentStatus, string> = {
  Delivered: 'bg-emerald-500',
  'In Transit': 'bg-[#2563EB]',
  Customs: 'bg-amber-500',
};

const DELTA_BADGE_CLASSES: Record<KpiMetric['deltaTone'], string> = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  negative: 'border-rose-200 bg-rose-50 text-rose-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
};

function ModeIcon({ mode, className }: { mode: FreightMode; className?: string }) {
  switch (mode) {
    case 'Maritime':
      return <Ship className={className} />;
    case 'Air':
      return <Plane className={className} />;
    case 'Rail':
      return <Train className={className} />;
    case 'Road':
      return <Truck className={className} />;
  }
}

function KpiIcon({ iconKey }: { iconKey: KpiMetric['iconKey'] }) {
  const cls = 'h-4 w-4 text-slate-500';
  switch (iconKey) {
    case 'shipments':
      return <Package className={cls} />;
    case 'ontime':
      return <Check className={cls} />;
    case 'customs':
      return <AlertTriangle className={cls} />;
    case 'transit':
      return <Clock className={cls} />;
  }
}

function formatWeight(weightKg: number): string {
  return `${weightKg.toLocaleString('en-US')} kg`;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const STATUS_TABS: StatusFilter[] = ['All', 'Delivered', 'In Transit', 'Customs'];

export function LogisticsWorkspace({
  breadcrumbs = ['Operations', 'Global Freight', 'Control Tower'],
  workspaceTitle = 'Freight & Customs Dispatch',
  searchPlaceholder = 'Search tracking ID, lane, carrier, or vessel...',
  newShipmentLabel = 'New Shipment',
  exportCsvLabel = 'Export CSV',
  kpis = DEFAULT_KPIS,
  shipments: initialShipments,
  initialStatusFilter = 'All',
  initialSelectedId,
  onNewShipment,
  onExportCsv,
  className = '',
}: LogisticsWorkspaceProps) {
  const [shipments, setShipments] = useState<ShipmentRecord[]>(initialShipments);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId ?? initialShipments[0]?.id ?? '',
  );
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New shipment form state
  const [draftOriginCode, setDraftOriginCode] = useState('SIN');
  const [draftOriginCity, setDraftOriginCity] = useState('Singapore');
  const [draftDestCode, setDraftDestCode] = useState('RTM');
  const [draftDestCity, setDraftDestCity] = useState('Rotterdam');
  const [draftCarrier, setDraftCarrier] = useState('Maersk Line');
  const [draftMode, setDraftMode] = useState<FreightMode>('Maritime');
  const [draftWeight, setDraftWeight] = useState('18400');
  const [draftContainers, setDraftContainers] = useState("1 × 40' HC");
  const [draftIncoterm, setDraftIncoterm] = useState('CIF');

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: shipments.length,
      Delivered: 0,
      'In Transit': 0,
      Customs: 0,
    };
    for (const row of shipments) {
      counts[row.status] += 1;
    }
    return counts;
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return shipments.filter((item) => {
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.trackingId.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.originCode.toLowerCase().includes(q) ||
        item.originCity.toLowerCase().includes(q) ||
        item.destinationCode.toLowerCase().includes(q) ||
        item.destinationCity.toLowerCase().includes(q) ||
        item.carrier.toLowerCase().includes(q) ||
        item.vesselOrFlight.toLowerCase().includes(q)
      );
    });
  }, [shipments, statusFilter, searchQuery]);

  const selectedShipment = useMemo(() => {
    const matchInFiltered = filteredShipments.find((s) => s.id === selectedId);
    if (matchInFiltered) return matchInFiltered;
    return filteredShipments[0] ?? shipments.find((s) => s.id === selectedId) ?? shipments[0] ?? null;
  }, [filteredShipments, shipments, selectedId]);

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv(filteredShipments);
    }

    const headers = [
      'Tracking ID',
      'Reference',
      'Mode',
      'Origin',
      'Destination',
      'Carrier',
      'Vessel/Flight',
      'ETA',
      'Weight (kg)',
      'Containers/Pieces',
      'Status',
      'Customs',
    ];

    const lines = [
      headers.map(escapeCsvCell).join(','),
      ...filteredShipments.map((s) =>
        [
          s.trackingId,
          s.reference,
          s.mode,
          `${s.originCode} (${s.originCity})`,
          `${s.destinationCode} (${s.destinationCity})`,
          s.carrier,
          s.vesselOrFlight,
          s.eta,
          s.weightKg,
          s.containersOrPieces,
          s.status,
          s.customsStatus,
        ]
          .map(escapeCsvCell)
          .join(','),
      ),
    ];

    try {
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipments-${statusFilter.toLowerCase().replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Non-DOM environments skip blob download gracefully
    }

    setExportNotice(`Exported ${filteredShipments.length} row${filteredShipments.length === 1 ? '' : 's'}`);
    window.setTimeout(() => setExportNotice(null), 2600);
  };

  const handleCopyTracking = (trackingId: string) => {
    try {
      navigator.clipboard?.writeText(trackingId);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
    setCopiedTrackingId(trackingId);
    window.setTimeout(() => setCopiedTrackingId(null), 1800);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const numericSuffix = 9400 + shipments.length + 1;
    const prefix = draftMode === 'Air' ? 'AWB' : draftMode === 'Maritime' ? 'BOL' : 'TRK';
    const newRecord: ShipmentRecord = {
      id: `ship-${Date.now()}`,
      trackingId: `${prefix}-${numericSuffix}-EU`,
      reference: `PO-${numericSuffix}`,
      mode: draftMode,
      originCode: draftOriginCode.trim().toUpperCase() || 'SIN',
      originCity: draftOriginCity.trim() || 'Singapore',
      destinationCode: draftDestCode.trim().toUpperCase() || 'RTM',
      destinationCity: draftDestCity.trim() || 'Rotterdam',
      carrier: draftCarrier.trim() || 'Maersk Line',
      vesselOrFlight: draftMode === 'Air' ? 'SQ-7328F' : 'MV Nordic Horizon',
      eta: 'Dec 04, 14:00 UTC',
      weightKg: Math.max(100, Number.parseInt(draftWeight, 10) || 12000),
      containersOrPieces: draftContainers.trim() || "1 × 40' HC",
      status: 'In Transit',
      customsStatus: 'Pre-Cleared Manifest',
      incoterm: draftIncoterm,
      lastMilestone: `Departed ${draftOriginCity.trim() || 'Origin'} terminal`,
      timeline: [
        {
          timestamp: 'Just now',
          location: `${draftOriginCode.trim().toUpperCase() || 'SIN'} Gateway`,
          status: 'Manifest Confirmed',
          detail: 'Electronic bill of lading validated and dispatched',
        },
        {
          timestamp: 'Pending',
          location: `${draftDestCode.trim().toUpperCase() || 'RTM'} Hub`,
          status: 'Scheduled Arrival',
          detail: 'Automated customs pre-filing submitted',
        },
      ],
    };

    setShipments((prev) => [newRecord, ...prev]);
    setStatusFilter('All');
    setSelectedId(newRecord.id);
    setIsNewModalOpen(false);
    onNewShipment?.(newRecord);
  };

  return (
    <div
      className={`min-h-screen w-full bg-[#FFFFFF] text-slate-900 antialiased ${className}`}
    >
      {/* Top Utility Bar */}
      <header
        data-inspect-label="TopUtilityBar"
        className="border-b border-[#E2E8F0] bg-[#F1F5F9]"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Breadcrumb & Workspace Title */}
          <div className="flex min-w-0 flex-col gap-1">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500"
            >
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb}-${idx}`}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  <span
                    className={
                      idx === breadcrumbs.length - 1
                        ? 'text-slate-900 font-semibold'
                        : 'hover:text-slate-700'
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {workspaceTitle}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#FFFFFF] px-2 py-0.5 text-[11px] font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Telemetry · {shipments.length} Active Records
              </span>
            </div>
          </div>

          {/* Search & Primary Action Controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72 lg:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search shipments"
                className="h-9 w-full rounded-md border border-[#E2E8F0] bg-[#FFFFFF] pr-8 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 sm:flex-none"
              >
                {exportNotice ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{exportNotice}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>{exportCsvLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsNewModalOpen((prev) => !prev)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#2563EB] px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/30 focus:outline-none sm:flex-none"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{newShipmentLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-5 sm:px-6">
        {/* Inline New Shipment Drawer */}
        {isNewModalOpen && (
          <section
            aria-label="Create new shipment"
            className="rounded-lg border border-blue-200 bg-slate-50/80 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Register Dispatch Consignment
                </h2>
                <p className="text-xs text-slate-500">
                  Adds a live tracking record directly into the control tower ledger.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                aria-label="Close new shipment form"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateShipment}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                Origin (IATA/UNLOCODE & City)
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={5}
                    value={draftOriginCode}
                    onChange={(e) => setDraftOriginCode(e.target.value)}
                    className="h-8 w-16 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 font-mono text-xs uppercase focus:border-[#2563EB] focus:outline-none"
                    placeholder="SIN"
                  />
                  <input
                    type="text"
                    value={draftOriginCity}
                    onChange={(e) => setDraftOriginCity(e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 text-xs focus:border-[#2563EB] focus:outline-none"
                    placeholder="Singapore"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                Destination (Code & City)
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={5}
                    value={draftDestCode}
                    onChange={(e) => setDraftDestCode(e.target.value)}
                    className="h-8 w-16 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 font-mono text-xs uppercase focus:border-[#2563EB] focus:outline-none"
                    placeholder="RTM"
                  />
                  <input
                    type="text"
                    value={draftDestCity}
                    onChange={(e) => setDraftDestCity(e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 text-xs focus:border-[#2563EB] focus:outline-none"
                    placeholder="Rotterdam"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                Carrier & Mode
                <div className="flex gap-1.5">
                  <select
                    value={draftMode}
                    onChange={(e) => setDraftMode(e.target.value as FreightMode)}
                    className="h-8 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 text-xs focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="Maritime">Maritime</option>
                    <option value="Air">Air</option>
                    <option value="Rail">Rail</option>
                    <option value="Road">Road</option>
                  </select>
                  <input
                    type="text"
                    value={draftCarrier}
                    onChange={(e) => setDraftCarrier(e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 text-xs focus:border-[#2563EB] focus:outline-none"
                    placeholder="Maersk Line"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                Weight (kg) & Load Unit
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={draftWeight}
                    onChange={(e) => setDraftWeight(e.target.value)}
                    className="h-8 w-24 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 font-mono text-xs focus:border-[#2563EB] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={draftContainers}
                    onChange={(e) => setDraftContainers(e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 text-xs focus:border-[#2563EB] focus:outline-none"
                    placeholder="1 × 40' HC"
                  />
                </div>
              </label>

              <div className="flex items-end gap-2">
                <label className="flex w-20 flex-col gap-1 text-xs font-medium text-slate-700">
                  Incoterm
                  <select
                    value={draftIncoterm}
                    onChange={(e) => setDraftIncoterm(e.target.value)}
                    className="h-8 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-2 font-mono text-xs focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="DDP">DDP</option>
                    <option value="EXW">EXW</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="h-8 flex-1 rounded bg-[#2563EB] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </section>
        )}

        {/* 4-Column Operational KPI Strip */}
        <section
          data-inspect-label="KpiStrip"
          aria-label="Operational KPIs"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E8F0] bg-slate-50">
                  <KpiIcon iconKey={kpi.iconKey} />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {kpi.value}
                </span>
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums ${DELTA_BADGE_CLASSES[kpi.deltaTone]}`}
                >
                  {kpi.delta}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">{kpi.sublabel}</p>
            </div>
          ))}
        </section>

        {/* Main Shipment Table + Detail Preview Split */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
          {/* Shipment Table Panel */}
          <section
            data-inspect-label="ShipmentTable"
            aria-label="Shipments ledger"
            className="min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] lg:col-span-8"
          >
            {/* Filter Tabs Bar */}
            <div className="flex flex-col gap-2.5 border-b border-[#E2E8F0] bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                role="tablist"
                aria-label="Filter shipments by status"
                className="flex flex-wrap items-center gap-1.5"
              >
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setStatusFilter(tab)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'border border-[#E2E8F0] bg-[#FFFFFF] text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 font-mono text-[11px] tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusCounts[tab]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-mono tabular-nums">
                  Showing {filteredShipments.length} of {shipments.length}
                </span>
              </div>
            </div>

            {/* Responsive Horizontal Scroll Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    <th className="py-2.5 pr-3 pl-4">Tracking ID</th>
                    <th className="px-3 py-2.5">Route</th>
                    <th className="px-3 py-2.5">Carrier</th>
                    <th className="px-3 py-2.5">ETA</th>
                    <th className="px-3 py-2.5">Weight / Units</th>
                    <th className="py-2.5 pr-4 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <p className="text-sm font-medium text-slate-700">
                          No shipments match your active filters.
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Adjust the status tab or clear the search query to inspect all freight.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('All');
                            setSearchQuery('');
                          }}
                          className="mt-3 inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((shipment) => {
                      const isSelected = selectedShipment?.id === shipment.id;
                      return (
                        <tr
                          key={shipment.id}
                          onClick={() => setSelectedId(shipment.id)}
                          aria-selected={isSelected}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/70'
                              : 'bg-[#FFFFFF] hover:bg-slate-50/90'
                          }`}
                        >
                          <td
                            className={`py-3 pr-3 pl-4 align-top ${
                              isSelected ? 'border-l-2 border-l-[#2563EB]' : 'border-l-2 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#E2E8F0] bg-slate-50 text-slate-600">
                                <ModeIcon mode={shipment.mode} className="h-3.5 w-3.5" />
                              </span>
                              <div>
                                <div className="font-mono text-xs font-semibold text-slate-900">
                                  {shipment.trackingId}
                                </div>
                                <div className="font-mono text-[11px] text-slate-500">
                                  {shipment.reference}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900">
                              <span>{shipment.originCode}</span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span>{shipment.destinationCode}</span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {shipment.originCity} to {shipment.destinationCity}
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="font-medium text-slate-900">{shipment.carrier}</div>
                            <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                              {shipment.vesselOrFlight}
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top font-mono text-xs text-slate-700 tabular-nums">
                            {shipment.eta}
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="font-mono font-medium text-slate-900 tabular-nums">
                              {formatWeight(shipment.weightKg)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {shipment.containersOrPieces}
                            </div>
                          </td>

                          <td className="py-3 pr-4 pl-3 text-right align-top">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${STATUS_BADGE_CLASSES[shipment.status]}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASSES[shipment.status]}`}
                              />
                              {shipment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Selectable Row Detail Preview Panel */}
          <aside
            data-inspect-label="ShipmentDetailPanel"
            aria-label="Selected shipment details"
            className="min-w-0 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] lg:col-span-4"
          >
            {selectedShipment ? (
              <div className="flex flex-col">
                {/* Detail Header */}
                <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-semibold text-slate-900">
                          {selectedShipment.trackingId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(selectedShipment.trackingId)}
                          aria-label="Copy tracking ID"
                          className="inline-flex items-center gap-1 rounded border border-[#E2E8F0] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                        >
                          {copiedTrackingId === selectedShipment.trackingId ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Ref{' '}
                        <span className="font-mono text-slate-700">
                          {selectedShipment.reference}
                        </span>{' '}
                        · {selectedShipment.mode} · Incoterm{' '}
                        <span className="font-mono font-medium text-slate-700">
                          {selectedShipment.incoterm}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE_CLASSES[selectedShipment.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASSES[selectedShipment.status]}`}
                      />
                      {selectedShipment.status}
                    </span>
                  </div>
                </div>

                {/* Lane Summary */}
                <div className="border-b border-[#E2E8F0] px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2 rounded-md border border-[#E2E8F0] bg-slate-50/70 px-3 py-2.5">
                    <div>
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {selectedShipment.originCode}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedShipment.originCity}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col items-center px-2">
                      <div className="flex w-full items-center gap-1">
                        <span className="h-px flex-1 bg-slate-300" />
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#2563EB]">
                          <ModeIcon mode={selectedShipment.mode} className="h-3.5 w-3.5" />
                        </span>
                        <span className="h-px flex-1 bg-slate-300" />
                      </div>
                      <span className="mt-1 font-mono text-[10px] text-slate-500">
                        {selectedShipment.vesselOrFlight}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {selectedShipment.destinationCode}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedShipment.destinationCity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-px border-b border-[#E2E8F0] bg-[#E2E8F0]">
                  <div className="bg-[#FFFFFF] p-3">
                    <div className="text-[11px] font-medium text-slate-500">Carrier</div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-900">
                      {selectedShipment.carrier}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] p-3">
                    <div className="text-[11px] font-medium text-slate-500">Scheduled ETA</div>
                    <div className="mt-0.5 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {selectedShipment.eta}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] p-3">
                    <div className="text-[11px] font-medium text-slate-500">Gross Weight & Load</div>
                    <div className="mt-0.5 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {formatWeight(selectedShipment.weightKg)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedShipment.containersOrPieces}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] p-3">
                    <div className="text-[11px] font-medium text-slate-500">Customs Disposition</div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-900">
                      {selectedShipment.customsStatus}
                    </div>
                    {selectedShipment.temperature && (
                      <div className="mt-0.5 font-mono text-[11px] text-[#2563EB]">
                        Reefer: {selectedShipment.temperature}
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestone Timeline */}
                <div className="px-4 py-3.5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                      Milestone Log
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      {selectedShipment.timeline.length} checkpoints
                    </span>
                  </div>
                  <ol className="space-y-3">
                    {selectedShipment.timeline.map((event, index) => {
                      const isLatest = index === 0;
                      return (
                        <li key={`${event.timestamp}-${index}`} className="relative flex gap-3">
                          {index < selectedShipment.timeline.length - 1 && (
                            <span
                              aria-hidden="true"
                              className="absolute top-5 bottom-[-12px] left-[7px] w-px bg-[#E2E8F0]"
                            />
                          )}
                          <span
                            className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                              isLatest
                                ? 'border-[#2563EB] bg-blue-100'
                                : 'border-slate-300 bg-[#FFFFFF]'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-900">
                                {event.status}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                                {event.timestamp}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-slate-600">
                              {event.location}
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500">{event.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Select a shipment row to inspect lane telemetry and customs checkpoints.
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default LogisticsWorkspace;
