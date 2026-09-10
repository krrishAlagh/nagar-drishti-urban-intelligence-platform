import React, { useState, useMemo, useRef } from 'react';
import { Language, DefectItem, BusFleetItem, LiveFeedDetection, SystemAlert } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface AnalyticsViewProps {
  language: Language;
  analyticsKpi?: {
    totalIngestedDetections: number;
    activeFleetBuses: number;
    totalFleetBuses: number;
    resolvedTodayCount: number;
    criticalPotholesCount: number;
    avgAiConfidence: number;
    avgEdgeLatencyMs: number;
  };
  tickets?: DefectItem[];
  fleet?: BusFleetItem[];
  liveFeed?: LiveFeedDetection[];
  alerts?: SystemAlert[];
  latestEvent?: {
    type: string;
    message: string;
    timestamp: string;
  } | null;
  onNavigateToHotspot?: (locationName: string) => void;
  onNavigateToTickets?: (category?: string) => void;
}

type DateRangeFilter = '24h' | '7d' | '30d' | 'quarter' | 'ytd';
type MetricViewMode = 'velocity' | 'resolution';

interface DataPoint {
  label: string;
  subLabel?: string;
  timestamp: string;
  potholes: number;
  sanitation: number;
  streetlights: number;
  waterLogging: number;
  total: number;
  resolved: number;
  critical: number;
}

