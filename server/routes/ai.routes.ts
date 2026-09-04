import { Router, Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import { db } from '../db/database';

const router = Router();

// POST /api/ai/analyze-defect - Analyze defect with Gemini AI
router.post('/analyze-defect', async (req: Request, res: Response, next) => {
  try {
    const { title, description, location, category, imageUrl } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        error: { message: 'Either title or description is required for AI analysis.' }
      });
    }

    const result = await GeminiService.analyzeCivicDefect({
      title: title || 'Civic Infrastructure Defect',
      description: description || title || '',
      location: location || 'Municipal Ward Area',
      category,
      imageUrl
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/copilot-chat - Interactive AI Assistant for Municipal Officers
router.post('/copilot-chat', async (req: Request, res: Response, next) => {
  try {
    const { query, language = 'en', activeView, activeTicketId } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: { message: 'Query string is required.' }
      });
    }

    const result = await GeminiService.queryNagarAssistant(query, language, activeView, activeTicketId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/ward-summary - Generate ward executive summary
router.post('/ward-summary', async (req: Request, res: Response, next) => {
  try {
    const { ward } = req.body;
    const targetWard = ward || 'Ward C - Central';
    const defects = db.getDefects({ ward: targetWard });
    const criticalCount = defects.filter((d) => d.severity === 'CRITICAL').length;

    const summary = await GeminiService.generateWardExecutiveSummary(targetWard, defects.length, criticalCount);

    res.json({
      success: true,
      data: {
        ward: targetWard,
        totalDefects: defects.length,
        criticalCount,
        executiveSummary: summary
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
