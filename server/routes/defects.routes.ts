import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { DefectItem, TicketStatus } from '../types/serverTypes';
import { RulesEngineService } from '../services/rulesEngine.service';
import { AutoAssignmentService } from '../services/autoAssignment.service';
import { wsService } from '../services/websocket.service';
import { ASSETS } from '../db/seed';

const router = Router();

// GET /api/defects - List defects with filtering & search
router.get('/', (req: Request, res: Response) => {
  const { category, severity, status, ward, search, page, limit } = req.query;

  let defects = db.getDefects({
    category: category as string,
    severity: severity as string,
    status: status as string,
    ward: ward as string,
    search: search as string
  });

  const total = defects.length;
  const pageNum = parseInt((page as string) || '1', 10);
  const pageSize = parseInt((limit as string) || '50', 10);
  const startIndex = (pageNum - 1) * pageSize;
  const paginated = defects.slice(startIndex, startIndex + pageSize);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});

// GET /api/defects/:id - Get defect by id or ticketNumber
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const defect = db.getDefectById(id);

  if (!defect) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found with identifier: ${id}` }
    });
  }

  res.json({ success: true, data: defect });
});

// POST /api/defects - Create new defect ticket with auto-routing
router.post('/', (req: Request, res: Response) => {
  const body = req.body;

  if (!body.title || !body.locationName) {
    return res.status(400).json({
      success: false,
      error: { message: 'Title and locationName are required fields.' }
    });
  }

  // Evaluate Auto-routing rule
  const routing = RulesEngineService.evaluateDefect(body);
  const ticketCount = db.getDefects().length + 1;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = body.ticketNumber || `TK-${8920 + ticketCount}`;
  const now = new Date();

  const newDefect: DefectItem = {
    id: `def-${Date.now()}-${randomSuffix}`,
    ticketNumber,
    title: body.title,
    category: body.category || routing.matchedRule?.department === 'Roads & Bridges' ? 'Potholes' : (body.category || 'Potholes'),
    severity: body.severity || routing.severity,
    confidence: body.confidence || 94.5,
    locationName: body.locationName,
    coordinates: body.coordinates || {
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
      formatted: '28.6139° N, 77.2090° E'
    },
    ward: body.ward || 'Ward C - Central',
    timestamp: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + `, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    timeAgo: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    imageUrl: body.imageUrl || ASSETS.potholeClose,
    hasOverlay: body.hasOverlay ?? true,
    busId: body.busId || 'DTC-BUS-402',
    department: body.department || routing.department,
    slaRemaining: routing.slaRemaining,
    isOverdue: false,
    description: body.description || 'Automated defect ticket logged into municipal triage system.',
    status: body.status || 'NEW',
    assignedTo: body.assignedTo || (routing.assignedTeam ? { name: routing.assignedTeam, team: routing.department } : undefined),
    comments: [
      {
        id: `c-ai-${Date.now()}`,
        author: 'Nagar Drishti AI Core',
        role: 'Computer Vision & Triage',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Automated triage executed. ${routing.reasoning}`
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: `System AI (${body.busId || 'BUS-402'})`, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
      { title: 'Verified', subtitle: 'Auto-Routing Engine', time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
      { title: 'Ticket Created', subtitle: `${ticketNumber} (SLA: ${routing.slaRemaining})`, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true, active: true },
      { title: 'Assigned', subtitle: routing.department, time: 'Pending', completed: false },
      { title: 'In Progress', subtitle: 'Field crew dispatch', time: 'Pending', completed: false },
      { title: 'Resolved', subtitle: 'Field sign-off', time: 'Pending', completed: false }
    ]
  };

  const created = db.createDefect(newDefect);
  wsService.broadcast('TICKET_UPDATE', created);

  res.status(201).json({
    success: true,
    data: created,
    routingResult: routing
  });
});

// PATCH /api/defects/:id/status - Update status and append timeline
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, officerName } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'status field is required.' }
    });
  }

  const existing = db.getDefectById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found with identifier: ${id}` }
    });
  }

  const updatedTimeline = (existing.timeline || []).map((step) => {
    if (status === 'ASSIGNED' && step.title === 'Assigned') {
      return { ...step, completed: true, active: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    if (status === 'IN_PROGRESS' && (step.title === 'Assigned' || step.title === 'In Progress')) {
      return { ...step, completed: true, active: step.title === 'In Progress', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    if ((status === 'RESOLVED' || status === 'VERIFIED_CLOSED') && (step.title === 'Resolved' || step.title === 'In Progress' || step.title === 'Assigned')) {
      return { ...step, completed: true, active: step.title === 'Resolved', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    return step;
  });

  const comments = [...(existing.comments || [])];
  if (note) {
    comments.push({
      id: `c-${Date.now()}`,
      author: officerName || 'Duty Officer',
      role: 'Command Staff',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: note
    });
  }

  const updated = db.updateDefect(id, {
    status: status as TicketStatus,
    timeline: updatedTimeline,
    comments,
    slaRemaining: status === 'RESOLVED' || status === 'VERIFIED_CLOSED' ? 'Resolved' : existing.slaRemaining
  });

  if (updated) {
    wsService.broadcast('TICKET_UPDATE', updated);
  }

  res.json({ success: true, data: updated });
});

// POST /api/defects/:id/comments - Add officer comment
router.post('/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, author, role, avatar } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: { message: 'text is required.' }
    });
  }

  const existing = db.getDefectById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found: ${id}` }
    });
  }

  const newComment = {
    id: `cmt-${Date.now()}`,
    author: author || 'Field Officer',
    role: role || 'Zonal Officer',
    avatar: avatar || ASSETS.sharmaAvatar,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text
  };

  const updated = db.updateDefect(id, {
    comments: [...(existing.comments || []), newComment]
  });

  if (updated) {
    wsService.broadcast('TICKET_UPDATE', updated);
  }

  res.status(201).json({ success: true, data: newComment, defect: updated });
});

// PUT /api/defects/:id/assign - Assign work order to crew
router.put('/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { crewName, crewTeam, crewLead } = req.body;

  if (!crewName || !crewTeam) {
    return res.status(400).json({
      success: false,
      error: { message: 'crewName and crewTeam are required fields.' }
    });
  }

  const existing = db.getDefectById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found with identifier: ${id}` }
    });
  }

  // Update assignedTo and mark status as ASSIGNED
  const assignmentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const updatedTimeline = (existing.timeline || []).map((step) => {
    if (step.title === 'Assigned') {
      return { ...step, completed: true, active: true, time: assignmentTimestamp };
    }
    return step;
  });

  const updated = db.updateDefect(id, {
    assignedTo: {
      name: crewName,
      team: crewTeam,
      avatar: crewLead?.avatar
    },
    status: 'ASSIGNED',
    timeline: updatedTimeline,
    comments: [
      ...(existing.comments || []),
      {
        id: `c-assign-${Date.now()}`,
        author: 'Work Order System',
        role: 'Automated Assignment',
        time: assignmentTimestamp,
        text: `Work order assigned to ${crewName} from ${crewTeam}`
      }
    ]
  });

  if (updated) {
    wsService.broadcast('TICKET_UPDATE', updated);
    wsService.broadcast('WORK_ORDER_ASSIGNED', { ticketId: id, crew: crewName, team: crewTeam });
  }

  res.json({ success: true, data: updated });
});

