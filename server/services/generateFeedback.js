const fetch = require('node-fetch');

const TYPE_LABELS = {
  behavioral: 'Behavioral',
  technical: 'Technical',
  system_design: 'System Design',
  hr_culture_fit: 'HR / Culture Fit',
};

async function callGroq(messages, retryCount = 0) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function formatTranscript(transcript) {
  return transcript
    .map((entry) => {
      const role = entry.role === 'assistant' ? 'Interviewer' : 'Candidate';
      return `${role}: ${entry.content}`;
    })
    .join('\n');
}

async function generateFeedback({ transcript, interviewType, user }) {
  const typeLabel = TYPE_LABELS[interviewType] || 'General';
  const role = user.role || 'Software Developer';
  const level = user.experience_level || 'Mid-level';
  const formattedTranscript = formatTranscript(transcript);

  const systemPrompt = `You are grading a ${typeLabel} mock interview transcript for a candidate targeting a ${role} role at ${level} level. Base every judgment ONLY on what's actually in the transcript below — never invent details. Respond with ONLY a valid JSON object, no markdown, no preamble, no explanation, matching exactly this shape:
{
  "overall_score": <integer 0-100>,
  "category_scores": { "communication": <1-10>, "structure": <1-10>, "depth": <1-10>, "confidence": <1-10> },
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "question_breakdown": [ { "question": "...", "answer_summary": "...", "evaluation": "..." } ],
  "summary": "2-3 sentence overall narrative"
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Here is the full interview transcript:\n\n${formattedTranscript}` },
  ];

  try {
    const raw = await callGroq(messages);

    // Try to parse — handle potential markdown wrapping
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      // Retry once with stricter instruction
      console.warn('First parse failed, retrying with stricter prompt...');
      messages.push({ role: 'assistant', content: raw });
      messages.push({
        role: 'user',
        content: 'That was not valid JSON. Return ONLY the JSON object, nothing else. No markdown, no backticks, no explanation.',
      });

      const retryRaw = await callGroq(messages);
      let retryCleaned = retryRaw.trim();
      if (retryCleaned.startsWith('```')) {
        retryCleaned = retryCleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      try {
        return JSON.parse(retryCleaned);
      } catch (retryParseErr) {
        console.error('Feedback JSON parse failed after retry:', retryParseErr);
        // Return a fallback report
        return getFallbackReport();
      }
    }
  } catch (err) {
    console.error('Feedback generation error:', err);
    return getFallbackReport();
  }
}

function getFallbackReport() {
  return {
    overall_score: 50,
    category_scores: {
      communication: 5,
      structure: 5,
      depth: 5,
      confidence: 5,
    },
    strengths: [
      'Participated in the interview session',
      'Engaged with the interviewer',
    ],
    improvements: [
      'Feedback generation encountered an issue — this is an approximate assessment',
      'Consider retaking the interview for a more detailed evaluation',
    ],
    question_breakdown: [],
    summary:
      'The feedback system encountered an issue generating a detailed report for this session. The scores shown are approximate. We recommend retaking the interview for a comprehensive evaluation.',
  };
}

module.exports = { generateFeedback };
