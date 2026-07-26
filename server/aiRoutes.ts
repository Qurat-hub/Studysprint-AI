import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export const aiRouter = Router();

// Lazy initialization of Gemini client
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `You are StudySprint AI, an intelligent academic productivity assistant designed specifically for university students.
Your goal is to help students manage assignments, projects, exams, and study schedules efficiently.
Always provide structured responses.
Never complete academic work dishonestly (do NOT write essays, cheat code, or solved solutions for them).
Instead:
- Break large tasks into manageable steps.
- Estimate realistic completion times.
- Suggest daily study schedules.
- Recommend revision strategies.
- Help students prioritize urgent tasks.
- Encourage productive study habits.
Keep responses concise, actionable, and motivational.`;

// 1. AI Study Planner Endpoint
aiRouter.post('/study-plan', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a comprehensive university study plan based on this request: "${prompt}". Return structured JSON matching the requested schema.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            priorityAnalysis: {
              type: Type.OBJECT,
              properties: {
                urgent: { type: Type.ARRAY, items: { type: Type.STRING } },
                important: { type: Type.ARRAY, items: { type: Type.STRING } },
                flexible: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['urgent', 'important', 'flexible'],
            },
            dailyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  task: { type: Type.STRING },
                  course: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  recommendedDurationMinutes: { type: Type.NUMBER },
                },
                required: ['timeSlot', 'task', 'course', 'focusArea', 'recommendedDurationMinutes'],
              },
            },
            taskBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskName: { type: Type.STRING },
                  course: { type: Type.STRING },
                  estimatedHours: { type: Type.NUMBER },
                  subtasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['taskName', 'course', 'estimatedHours', 'subtasks'],
              },
            },
            revisionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivationalAdvice: { type: Type.STRING },
            productivityTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            totalEstimatedHours: { type: Type.NUMBER },
          },
          required: [
            'summary',
            'priorityAnalysis',
            'dailyPlan',
            'taskBreakdown',
            'revisionPlan',
            'motivationalAdvice',
            'productivityTips',
            'totalEstimatedHours',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const jsonResult = JSON.parse(text);
    return res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error('Error generating AI study plan:', error);
    return res.status(500).json({
      error: 'Failed to generate study plan',
      details: error.message || 'Server error',
    });
  }
});

// 2. AI Assignment Helper Endpoint
aiRouter.post('/assignment-helper', async (req, res) => {
  try {
    const { instructions, title, course } = req.body;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze these assignment instructions for course "${course || 'General'}", assignment "${title || 'Assignment'}": "${instructions}". Break down the task cleanly into an actionable study checklist, topic summary, estimated hours, difficulty, and day-by-day roadmap.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            importantTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'description'],
              },
            },
            suggestedTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  goal: { type: Type.STRING },
                },
                required: ['day', 'goal'],
              },
            },
            difficultyEstimation: { type: Type.STRING },
            estimatedHours: { type: Type.NUMBER },
          },
          required: [
            'summary',
            'importantTopics',
            'checklist',
            'recommendedResources',
            'suggestedTimeline',
            'difficultyEstimation',
            'estimatedHours',
          ],
        },
      },
    });

    const text = response.text || '{}';
    return res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error in AI Assignment Helper:', error);
    return res.status(500).json({ error: 'Failed to parse assignment', details: error.message });
  }
});

// 3. AI Exam Planner Endpoint
aiRouter.post('/exam-planner', async (req, res) => {
  try {
    const { subjects, examDates, availableStudyHours } = req.body;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Create an intensive exam preparation schedule for subjects: ${JSON.stringify(subjects)}. Exam dates: ${JSON.stringify(examDates)}. Available study hours per day: ${availableStudyHours || 4} hours.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStrategy: { type: Type.STRING },
            dailyTimetable: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  duration: { type: Type.STRING },
                },
                required: ['day', 'subject', 'topic', 'duration'],
              },
            },
            revisionSessions: { type: Type.ARRAY, items: { type: Type.STRING } },
            practiceSessions: { type: Type.ARRAY, items: { type: Type.STRING } },
            mockTestSchedule: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'overallStrategy',
            'dailyTimetable',
            'revisionSessions',
            'practiceSessions',
            'mockTestSchedule',
          ],
        },
      },
    });

    const text = response.text || '{}';
    return res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error in AI Exam Planner:', error);
    return res.status(500).json({ error: 'Failed to generate exam plan', details: error.message });
  }
});

// 4. AI Productivity Coach Endpoint
aiRouter.post('/productivity-coach', async (req, res) => {
  try {
    const { completedCount, pendingCount, currentStreak, hoursThisWeek } = req.body;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze student performance data: Completed tasks = ${completedCount}, Pending tasks = ${pendingCount}, Current study streak = ${currentStreak} days, Hours studied this week = ${hoursThisWeek} hours. Provide personalized productivity coaching, habit tips, and motivation.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            weeklySuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedStudyHabits: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivation: { type: Type.STRING },
          },
          required: [
            'summary',
            'strengths',
            'areasForImprovement',
            'weeklySuggestions',
            'recommendedStudyHabits',
            'motivation',
          ],
        },
      },
    });

    const text = response.text || '{}';
    return res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error in AI Productivity Coach:', error);
    return res.status(500).json({ error: 'Failed to generate coaching insights', details: error.message });
  }
});

// 5. AI Chat Endpoint
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAI();
    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}
Always respond clearly and warmly to student questions. Format key points with bullet points or clear headers. Keep responses structured and actionable.`,
      },
    });

    const response = await chat.sendMessage({ message });
    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    return res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});