interface DefectDataset {
  id: string;
  name: string;
  folder: string;
  videos: number;
  totalSize: string;
  date: string;
  description: string;
  videoUrls: string[];
  mediaItems?: Array<{
    title: string;
    type: 'video' | 'image';
    url: string;
    tag?: string;
    subtitle?: string;
  }>;
}

// GET /api/defects/:id/datasets - Get video datasets related to location/incident
router.get('/:id/datasets', (req: Request, res: Response) => {
  const { id } = req.params;
  const defect = db.getDefectById(id);

  if (!defect) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found with identifier: ${id}` }
    });
  }

  const datasetBase = path.join(process.cwd(), 'datasets', 'archive', 'videos_without_audio');
  const collectVideoFiles = (directory: string): string[] => {
    if (!fs.existsSync(directory)) return [];

    const results: string[] = [];
    const walk = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }
        if (/\.(mp4|mov|avi|mkv|webm)$/i.test(entry.name)) {
          results.push(fullPath);
        }
      }
    };

    walk(directory);
    return results;
  };

  const datasetFolders = fs.existsSync(datasetBase)
    ? fs.readdirSync(datasetBase, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : [];

  const datasets: DefectDataset[] = datasetFolders.map((folderName, idx) => {
    const folderPath = path.join(datasetBase, folderName);
    const videoFiles = collectVideoFiles(folderPath)
      .sort()
      .map((filePath) => {
        const relativePath = path.relative(folderPath, filePath).split(path.sep).join('/');
        return `/datasets/archive/videos_without_audio/${folderName}/${relativePath}`;
      });

    const totalBytes = videoFiles.reduce((sum, fileUrl) => {
      const absolutePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
      try {
        return sum + fs.statSync(absolutePath).size;
      } catch {
        return sum;
      }
    }, 0);

    const formatSize = (bytes: number) => {
      if (bytes <= 0) return '0MB';
      const units = ['B', 'KB', 'MB', 'GB'];
      let value = bytes;
      let unitIndex = 0;
      while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
      }
      return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
    };

    const label = folderName.replace(/[-_]/g, ' ');

    return {
      id: `dataset-${idx + 1}`,
      name: `${label.replace(/\b\w/g, (char) => char.toUpperCase())}`,
      folder: folderName,
      videos: videoFiles.length,
      totalSize: formatSize(totalBytes),
      date: new Date(`2023-${folderName.includes('June') ? '06' : '07'}-01`).toISOString().slice(0, 10),
      description: videoFiles.length > 0
        ? `CCTV footage collection for ${defect.locationName || 'reported incident'} review.`
        : 'Incident review footage archive.',
      videoUrls: videoFiles.slice(0, 3)
    };
  });

  if (datasets.length === 0) {
    if (defect.category === 'Sanitation' || defect.ticketNumber === 'TK-8799') {
      datasets.push({
        id: 'dataset-sani-309',
        name: 'DTC-BUS-309 Rear Camera & Sanitation AI Stream',
        folder: 'DTC-BUS-309/nehrupark-gate3',
        videos: 3,
        totalSize: '210MB',
        date: '2023-10-24',
        description: '12-second continuous rear dashcam clip capturing overflowing manhole NEH-14G, ~3m effluent spread on walkway, pedestrian detour, and Edge AI yellow bounding box.',
        videoUrls: ['/assets/videos/sewer_overflow_clip.mp4'],
        mediaItems: [
          {
            title: 'Continuous Rear Dashcam MP4 Recording (12s)',
            type: 'video',
            url: '/assets/videos/sewer_overflow_clip.mp4',
            tag: 'VIDEO CLIP',
            subtitle: 'Rear bus POV at 24 km/h, receding perspective, effluent spill & ticket banner'
          },
          {
            title: 'DTC-BUS-309 Rear Dashcam Detection Frame',
            type: 'image',
            url: '/assets/defects/sewer_overflow_dashcam.jpg',
            tag: 'DASHCAM STILL',
            subtitle: 'Rear view: Nehru Park Gate 3, 3m overflow radius, Yellow AI box (89.0% Conf)'
          },
          {
            title: 'Macro Defect Inspection Photo (Displaced Manhole NEH-14G)',
            type: 'image',
            url: '/assets/defects/sewer_overflow_thumb.jpg',
            tag: 'MACRO CARD',
            subtitle: 'Close-up evidence card: Dislodged circular cover, sludge stain & walkway pooling'
          }
        ]
      });
    } else if (defect.category === 'Water Logging' || defect.ticketNumber === 'TK-8855') {
      datasets.push({
        id: 'dataset-hyd-204',
        name: 'DTC-BUS-204 Left-Side Camera & Hydraulic Telemetry Stream',
        folder: 'DTC-BUS-204/civil-lines-distcourt',
        videos: 3,
        totalSize: '235MB',
        date: '2023-10-24',
        description: '12-second side dashcam recording capturing 600mm ruptured feeder flange, 2m muddy water geyser cascade (~800L/min), 1.8m road flood, detouring vehicles, and Edge AI bounding box.',
        videoUrls: ['/assets/videos/pipe_burst_dashcam_clip.mp4'],
        mediaItems: [
          {
            title: 'Continuous Side Dashcam MP4 Recording (12s)',
            type: 'video',
            url: '/assets/videos/pipe_burst_dashcam_clip.mp4',
            tag: 'VIDEO CLIP',
            subtitle: 'Left-side bus POV at 18 km/h, 2m geyser spray, flood detour & auto-ticket alert'
          },
          {
            title: 'DTC-BUS-204 Left-Side Camera Detection Frame',
            type: 'image',
            url: '/assets/defects/pipe_burst_dashcam.jpg',
            tag: 'DASHCAM STILL',
            subtitle: 'Side view: District Court Gate 1, 1.8m flood extent, Edge AI box (96.5% Conf)'
          },
          {
            title: 'Macro Defect Inspection Photo (Ruptured Flange Crater)',
            type: 'image',
            url: '/assets/defects/pipe_burst_thumb.jpg',
            tag: 'MACRO CARD',
            subtitle: 'Close-up evidence card: 600mm fractured collar, hydraulic plume & danger barricade'
          }
        ]
      });
    } else if (defect.category === 'Streetlights' || defect.ticketNumber === 'TK-8890') {
      datasets.push({
        id: 'dataset-lgt-401',
        name: 'DTC-BUS-118 Night Dashcam & Telemetry Stream',
        folder: 'DTC-BUS-118/sec14-lgt401',
        videos: 3,
        totalSize: '215MB',
        date: '2023-10-24',
        description: '12-second continuous night dashcam clip capturing tilted pole, dangling swaying luminaire, electrical micro-arcing, and automated safety slowdown.',
        videoUrls: ['/assets/videos/streetlight_dashcam_clip.mp4'],
        mediaItems: [
          {
            title: 'Continuous Dashcam MP4 Recording (12s)',
            type: 'video',
            url: '/assets/videos/streetlight_dashcam_clip.mp4',
            tag: 'VIDEO CLIP',
            subtitle: 'Night approach, swaying luminaire head, AI hazard alert & safety crawl'
          },
          {
            title: 'DTC-BUS-118 Front Dashcam POV (Sector 14 Main Ave)',
            type: 'image',
            url: '/assets/defects/dangling_streetlight_dashcam.jpg',
            tag: 'DASHCAM STILL',
            subtitle: 'High-resolution night dashcam capture showing 45° pole tilt'
          },
          {
            title: 'Macro Defect Inspection Photo (Pole LGT-401)',
            type: 'image',
            url: '/assets/defects/dangling_streetlight_thumb.jpg',
            tag: 'MACRO CARD',
            subtitle: 'Close-up evidence card: 30cm live wire & luminaire drop'
          }
        ]
      });
    } else if (defect.category === 'Potholes' || defect.ticketNumber === 'TK-8921') {
      datasets.push({
        id: 'dataset-pth-402',
        name: 'DTC-BUS-402 YOLO-v8 Forward Dashcam Clip',
        folder: 'DTC-BUS-402/mgroad-pillar42',
        videos: 3,
        totalSize: '240MB',
        date: '2023-10-24',
        description: '15-second continuous forward dashcam clip at 34 km/h capturing crater defect with YOLO-v8 bounding box and HUD telemetry.',
        videoUrls: ['/assets/videos/pothole_dashcam_clip.mp4'],
        mediaItems: [
          {
            title: 'Continuous Dashcam MP4 Recording (15s)',
            type: 'video',
            url: '/assets/videos/pothole_dashcam_clip.mp4',
            tag: 'VIDEO CLIP',
            subtitle: 'Bus approach at 34 km/h with active YOLO-v8 detection'
          },
          {
            title: 'High-Resolution Dashcam Detection Frame',
            type: 'image',
            url: '/assets/defects/severe_pothole_dashcam.jpg',
            tag: 'DASHCAM STILL',
            subtitle: 'Defect crater at Metro Pillar 42 with HUD telemetry'
          },
          {
            title: 'Macro Road Surface Inspection Capture',
            type: 'image',
            url: '/assets/defects/severe_pothole_thumb.jpg',
            tag: 'MACRO CARD',
            subtitle: 'Crater profile: 45cm width, 15cm depth, subgrade exposed'
          }
        ]
      });
    }
  }

  res.json({
    success: true,
    data: datasets,
    meta: {
      totalDatasets: datasets.length,
      ticketId: id,
      location: defect.locationName
    }
  });
});

// POST /api/defects/auto/assign-single/:id - Auto-assign a specific ticket
router.post('/auto/assign-single/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { strategy } = req.body;

  const defect = db.getDefectById(id);
  if (!defect) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found: ${id}` }
    });
  }

  if (defect.status !== 'NEW') {
    return res.status(400).json({
      success: false,
      error: { message: `Ticket ${id} is not in NEW status. Current status: ${defect.status}` }
    });
  }

  const assignment = AutoAssignmentService.autoAssignWorkOrder(defect, strategy);

  if (!assignment.success || !assignment.crew) {
    return res.status(400).json({
      success: false,
      error: { message: assignment.reasoning }
    });
  }

  // Apply assignment
  const assignmentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updatedTimeline = (defect.timeline || []).map((step) => {
    if (step.title === 'Assigned') {
      return { ...step, completed: true, active: true, time: assignmentTimestamp };
    }
    return step;
  });

  const updated = db.updateDefect(id, {
    assignedTo: {
      name: assignment.crew.name,
      team: assignment.crew.team,
      avatar: assignment.crew.avatar
    },
    status: 'ASSIGNED',
    timeline: updatedTimeline,
    comments: [
      ...(defect.comments || []),
      {
        id: `c-auto-${Date.now()}`,
        author: 'Auto Assignment Engine',
        role: 'Autonomous Dispatcher',
        time: assignmentTimestamp,
        text: `Automatically assigned to ${assignment.crew.name} from ${assignment.crew.team}. ${assignment.reasoning}`
      }
    ]
  });

  if (updated) {
    wsService.broadcast('TICKET_UPDATE', updated);
    wsService.broadcast('WORK_ORDER_ASSIGNED', {
      ticketId: id,
      crew: assignment.crew.name,
      team: assignment.crew.team,
      auto: true
    });
  }

  res.json({
    success: true,
    data: updated,
    assignment: {
      crew: assignment.crew.name,
      team: assignment.crew.team,
      reasoning: assignment.reasoning
    }
  });
});

