const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');
const { buildAssistantConfig } = require('../services/buildAssistant');
const { generateFeedback } = require('../services/generateFeedback');

const router = express.Router();

const VALID_TYPES = ['behavioral', 'technical', 'system_design', 'hr_culture_fit'];

// POST /api/sessions — create new session
router.post('/', requireAuth, async (req, res) => {
  try {
    const { interviewType } = req.body;

    if (!interviewType || !VALID_TYPES.includes(interviewType)) {
      return res.status(400).json({
        error: `Invalid interview type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    const result = await pool.query(
      `INSERT INTO interview_sessions (user_id, interview_type) 
       VALUES ($1, $2) RETURNING id`,
      [req.userId, interviewType]
    );

    res.status(201).json({ sessionId: result.rows[0].id });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/sessions — list all sessions for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id, s.interview_type, s.status, s.started_at, s.ended_at,
        MAX(f.overall_score) as overall_score
       FROM interview_sessions s
       LEFT JOIN feedback_reports f ON f.session_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.started_at DESC`,
      [req.userId]
    );

    res.json(
      result.rows.map((r) => ({
        id: r.id,
        interviewType: r.interview_type,
        status: r.status,
        startedAt: r.started_at,
        endedAt: r.ended_at,
        overallScore: r.overall_score,
      }))
    );
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/sessions/:id — single session
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = result.rows[0];
    if (session.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: session.id,
      userId: session.user_id,
      interviewType: session.interview_type,
      status: session.status,
      vapiCallId: session.vapi_call_id,
      transcript: session.transcript,
      startedAt: session.started_at,
      endedAt: session.ended_at,
    });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PATCH /api/sessions/:id — update vapi call id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { vapiCallId } = req.body;

    const session = await pool.query(
      'SELECT user_id FROM interview_sessions WHERE id = $1',
      [req.params.id]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query(
      'UPDATE interview_sessions SET vapi_call_id = $1 WHERE id = $2',
      [vapiCallId, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/sessions/:id/assistant-config — build Vapi transient assistant config
router.get('/:id/assistant-config', requireAuth, async (req, res) => {
  try {
    const sessionResult = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = $1',
      [req.params.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionResult.rows[0];
    if (session.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (session.status !== 'in_progress') {
      return res.status(400).json({ error: 'This session has already been completed' });
    }

    const userResult = await pool.query(
      'SELECT id, name, email, role, experience_level FROM users WHERE id = $1',
      [req.userId]
    );

    const user = userResult.rows[0];
    const config = buildAssistantConfig({ session, user });

    res.json(config);
  } catch (err) {
    console.error('Get assistant config error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/sessions/:id/end — end session, store transcript, generate feedback
router.post('/:id/end', requireAuth, async (req, res) => {
  try {
    const sessionResult = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = $1',
      [req.params.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionResult.rows[0];
    if (session.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let { transcript } = req.body;

    // If transcript is empty and we have a vapi call id, try Vapi API fallback
    if ((!transcript || transcript.length === 0) && session.vapi_call_id) {
      try {
        const fetch = require('node-fetch');
        const vapiRes = await fetch(`https://api.vapi.ai/call/${session.vapi_call_id}`, {
          headers: { Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}` },
        });
        if (vapiRes.ok) {
          const callData = await vapiRes.json();
          if (callData.transcript) {
            transcript = callData.transcript;
          }
        }
      } catch (vapiErr) {
        console.error('Vapi transcript fallback failed:', vapiErr);
      }
    }

    if (!transcript || transcript.length === 0) {
      transcript = [{ role: 'system', content: 'No transcript captured for this session.' }];
    }

    // Update session
    await pool.query(
      `UPDATE interview_sessions 
       SET transcript = $1, status = 'completed', ended_at = now() 
       WHERE id = $2`,
      [JSON.stringify(transcript), req.params.id]
    );

    // Get user for feedback generation
    const userResult = await pool.query(
      'SELECT id, name, role, experience_level FROM users WHERE id = $1',
      [req.userId]
    );
    const user = userResult.rows[0];

    // Generate feedback
    const feedback = await generateFeedback({
      transcript,
      interviewType: session.interview_type,
      user,
    });

    // Insert feedback report
    const reportResult = await pool.query(
      `INSERT INTO feedback_reports 
       (session_id, overall_score, category_scores, strengths, improvements, question_breakdown, summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        req.params.id,
        feedback.overall_score,
        JSON.stringify(feedback.category_scores),
        JSON.stringify(feedback.strengths),
        JSON.stringify(feedback.improvements),
        JSON.stringify(feedback.question_breakdown),
        feedback.summary,
      ]
    );

    res.json({ reportId: reportResult.rows[0].id });
  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ error: 'Something went wrong while generating your feedback report' });
  }
});

// GET /api/sessions/:id/report — get feedback report
router.get('/:id/report', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id as session_id, s.interview_type, s.started_at, s.ended_at, s.transcript,
        f.id as report_id, f.overall_score, f.category_scores, f.strengths,
        f.improvements, f.question_breakdown, f.summary, f.created_at as report_created_at
       FROM interview_sessions s
       JOIN feedback_reports f ON f.session_id = s.id
       WHERE s.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const row = result.rows[0];

    // Ownership check via session
    const ownerCheck = await pool.query(
      'SELECT user_id FROM interview_sessions WHERE id = $1',
      [req.params.id]
    );
    if (ownerCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      sessionId: row.session_id,
      interviewType: row.interview_type,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      transcript: row.transcript,
      reportId: row.report_id,
      overallScore: row.overall_score,
      categoryScores: row.category_scores,
      strengths: row.strengths,
      improvements: row.improvements,
      questionBreakdown: row.question_breakdown,
      summary: row.summary,
      reportCreatedAt: row.report_created_at,
    });
  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