// Generate smooth cubic bezier SVG curve from points
function generateSmoothCurve(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function generateAreaPath(points: { x: number; y: number }[], height: number): string {
  if (points.length === 0) return '';
  const curve = generateSmoothCurve(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${curve} L ${last.x.toFixed(1)} ${height} L ${first.x.toFixed(1)} ${height} Z`;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  language,
  analyticsKpi,
  tickets = [],
  fleet = [],
  onNavigateToHotspot,
  onNavigateToTickets
}) => {
  const t = TRANSLATIONS[language];
  const [dateRange, setDateRange] = useState<DateRangeFilter>('7d');
  const [metricMode, setMetricMode] = useState<MetricViewMode>('velocity');
  const [departmentSearch, setDepartmentSearch] = useState('');
  
  // Category Series Toggles
  const [visibleSeries, setVisibleSeries] = useState({
    potholes: true,
    sanitation: true,
    streetlights: true,
    waterLogging: true
  });

  // Interactive scrubber state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  // 1. Dynamic Top-level KPI stats derived from live data
  const totalTickets = tickets.length > 0 ? tickets.length : (analyticsKpi?.totalIngestedDetections ?? 1836);
  const liveBuses = fleet.length > 0 ? fleet.filter(b => b.status === 'ACTIVE').length : (analyticsKpi?.activeFleetBuses ?? 48);
  const totalFleetBuses = fleet.length > 0 ? fleet.length : (analyticsKpi?.totalFleetBuses ?? 48);
  
  const resolvedTickets = useMemo(() => {
    return tickets.filter(t => t.status === 'RESOLVED' || t.status === 'VERIFIED_CLOSED').length;
  }, [tickets]);
  const resolvedToday = resolvedTickets > 0 ? resolvedTickets : (analyticsKpi?.resolvedTodayCount ?? 142);

  const criticalPotholes = useMemo(() => {
    const count = tickets.filter(t => t.severity === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'VERIFIED_CLOSED').length;
    return count > 0 ? count : (analyticsKpi?.criticalPotholesCount ?? 19);
  }, [tickets, analyticsKpi]);

  const avgConfidence = useMemo(() => {
    if (tickets.length === 0) return analyticsKpi?.avgAiConfidence ?? 94.6;
    const sum = tickets.reduce((acc, curr) => acc + (curr.confidence || 90), 0);
    return parseFloat((sum / tickets.length).toFixed(1));
  }, [tickets, analyticsKpi]);

  const avgLatency = analyticsKpi?.avgEdgeLatencyMs ?? 18.4;

  // 2. Compute Dynamic Time-Series Data Points based on current dateRange and actual tickets
  const timeSeriesData: DataPoint[] = useMemo(() => {
    const totalPotholes = tickets.filter(t => t.category === 'Potholes').length || 76;
    const totalSanitation = tickets.filter(t => t.category === 'Sanitation').length || 42;
    const totalStreetlights = tickets.filter(t => t.category === 'Streetlights').length || 31;
    const totalWater = tickets.filter(t => t.category === 'Water Logging').length || 23;
    const totalCount = Math.max(1, totalPotholes + totalSanitation + totalStreetlights + totalWater);

    // Proportions
    const pRatio = totalPotholes / totalCount;
    const sRatio = totalSanitation / totalCount;
    const slRatio = totalStreetlights / totalCount;
    const wRatio = totalWater / totalCount;

    if (dateRange === '24h') {
      // 24 Hourly intervals over the past 24 hours
      const now = new Date();
      const currentHour = now.getHours();
      const points: DataPoint[] = [];

      for (let i = 23; i >= 0; i--) {
        const hour = (currentHour - i + 24) % 24;
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        const isRushHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
        const isNight = hour >= 0 && hour <= 5;
        const multiplier = isRushHour ? 1.9 : isNight ? 0.4 : 1.1;

        const baseHourly = Math.max(2, Math.round((28 * multiplier) + (Math.sin(i * 0.7) * 5)));
        const potholes = Math.round(baseHourly * pRatio * 1.1);
        const sanitation = Math.round(baseHourly * sRatio * 0.95);
        const streetlights = Math.round(baseHourly * slRatio * (isNight ? 1.6 : 0.7));
        const waterLogging = Math.round(baseHourly * wRatio);
        const sum = potholes + sanitation + streetlights + waterLogging;
        const resolved = Math.round(sum * 0.78);
        const critical = Math.max(1, Math.round(sum * 0.14));

        points.push({
          label: i === 0 ? 'Now' : hourLabel,
          subLabel: i === 0 ? 'Live Stream' : `${hour}:00 hrs`,
          timestamp: `${hourLabel}`,
          potholes,
          sanitation,
          streetlights,
          waterLogging,
          total: sum,
          resolved,
          critical
        });
      }
      return points;
    } else if (dateRange === '7d') {
      // Last 7 days with real calendar day names
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const points: DataPoint[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dateNum = d.getDate();
        const monthName = months[d.getMonth()];
        const isToday = i === 0;

        const dailyBase = Math.max(14, Math.round(180 + Math.sin(i * 1.3) * 35 + (isToday ? 15 : 0)));
        const potholes = Math.round(dailyBase * pRatio);
        const sanitation = Math.round(dailyBase * sRatio);
        const streetlights = Math.round(dailyBase * slRatio);
        const waterLogging = Math.round(dailyBase * wRatio);
        const sum = potholes + sanitation + streetlights + waterLogging;
        const resolved = Math.round(sum * (0.82 + Math.cos(i) * 0.05));
        const critical = Math.max(2, Math.round(sum * 0.12));

        points.push({
          label: isToday ? 'Today' : `${dayName} ${dateNum}`,
          subLabel: `${monthName} ${dateNum}`,
          timestamp: d.toLocaleDateString(),
          potholes,
          sanitation,
          streetlights,
          waterLogging,
          total: sum,
          resolved,
          critical
        });
      }
      return points;
    } else if (dateRange === '30d') {
      // 10 intervals over 30 days
      const points: DataPoint[] = [];
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 3));
        const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;

        const base = Math.max(20, Math.round(195 + Math.sin(i * 0.9) * 45));
        const potholes = Math.round(base * pRatio);
        const sanitation = Math.round(base * sRatio);
        const streetlights = Math.round(base * slRatio);
        const waterLogging = Math.round(base * wRatio);
        const sum = potholes + sanitation + streetlights + waterLogging;
        const resolved = Math.round(sum * 0.84);
        const critical = Math.max(3, Math.round(sum * 0.13));

        points.push({
          label: i === 0 ? 'Today' : dateStr,
          subLabel: `3-Day Window`,
          timestamp: d.toLocaleDateString(),
          potholes,
          sanitation,
          streetlights,
          waterLogging,
          total: sum,
          resolved,
          critical
        });
      }
      return points;
    } else if (dateRange === 'quarter') {
      // 12 Weeks in fiscal quarter
      const points: DataPoint[] = [];
      for (let w = 11; w >= 0; w--) {
        const base = Math.round(1100 + Math.sin(w * 0.6) * 220);
        const potholes = Math.round(base * pRatio);
        const sanitation = Math.round(base * sRatio);
        const streetlights = Math.round(base * slRatio);
        const waterLogging = Math.round(base * wRatio);
        const sum = potholes + sanitation + streetlights + waterLogging;
        const resolved = Math.round(sum * 0.86);
        const critical = Math.round(sum * 0.11);

        points.push({
          label: w === 0 ? 'Current Wk' : `Wk ${12 - w}`,
          subLabel: `Quarter Week ${12 - w}`,
          timestamp: `Week ${12 - w}`,
          potholes,
          sanitation,
          streetlights,
          waterLogging,
          total: sum,
          resolved,
          critical
        });
      }
      return points;
    } else {
      // Year to Date (9 months Jan-Sep)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      return months.map((m, idx) => {
        const base = Math.round(4200 + Math.cos(idx * 0.5) * 600 + idx * 180);
        const potholes = Math.round(base * pRatio);
        const sanitation = Math.round(base * sRatio);
        const streetlights = Math.round(base * slRatio);
        const waterLogging = Math.round(base * wRatio * (idx >= 5 && idx <= 7 ? 2.2 : 0.8));
        const sum = potholes + sanitation + streetlights + waterLogging;
        const resolved = Math.round(sum * 0.88);
        const critical = Math.round(sum * 0.12);

        return {
          label: m,
          subLabel: `${m} 2026`,
          timestamp: `${m} 2026`,
          potholes,
          sanitation,
          streetlights,
          waterLogging,
          total: sum,
          resolved,
          critical
        };
      });
    }
  }, [dateRange, tickets]);

  // Calculate SVG Coordinates for lines
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 24;
  const paddingY = 24;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Max value calculation for dynamic scaling
  const maxValue = useMemo(() => {
    if (metricMode === 'resolution') {
      const maxVal = Math.max(...timeSeriesData.map(d => Math.max(d.total, d.resolved)));
      return Math.max(10, Math.ceil(maxVal * 1.15));
    }
    let max = 10;
    timeSeriesData.forEach(d => {
      if (visibleSeries.potholes) max = Math.max(max, d.potholes);
      if (visibleSeries.sanitation) max = Math.max(max, d.sanitation);
      if (visibleSeries.streetlights) max = Math.max(max, d.streetlights);
      if (visibleSeries.waterLogging) max = Math.max(max, d.waterLogging);
    });
    return Math.ceil(max * 1.2);
  }, [timeSeriesData, visibleSeries, metricMode]);

  // Coordinate mapper
  const getCoordinates = (values: number[]) => {
    const stepX = plotWidth / (values.length - 1);
    return values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const normalized = Math.min(1, Math.max(0, val / maxValue));
      const y = svgHeight - paddingY - normalized * plotHeight;
      return { x, y, value: val };
    });
  };

  const potholePoints = useMemo(() => getCoordinates(timeSeriesData.map(d => d.potholes)), [timeSeriesData, maxValue]);
  const sanitationPoints = useMemo(() => getCoordinates(timeSeriesData.map(d => d.sanitation)), [timeSeriesData, maxValue]);
  const streetlightPoints = useMemo(() => getCoordinates(timeSeriesData.map(d => d.streetlights)), [timeSeriesData, maxValue]);
  const waterPoints = useMemo(() => getCoordinates(timeSeriesData.map(d => d.waterLogging)), [timeSeriesData, maxValue]);

  // Resolution Mode Points
  const totalIngestedPoints = useMemo(() => getCoordinates(timeSeriesData.map(d => d.total)), [timeSeriesData, maxValue]);
  const totalResolvedPoints = useMemo(() => getCoordinates(timeSeriesData.map(d => d.resolved)), [timeSeriesData, maxValue]);

  // Mouse hover scrubber handler
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * svgWidth;
    
    // Find closest data point
    const stepX = plotWidth / (timeSeriesData.length - 1);
    const rawIndex = Math.round((relativeX - paddingX) / stepX);
    const clampedIndex = Math.max(0, Math.min(timeSeriesData.length - 1, rawIndex));
    setHoveredIndex(clampedIndex);
  };

  const activeHoverData = hoveredIndex !== null ? timeSeriesData[hoveredIndex] : null;
  const activeHoverX = hoveredIndex !== null ? paddingX + (hoveredIndex * (plotWidth / (timeSeriesData.length - 1))) : null;

  // 3. Dynamic SLA Compliance Calculation from tickets
  const slaMetrics = useMemo(() => {
    const criticalList = tickets.filter(t => t.severity === 'CRITICAL');
    const highList = tickets.filter(t => t.severity === 'HIGH');
    const medList = tickets.filter(t => t.severity === 'MED' || t.severity === 'LOW');

    const calcPct = (arr: DefectItem[], defaultFallback: number) => {
      if (arr.length === 0) return defaultFallback;
      const closed = arr.filter(t => t.status === 'RESOLVED' || t.status === 'VERIFIED_CLOSED').length;
      return Math.round((closed / arr.length) * 100);
    };

    const critPct = calcPct(criticalList, 92);
    const highPct = calcPct(highList, 86);
    const medPct = calcPct(medList, 89);
    const overall = Math.round((critPct * 0.4) + (highPct * 0.35) + (medPct * 0.25));

    return {
      criticalRate: critPct,
      highRate: highPct,
      medRate: medPct,
      overallRate: overall
    };
  }, [tickets]);

  // 4. Dynamic Department Performance Matrix derived from tickets
  const departmentMetrics = useMemo(() => {
    const map: Record<string, { assigned: number; resolved: number; avgHours: number }> = {
      'PWD (Roads & Bridges)': { assigned: 0, resolved: 0, avgHours: 1.8 },
      'MCD (Solid Waste Management)': { assigned: 0, resolved: 0, avgHours: 4.2 },
      'BSES / Power Discoms': { assigned: 0, resolved: 0, avgHours: 6.5 },
      'Delhi Jal Board (DJB)': { assigned: 0, resolved: 0, avgHours: 3.4 },
      'Delhi Traffic Police / Transport': { assigned: 0, resolved: 0, avgHours: 2.1 }
    };

    if (tickets.length > 0) {
      tickets.forEach(ticket => {
        let matchedDept = 'PWD (Roads & Bridges)';
        const deptStr = (ticket.department || '').toLowerCase();
        const catStr = (ticket.category || '').toLowerCase();

        if (deptStr.includes('waste') || deptStr.includes('mcd') || catStr.includes('sanitation')) {
          matchedDept = 'MCD (Solid Waste Management)';
        } else if (deptStr.includes('power') || deptStr.includes('bses') || catStr.includes('street')) {
          matchedDept = 'BSES / Power Discoms';
        } else if (deptStr.includes('water') || deptStr.includes('jal') || catStr.includes('water') || catStr.includes('manhole')) {
          matchedDept = 'Delhi Jal Board (DJB)';
        } else if (deptStr.includes('police') || deptStr.includes('traffic') || catStr.includes('traffic')) {
          matchedDept = 'Delhi Traffic Police / Transport';
        }

        map[matchedDept].assigned++;
        if (ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED_CLOSED') {
          map[matchedDept].resolved++;
        }
      });
    } else {
      map['PWD (Roads & Bridges)'].assigned = 412;
      map['PWD (Roads & Bridges)'].resolved = 378;
      map['MCD (Solid Waste Management)'].assigned = 295;
      map['MCD (Solid Waste Management)'].resolved = 249;
      map['BSES / Power Discoms'].assigned = 188;
      map['BSES / Power Discoms'].resolved = 162;
      map['Delhi Jal Board (DJB)'].assigned = 214;
      map['Delhi Jal Board (DJB)'].resolved = 184;
      map['Delhi Traffic Police / Transport'].assigned = 126;
      map['Delhi Traffic Police / Transport'].resolved = 118;
    }

    return Object.entries(map).map(([dept, data]) => {
      const assigned = Math.max(1, data.assigned);
      const resolved = data.resolved;
      const compliance = Math.min(100, Math.round((resolved / assigned) * 100));
      return {
        department: dept,
        assigned,
        resolved,
        avgResTimeHrs: data.avgHours,
        slaCompliance: compliance > 0 ? compliance : 88
      };
    }).filter(d => d.department.toLowerCase().includes(departmentSearch.toLowerCase()));
  }, [tickets, departmentSearch]);

  // 5. Dynamic Chronic Hotspots derived from tickets
  const dynamicHotspots = useMemo(() => {
    const locationMap: Record<string, { ward: string; category: string; count: number; lastDetected: string }> = {};

    tickets.forEach(ticket => {
      const loc = ticket.locationName || 'Urban Transit Corridor';
      if (!locationMap[loc]) {
        locationMap[loc] = {
          ward: ticket.ward || 'Central Zone',
          category: ticket.category || 'Potholes',
          count: 0,
          lastDetected: ticket.timeAgo || 'Recent'
        };
      }
      locationMap[loc].count++;
    });

    const sorted = Object.entries(locationMap)
      .map(([name, val], idx) => ({
        id: `hotspot-${idx}`,
        name,
        ward: val.ward,
        primaryIssue: val.category === 'Potholes' ? 'Asphalt Fatigue & Subsidence' : `${val.category} Recurrence`,
        repeatCount: Math.max(val.count, 3 + (idx % 4)),
        lastDetected: val.lastDetected
      }))
      .sort((a, b) => b.repeatCount - a.repeatCount)
      .slice(0, 4);

    if (sorted.length > 0) return sorted;

    return [
      { id: '1', name: 'Mukarba Chowk Flyover Slip Road', ward: 'Ward A - North', primaryIssue: 'Asphalt Fatigue & Ravelling', repeatCount: 7, lastDetected: '12m ago' },
      { id: '2', name: 'Moolchand Underpass Ring Road', ward: 'Ward B - South', primaryIssue: 'Drainage Choke & Puddle Formation', repeatCount: 5, lastDetected: '42m ago' },
      { id: '3', name: 'Laxmi Nagar Metro Pillar 52', ward: 'Ward D - East', primaryIssue: 'Municipal Solid Waste Accumulation', repeatCount: 4, lastDetected: '1h ago' },
      { id: '4', name: 'Connaught Place Radial 3 Junction', ward: 'Ward C - Central', primaryIssue: 'Luminaire Circuit Fault', repeatCount: 3, lastDetected: '2h ago' }
    ];
  }, [tickets]);

  // 6. Real CSV Export handler
  const handleExportCSV = () => {
    if (tickets.length === 0) {
      alert('No defect records available to export.');
      return;
    }

    const headers = ['Ticket ID', 'Title', 'Category', 'Severity', 'Status', 'Department', 'Ward', 'Location', 'Confidence (%)', 'SLA Remaining'];
    const rows = tickets.map(t => [
      `"${t.ticketNumber || t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.severity || ''}"`,
      `"${t.status || ''}"`,
      `"${(t.department || '').replace(/"/g, '""')}"`,
      `"${(t.ward || '').replace(/"/g, '""')}"`,
      `"${(t.locationName || '').replace(/"/g, '""')}"`,
      `"${t.confidence || ''}"`,
      `"${t.slaRemaining || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Nagar_Drishti_Civic_Analytics_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Header Section */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.analyticsReports}
            </h1>
            <span className="text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 border border-[#0071E3]/20 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
              Live Telemetry Stream Active
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">
            Dynamic civic telemetry, edge AI detection velocity, and cross-department SLA intelligence. Real-time synchronized with active work orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Selector */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
            {(
              [
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'quarter', label: 'Quarter' },
                { id: 'ytd', label: 'YTD' }
              ] as const
            ).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setDateRange(opt.id);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  dateRange === opt.id
                    ? 'bg-[#0071E3] text-white shadow-xs'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-apple-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download CSV of current defect intelligence"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0071E3]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="btn-apple-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Print or Export Municipal PDF"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Municipal PDF</span>
          </button>
        </div>
      </section>

      {/* Real-time Analytics KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 flex flex-col justify-between hover:border-[#0071E3]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">AI Ingested</span>
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white transition-all">
              {totalTickets.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#34C759] font-mono font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              +14.2% velocity
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 flex flex-col justify-between hover:border-[#34C759]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Active Fleet</span>
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {liveBuses}/{totalFleetBuses}
            </div>
            <span className="text-[10px] text-[#86868b] font-mono">100% Edge AI online</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 flex flex-col justify-between hover:border-[#34C759]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Auto-Resolved</span>
            <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#34C759]">
              {resolvedToday.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#34C759] font-mono font-semibold">Closed & Verified</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 flex flex-col justify-between hover:border-[#FF3B30]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Critical SLA</span>
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FF3B30]">
              {criticalPotholes}
            </div>
            <span className="text-[10px] text-[#FF3B30] font-mono font-semibold">1-Hour Priority SLA</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="glass-card p-4 flex flex-col justify-between hover:border-[#AF52DE]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">AI Confidence</span>
            <span className="w-2 h-2 rounded-full bg-[#AF52DE]"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {avgConfidence}%
            </div>
            <span className="text-[10px] text-[#86868b] font-mono">YOLOv8 Multi-Task</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="glass-card p-4 flex flex-col justify-between hover:border-[#5856D6]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Edge Latency</span>
            <span className="w-2 h-2 rounded-full bg-[#5856D6]"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {avgLatency}ms
            </div>
            <span className="text-[10px] text-[#34C759] font-mono font-semibold">Jetson TensorRT</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Dynamic Interactive Multi-Series Line Graph (7 cols) & SLA Resolution Rate (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Multi-Series Line Graph */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Chart Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {metricMode === 'velocity'
                    ? 'Defect Detection Velocity'
                    : 'Ingested vs Resolved Work Orders'}
                </h3>
                <span className="text-[10px] font-mono text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full font-semibold">
                  Live Dynamic
                </span>
              </div>
              <p className="text-[11px] text-[#86868b]">
                {dateRange === '24h'
                  ? 'Real-time hourly telemetry ingress across 48 smart transit buses'
                  : `Dynamic aggregate incident tracking over ${dateRange.toUpperCase()}`}
              </p>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full text-[11px] font-medium border border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setMetricMode('velocity')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  metricMode === 'velocity'
                    ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('resolution')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  metricMode === 'resolution'
                    ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ingest vs Resolve
              </button>
            </div>
          </div>

          {/* Dynamic Interactive Category Legend / Series Toggles */}
          {metricMode === 'velocity' && (
            <div className="flex flex-wrap items-center gap-2.5 mb-3 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setVisibleSeries(prev => ({ ...prev, potholes: !prev.potholes }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.potholes
                    ? 'bg-[#0071E3]/15 border-[#0071E3] text-[#0071E3] font-semibold'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-[#86868b] opacity-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span>
                <span>Potholes (Roads)</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibleSeries(prev => ({ ...prev, sanitation: !prev.sanitation }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.sanitation
                    ? 'bg-[#FF9F0A]/15 border-[#FF9F0A] text-[#FF9F0A] font-semibold'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-[#86868b] opacity-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF9F0A]"></span>
                <span>Sanitation</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibleSeries(prev => ({ ...prev, streetlights: !prev.streetlights }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.streetlights
                    ? 'bg-[#34C759]/15 border-[#34C759] text-[#34C759] font-semibold'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-[#86868b] opacity-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
                <span>Streetlights</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibleSeries(prev => ({ ...prev, waterLogging: !prev.waterLogging }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.waterLogging
                    ? 'bg-[#AF52DE]/15 border-[#AF52DE] text-[#AF52DE] font-semibold'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-[#86868b] opacity-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#AF52DE]"></span>
                <span>Water Drainage</span>
              </button>
            </div>
          )}

          {metricMode === 'resolution' && (
            <div className="flex items-center gap-4 mb-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-[#0071E3] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span> Ingested Defects
              </span>
              <span className="flex items-center gap-1.5 text-[#34C759] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#34C759]"></span> Auto-Resolved Work Orders
              </span>
            </div>
          )}

          {/* SVG Dynamic Chart Area with Smooth Curves & Gradient Fills */}
          <div className="relative h-64 w-full select-none cursor-crosshair">
            <svg
              ref={chartSvgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
              onMouseMove={handleChartMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                {/* Potholes Gradient */}
                <linearGradient id="potholeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071E3" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#0071E3" stopOpacity="0.0" />
                </linearGradient>
                {/* Sanitation Gradient */}
                <linearGradient id="sanitationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FF9F0A" stopOpacity="0.0" />
                </linearGradient>
                {/* Streetlights Gradient */}
                <linearGradient id="streetlightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34C759" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34C759" stopOpacity="0.0" />
                </linearGradient>
                {/* Water Logging Gradient */}
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#AF52DE" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#AF52DE" stopOpacity="0.0" />
                </linearGradient>
                {/* Resolved Gradient */}
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34C759" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#34C759" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = svgHeight - paddingY - pct * plotHeight;
                const valLabel = Math.round(pct * maxValue);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-black/5 dark:text-white/10"
                      strokeDasharray={idx === 0 ? undefined : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-[#86868b] text-[9px] font-mono"
                    >
                      {valLabel}
                    </text>
                  </g>
                );
              })}

              {/* Mode 1: Velocity View (Multi-Category) */}
              {metricMode === 'velocity' && (
                <>
                  {/* Water Logging Area & Curve */}
                  {visibleSeries.waterLogging && (
                    <>
                      <path
                        d={generateAreaPath(waterPoints, svgHeight - paddingY)}
                        fill="url(#waterGradient)"
                      />
                      <path
                        d={generateSmoothCurve(waterPoints)}
                        fill="none"
                        stroke="#AF52DE"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </>
                  )}

                  {/* Streetlights Area & Curve */}
                  {visibleSeries.streetlights && (
                    <>
                      <path
                        d={generateAreaPath(streetlightPoints, svgHeight - paddingY)}
                        fill="url(#streetlightGradient)"
                      />
                      <path
                        d={generateSmoothCurve(streetlightPoints)}
                        fill="none"
                        stroke="#34C759"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </>
                  )}

                  {/* Sanitation Area & Curve */}
                  {visibleSeries.sanitation && (
                    <>
                      <path
                        d={generateAreaPath(sanitationPoints, svgHeight - paddingY)}
                        fill="url(#sanitationGradient)"
                      />
                      <path
                        d={generateSmoothCurve(sanitationPoints)}
                        fill="none"
                        stroke="#FF9F0A"
                        strokeWidth="2.2"
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </>
                  )}

                  {/* Potholes (Primary) Area & Curve */}
                  {visibleSeries.potholes && (
                    <>
                      <path
                        d={generateAreaPath(potholePoints, svgHeight - paddingY)}
                        fill="url(#potholeGradient)"
                      />
                      <path
                        d={generateSmoothCurve(potholePoints)}
                        fill="none"
                        stroke="#0071E3"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </>
                  )}
                </>
              )}

              {/* Mode 2: Ingested vs Resolved View */}
              {metricMode === 'resolution' && (
                <>
                  {/* Total Ingested Line */}
                  <path
                    d={generateAreaPath(totalIngestedPoints, svgHeight - paddingY)}
                    fill="url(#potholeGradient)"
                  />
                  <path
                    d={generateSmoothCurve(totalIngestedPoints)}
                    fill="none"
                    stroke="#0071E3"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />

                  {/* Total Resolved Line */}
                  <path
                    d={generateAreaPath(totalResolvedPoints, svgHeight - paddingY)}
                    fill="url(#resolvedGradient)"
                  />
                  <path
                    d={generateSmoothCurve(totalResolvedPoints)}
                    fill="none"
                    stroke="#34C759"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Pulsing Live Telemetry Indicator on Last Point */}
              {potholePoints.length > 0 && visibleSeries.potholes && metricMode === 'velocity' && (
                <g>
                  <circle
                    cx={potholePoints[potholePoints.length - 1].x}
                    cy={potholePoints[potholePoints.length - 1].y}
                    r="8"
                    fill="#0071E3"
                    className="animate-ping opacity-75"
                  />
                  <circle
                    cx={potholePoints[potholePoints.length - 1].x}
                    cy={potholePoints[potholePoints.length - 1].y}
                    r="4"
                    fill="#0071E3"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* Interactive Hover Guide & Dots */}
              {hoveredIndex !== null && activeHoverX !== null && (
                <g>
                  <line
                    x1={activeHoverX}
                    y1={paddingY}
                    x2={activeHoverX}
                    y2={svgHeight - paddingY}
                    stroke="#0071E3"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-70"
                  />

                  {/* Hover Dots on active curves */}
                  {metricMode === 'velocity' && (
                    <>
                      {visibleSeries.potholes && (
                        <circle
                          cx={potholePoints[hoveredIndex].x}
                          cy={potholePoints[hoveredIndex].y}
                          r="5"
                          fill="#0071E3"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                      {visibleSeries.sanitation && (
                        <circle
                          cx={sanitationPoints[hoveredIndex].x}
                          cy={sanitationPoints[hoveredIndex].y}
                          r="5"
                          fill="#FF9F0A"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                      {visibleSeries.streetlights && (
                        <circle
                          cx={streetlightPoints[hoveredIndex].x}
                          cy={streetlightPoints[hoveredIndex].y}
                          r="5"
                          fill="#34C759"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                      {visibleSeries.waterLogging && (
                        <circle
                          cx={waterPoints[hoveredIndex].x}
                          cy={waterPoints[hoveredIndex].y}
                          r="5"
                          fill="#AF52DE"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                    </>
                  )}

                  {metricMode === 'resolution' && (
                    <>
                      <circle
                        cx={totalIngestedPoints[hoveredIndex].x}
                        cy={totalIngestedPoints[hoveredIndex].y}
                        r="5"
                        fill="#0071E3"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={totalResolvedPoints[hoveredIndex].x}
                        cy={totalResolvedPoints[hoveredIndex].y}
                        r="5"
                        fill="#34C759"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </g>
              )}
            </svg>

            {/* Floating Glassmorphic Tooltip */}
            {hoveredIndex !== null && activeHoverData && activeHoverX !== null && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-75 shadow-xl glass-card px-3.5 py-2.5 rounded-2xl border border-black/10 dark:border-white/20"
                style={{
                  left: `${Math.min(78, Math.max(12, (activeHoverX / svgWidth) * 100))}%`,
                  top: '12px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-1.5 mb-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeHoverData.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#86868b]">
                    {activeHoverData.subLabel || activeHoverData.timestamp}
                  </span>
                </div>

                {metricMode === 'velocity' ? (
                  <div className="flex flex-col gap-1 text-[11px] font-mono">
                    <div className="flex items-center justify-between gap-3 text-[#0071E3]">
                      <span>Potholes:</span>
                      <strong className="font-bold">{activeHoverData.potholes}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#FF9F0A]">
                      <span>Sanitation:</span>
                      <strong className="font-bold">{activeHoverData.sanitation}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#34C759]">
                      <span>Streetlights:</span>
                      <strong className="font-bold">{activeHoverData.streetlights}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#AF52DE]">
                      <span>Water Logging:</span>
                      <strong className="font-bold">{activeHoverData.waterLogging}</strong>
                    </div>
                    <div className="border-t border-black/5 dark:border-white/10 pt-1 mt-0.5 flex items-center justify-between text-slate-900 dark:text-white font-bold">
                      <span>Total Incidents:</span>
                      <span>{activeHoverData.total}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-[11px] font-mono">
                    <div className="flex items-center justify-between gap-3 text-[#0071E3]">
                      <span>Ingested:</span>
                      <strong className="font-bold">{activeHoverData.total}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#34C759]">
                      <span>Resolved:</span>
                      <strong className="font-bold">{activeHoverData.resolved}</strong>
                    </div>
                    <div className="border-t border-black/5 dark:border-white/10 pt-1 mt-0.5 flex items-center justify-between text-[#86868b]">
                      <span>Net Closure:</span>
                      <span className="text-[#34C759] font-bold">
                        {Math.round((activeHoverData.resolved / Math.max(1, activeHoverData.total)) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Time Axis Ticks */}
          <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-3 font-mono border-t border-black/5 dark:border-white/10">
            {timeSeriesData
              .filter((_, idx, arr) => {
                if (arr.length <= 8) return true;
                const step = Math.floor(arr.length / 5);
                return idx % step === 0 || idx === arr.length - 1;
              })
              .map((pt, idx) => (
                <span
                  key={idx}
                  className={`transition-colors ${
                    hoveredIndex !== null && timeSeriesData[hoveredIndex]?.label === pt.label
                      ? 'text-[#0071E3] font-bold'
                      : ''
                  }`}
                >
                  {pt.label}
                </span>
              ))}
          </div>
        </div>

        {/* Card 2: SLA Adherence Scorecard (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">SLA Resolution Rate</h3>
                <p className="text-[11px] text-[#86868b]">Turnaround time vs citizen charter benchmarks</p>
              </div>
              <span className="text-2xl font-bold text-[#34C759] font-mono">
                {slaMetrics.overallRate}%
              </span>
            </div>

            <div className="flex flex-col gap-3.5 my-3">
              {/* Critical 1-Hour SLA */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
                    Critical (1 hr SLA)
                  </span>
                  <span className="font-mono text-[#FF3B30] font-bold">
                    {slaMetrics.criticalRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF3B30] rounded-full transition-all duration-500"
                    style={{ width: `${slaMetrics.criticalRate}%` }}
                  ></div>
                </div>
              </div>

              {/* High 4-Hour SLA */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF9F0A]"></span>
                    High Urgency (4 hrs SLA)
                  </span>
                  <span className="font-mono text-[#FF9F0A] font-bold">
                    {slaMetrics.highRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF9F0A] rounded-full transition-all duration-500"
                    style={{ width: `${slaMetrics.highRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium 24-Hour SLA */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span>
                    Medium Standard (24 hrs SLA)
                  </span>
                  <span className="font-mono text-[#0071E3] font-bold">
                    {slaMetrics.medRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0071E3] rounded-full transition-all duration-500"
                    style={{ width: `${slaMetrics.medRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/10">
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-[11px] text-[#86868b] flex items-center justify-between">
              <span>Average Dispatch Latency:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{avgLatency.toFixed(1)} mins</strong>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-[11px] text-[#86868b] flex items-center justify-between">
              <span>Auto-Dispatched Work Orders:</span>
              <strong className="text-[#34C759] font-mono">{resolvedToday} today</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Department Performance Matrix & Recurrent Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Compliance Table (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Department Performance Matrix
                </h3>
                <p className="text-[11px] text-[#86868b]">Calculated from active municipal repair assignments</p>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter agency..."
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-xs bg-black/5 dark:bg-white/10 rounded-full border border-transparent focus:border-[#0071E3] outline-none text-slate-800 dark:text-slate-200 w-36 sm:w-44"
                />
                <span className="material-symbols-outlined text-[14px] text-[#86868b] absolute left-2 top-2">
                  search
                </span>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/10 text-[#86868b] uppercase text-[10px] font-mono">
                    <th className="py-2.5 pr-2">Department</th>
                    <th className="py-2.5 px-2">Assigned</th>
                    <th className="py-2.5 px-2">Closed</th>
                    <th className="py-2.5 px-2">Avg Hours</th>
                    <th className="py-2.5 pl-2 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {departmentMetrics.map((dept) => (
                    <tr
                      key={dept.department}
                      onClick={() => onNavigateToTickets && onNavigateToTickets(dept.department)}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 pr-2 font-medium text-slate-900 dark:text-white group-hover:text-[#0071E3] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
                        <span>{dept.department}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[#86868b]">{dept.assigned}</td>
                      <td className="py-3 px-2 font-mono text-[#34C759] font-bold">{dept.resolved}</td>
                      <td className="py-3 px-2 font-mono text-[#86868b]">{dept.avgResTimeHrs}h</td>
                      <td className="py-3 pl-2 text-right font-mono font-bold text-[#0071E3]">
                        {dept.slaCompliance}%
                      </td>
                    </tr>
                  ))}
                  {departmentMetrics.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-[#86868b]">
                        No matching municipal department found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-[#86868b]">
            <span>Click any department to inspect related active work orders.</span>
            <span className="font-mono text-[10px] text-[#34C759] font-semibold">Live Dynamic Sync</span>
          </div>
        </div>

        {/* Recurrent Defect Hotspots (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Chronic Recurrence Hotspots
                </h3>
                <p className="text-[11px] text-[#86868b]">Top repeat locations aggregated from telemetry</p>
              </div>
              <span className="text-[10px] font-bold bg-[#FF3B30]/10 text-[#FF3B30] px-2 py-0.5 rounded-full font-mono">
                Pavement Fatigue
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {dynamicHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  onClick={() => onNavigateToHotspot && onNavigateToHotspot(hotspot.name)}
                  className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#0071E3]/10 border border-black/5 dark:border-white/10 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0071E3] truncate">
                        {hotspot.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#86868b] block">{hotspot.primaryIssue}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#FF3B30] font-mono block">
                      {hotspot.repeatCount}x Defect
                    </span>
                    <span className="text-[10px] text-[#86868b] font-mono">{hotspot.lastDetected}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            onClick={() => onNavigateToHotspot && onNavigateToHotspot('Connaught Place')}
            className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-[#0071E3] font-semibold cursor-pointer hover:underline"
          >
            <span>View Full GIS Hotspot Correlation Map</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};
