import { Router, Request, Response } from 'express';
import { GOV_TICKER_BULLETINS } from '../db/seed';

const router = Router();

export const PORTAL_SECTIONS = [
  {
    id: 'sec-my-nagar',
    headingHi: 'मेरी नागरिक सेवाएं एवं AI पहचान',
    headingEn: 'My Civic Services & Edge AI Detection',
    subheadingHi: 'शहरी बुनियादी ढांचे के स्वचालित निरीक्षण और नागरिक सुरक्षा सेवाएं',
    subheadingEn: 'Automated civic infrastructure scanning and defect logging services',
    icon: 'location_city',
    color: '#002D62',
    items: [
      {
        id: 'srv-potholes',
        titleHi: 'सड़क गड्ढे एवं दरारें',
        titleEn: 'Pothole & Surface Defects',
        descHi: 'बसों के AI कैमरों द्वारा गहराई व स्थान की स्वचालित पहचान',
        descEn: 'Edge AI camera depth analysis and geo-tagged coordinates',
        icon: 'warning',
        badge: 'AI Edge',
        targetView: 'dashboard',
        subCategory: 'Potholes',
        actionType: 'filter',
        filterKey: 'Potholes'
      },
      {
        id: 'srv-lights',
        titleHi: 'स्मार्ट स्ट्रीट लाइट ग्रिड',
        titleEn: 'Smart Streetlights & Poles',
        descHi: 'अंधेरे क्षेत्र, टूटे खंभे एवं एलईडी खराबी का त्वरित पता लगाना',
        descEn: 'Dark-spot detection and dangling luminaire rapid triage',
        icon: 'lightbulb',
        badge: 'Sensors Active',
        targetView: 'dashboard',
        subCategory: 'Streetlights',
        actionType: 'filter',
        filterKey: 'Streetlights'
      },
      {
        id: 'srv-water',
        titleHi: 'जलभराव एवं पाइपलाइन रिसाव',
        titleEn: 'Waterlogging & Main Leaks',
        descHi: 'मानसून जल निकासी अवरोध एवं मुख्य पाइपलाइन फटने की चेतावनी',
        descEn: 'Severe carriageway flooding and feeder burst escalation',
        icon: 'water_damage',
        badge: 'High Priority',
        targetView: 'dashboard',
        subCategory: 'Water Logging',
        actionType: 'filter',
        filterKey: 'Water Logging'
      },
      {
        id: 'srv-sanitation',
        titleHi: 'स्वच्छता एवं कचरा प्रबंधन',
        titleEn: 'Waste & Sanitation Overflow',
        descHi: 'ओवरफ्लो डस्टबिन, खुले कचरे के ढेर एवं सफाई वाहन ट्रैकिंग',
        descEn: 'Overflowing dumpsters and ward sanitation schedule sync',
        icon: 'delete_sweep',
        targetView: 'dashboard',
        subCategory: 'Sanitation',
        actionType: 'filter',
        filterKey: 'Sanitation'
      },
      {
        id: 'srv-encroach',
        titleHi: 'फुटपाथ अतिक्रमण एवं अवरोध',
        titleEn: 'Footpath & Lane Encroachment',
        descHi: 'पैदल यात्री मार्गों और लेन अवरोधों की स्वचालित पहचान',
        descEn: 'Pedestrian walkway blockages and unauthorized hoarding',
        icon: 'block',
        targetView: 'dashboard',
        subCategory: 'Encroachment',
        actionType: 'filter',
        filterKey: 'Encroachment'
      },
      {
        id: 'srv-livemap',
        titleHi: 'लाइव जीआईएस शहर मानचित्र',
        titleEn: 'City-Wide GIS Geospatial Map',
        descHi: 'रीयल-टाइम दोष हॉटस्पॉट, बस लोकेशन एवं वार्ड बाउंड्री',
        descEn: 'Real-time multi-layered geospatial defect map with filters',
        icon: 'map',
        badge: 'Interactive',
        targetView: 'live-map',
        subCategory: 'GIS',
        actionType: 'navigate'
      }
    ]
  },
  {
    id: 'sec-grievance-orders',
    headingHi: 'शिकायत निवारण एवं कार्य आदेश',
    headingEn: 'Grievance Redressal & Work Orders',
    subheadingHi: 'कानबन कार्यप्रवाह, फील्ड मरम्मत दल आवंटन और एसएलए ट्रैकिंग',
    subheadingEn: 'Kanban triage, automated crew dispatch and SLA compliance',
    icon: 'assignment',
    color: '#E65100',
    items: [
      {
        id: 'srv-tickets-all',
        titleHi: 'सभी कार्य आदेश (कानबन)',
        titleEn: 'All Work Orders & Triage',
        descHi: 'नया, आवंटित, प्रगति में और सत्यापित बंद मामलों की कतार',
        descEn: 'Triage board with priority queues and status transitions',
        icon: 'view_kanban',
        badge: 'Live Queue',
        targetView: 'tickets',
        subCategory: 'Work Orders',
        actionType: 'navigate'
      },
      {
        id: 'srv-rules',
        titleHi: 'स्मार्ट ऑटो-रूटिंग इंजन',
        titleEn: 'Auto-Routing & SLA Rules',
        descHi: 'गंभीरता और विभाग के आधार पर स्वतः मरम्मत दल आवंटन नियम',
        descEn: 'Configurable automated dispatch and escalation triggers',
        icon: 'alt_route',
        targetView: 'tickets',
        subCategory: 'Automation',
        actionType: 'navigate'
      },
      {
        id: 'srv-new-ticket',
        titleHi: 'नया दोष टिकट / कार्य आदेश',
        titleEn: 'Register New Defect Ticket',
        descHi: 'जीपीएस निर्देशांक और फोटो साक्ष्य के साथ मैन्युअल प्रविष्टि',
        descEn: 'Manual grievance logging with image upload and GPS pins',
        icon: 'add_task',
        badge: 'Fast Action',
        targetView: 'tickets',
        subCategory: 'Manual Log',
        actionType: 'modal'
      }
    ]
  },
  {
    id: 'sec-transit-safety',
    headingHi: 'सार्वजनिक परिवहन एवं यात्री सुरक्षा',
    headingEn: 'Transit & Bus Passenger Safety',
    subheadingHi: 'केबिन AI सर्विलांस, चालक व्यवहार और महिला सुरक्षा निगरानी',
    subheadingEn: 'Cabin AI video analytics, conductor audits and panic alarms',
    icon: 'directions_bus',
    color: '#002D62',
    items: [
      {
        id: 'srv-cabin-safety',
        titleHi: 'बस केबिन सुरक्षा शिकायतें',
        titleEn: 'Cabin Safety & Misconduct',
        descHi: 'ड्राइवर फोन उपयोग, महिला सुरक्षा अलार्म एवं किराया विवाद',
        descEn: 'Driver distraction alarms, passenger SOS, and fare disputes',
        icon: 'videocam',
        badge: 'Cabin AI',
        targetView: 'safety-complaints',
        subCategory: 'Safety',
        actionType: 'navigate'
      },
      {
        id: 'srv-fleet-monitor',
        titleHi: '48 कनेक्टेड ई-बस बेड़ा',
        titleEn: '48 AI Connected Fleet Hub',
        descHi: 'लाइव डैशकैम स्ट्रीम, जीपीएस सिग्नल और स्कैन किए गए किलोमीटर',
        descEn: 'Real-time telemetry, camera feed status, and depot sync',
        icon: 'local_shipping',
        badge: 'Telemetry',
        targetView: 'fleet',
        subCategory: 'Fleet',
        actionType: 'navigate'
      }
    ]
  },
  {
    id: 'sec-governance-analytics',
    headingHi: 'नगर प्रशासन एवं ब्लैकस्पॉट विश्लेषण',
    headingEn: 'Municipal Governance & Blackspot Analytics',
    subheadingHi: 'क्रॉस-एजेंसी समन्वय, एसएलए अनुपालन और दुर्घटना हॉटस्पॉट मैपिंग',
    subheadingEn: 'Cross-agency handoffs, SLA compliance metrics and accident blackspots',
    icon: 'analytics',
    color: '#2E7D32',
    items: [
      {
        id: 'srv-blackspots',
        titleHi: 'दुर्घटना ब्लैकस्पॉट विश्लेषण',
        titleEn: 'Accident Blackspot Hotspots',
        descHi: 'सड़क कॉरिडोर जोखिम स्तर, जनहानि डेटा व सुधारात्मक कार्य स्थिति',
        descEn: 'Fatal crash corridors, safety index scores, and engineering remedies',
        icon: 'car_crash',
        badge: 'NHAI / Traffic',
        targetView: 'accident-analytics',
        subCategory: 'Safety',
        actionType: 'navigate'
      },
      {
        id: 'srv-analytics',
        titleHi: 'वार्ड इंटेलिजेंस एवं एसएलए मेट्रिक्स',
        titleEn: 'Ward Intelligence & SLA Metrics',
        descHi: 'विभागवार समाधान दर, हॉटस्पॉट आवृत्ति और प्रतिक्रिया समय',
        descEn: 'Departmental resolution velocity and recurring hot-zone radar',
        icon: 'insights',
        targetView: 'analytics',
        subCategory: 'Analytics',
        actionType: 'navigate'
      },
      {
        id: 'srv-cross-agency',
        titleHi: 'अंतर-विभागीय समन्वय',
        titleEn: 'Multi-Agency Hand-off Grid',
        descHi: 'पीडब्ल्यूडी, जल बोर्ड, विद्युत विभाग और यातायात पुलिस समन्वय',
        descEn: 'Real-time inter-agency ticket transfer and nodal officer directory',
        icon: 'hub',
        badge: 'Multi-Agency',
        targetView: 'multi-agency',
        subCategory: 'Governance',
        actionType: 'navigate'
      }
    ]
  }
];

// GET /api/portal/sections - Get UIDAI styled service directory catalog
router.get('/sections', (req: Request, res: Response) => {
  res.json({ success: true, data: PORTAL_SECTIONS });
});

// GET /api/portal/bulletins - Get news bulletins ticker
router.get('/bulletins', (req: Request, res: Response) => {
  res.json({ success: true, data: GOV_TICKER_BULLETINS });
});

export default router;
