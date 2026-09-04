import { Router } from 'express';
import authRoutes from './auth.routes';
import defectsRoutes from './defects.routes';
import liveFeedRoutes from './liveFeed.routes';
import fleetRoutes from './fleet.routes';
import cabinIncidentsRoutes from './cabinIncidents.routes';
import blackspotsRoutes from './blackspots.routes';
import crossAgencyRoutes from './crossAgency.routes';
import rulesRoutes from './rules.routes';
import analyticsRoutes from './analytics.routes';
import alertsRoutes from './alerts.routes';
import aiRoutes from './ai.routes';
import portalRoutes from './portal.routes';
import systemRoutes from './system.routes';
import automationRoutes from './automation.routes';

const masterRouter = Router();

masterRouter.use('/auth', authRoutes);
masterRouter.use('/defects', defectsRoutes);
masterRouter.use('/live-feed', liveFeedRoutes);
masterRouter.use('/fleet', fleetRoutes);
masterRouter.use('/cabin-incidents', cabinIncidentsRoutes);
masterRouter.use('/blackspots', blackspotsRoutes);
masterRouter.use('/cross-agency', crossAgencyRoutes);
masterRouter.use('/rules', rulesRoutes);
masterRouter.use('/analytics', analyticsRoutes);
masterRouter.use('/alerts', alertsRoutes);
masterRouter.use('/ai', aiRoutes);
masterRouter.use('/portal', portalRoutes);
masterRouter.use('/automation', automationRoutes);
masterRouter.use('/', systemRoutes);

export default masterRouter;