// POST /api/defects/auto/assign-all - Auto-assign all NEW tickets
router.post('/auto/assign-all', (req: Request, res: Response) => {
  const { strategy } = req.body;

  const result = AutoAssignmentService.assignAllPendingTickets();

  res.json({
    success: true,
    data: result,
    summary: {
      totalProcessed: result.assigned + result.failed,
      successfulAssignments: result.assigned,
      failedAssignments: result.failed,
      successRate: ((result.assigned / (result.assigned + result.failed)) * 100).toFixed(1) + '%'
    }
  });
});

// GET /api/defects/auto/crew-metrics - Get crew performance metrics
router.get('/auto/crew-metrics', (req: Request, res: Response) => {
  const metrics = AutoAssignmentService.getCrewMetrics();

  res.json({
    success: true,
    data: metrics,
    summary: {
      totalCrews: metrics.length,
      availableCrews: metrics.filter((m) => m.availability === 'AVAILABLE').length,
      busyCrews: metrics.filter((m) => m.availability === 'BUSY').length,
      totalActiveTickets: metrics.reduce((sum, m) => sum + m.activeTickets, 0),
      avgResponseTime: (metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length).toFixed(1) + ' min'
    }
  });
});

// POST /api/defects/:id/auto-assign - Auto-assign with detailed response
router.post('/:id/auto-assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { method = 'intelligent', priority = 'balanced' } = req.body;

  const defect = db.getDefectById(id);
  if (!defect) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found: ${id}` }
    });
  }

  const assignment = AutoAssignmentService.autoAssignWorkOrder(defect, { method: method as any, priority: priority as any });

  if (!assignment.success || !assignment.crew) {
    return res.status(400).json({
      success: false,
      error: { message: assignment.reasoning },
      defectInfo: { id, category: defect.category, severity: defect.severity }
    });
  }

  res.json({
    success: true,
    assignment: {
      crewId: assignment.crew.id,
      crewName: assignment.crew.name,
      team: assignment.crew.team,
      lead: assignment.crew.lead,
      phone: assignment.crew.phone,
      department: assignment.crew.department,
      reasoning: assignment.reasoning,
      method: method,
      priority: priority
    },
    defectInfo: {
      id,
      ticketNumber: defect.ticketNumber,
      category: defect.category,
      severity: defect.severity,
      status: defect.status
    }
  });
});

export default router;
