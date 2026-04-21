import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateRegulationSummary = async (
  regulationTitle: string,
  regulationText: string,
  businessType: string
): Promise<{
  summary: string;
  actionItems: string[];
  penalty: string;
  deadline: string;
  difficulty: string;
}> => {
  const prompt = `
You are a compliance expert for small businesses. 
Analyze this regulation for a ${businessType} business and respond ONLY in JSON format.

Regulation: "${regulationTitle}"
Details: "${regulationText}"

Respond with exactly this JSON structure:
{
  "summary": "2-3 sentence plain English explanation of what this regulation requires",
  "actionItems": ["action 1", "action 2", "action 3"],
  "penalty": "what happens if not complied with",
  "deadline": "when this needs to be done",
  "difficulty": "Easy|Medium|Hard"
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || '{}';
  const clean = content.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    return {
      summary: regulationText,
      actionItems: ['Review this regulation carefully'],
      penalty: 'Fines may apply',
      deadline: 'Check with local authority',
      difficulty: 'Medium',
    };
  }
};

export const generateComplianceAdvice = async (
  businessType: string,
  state: string,
  currentScore: number,
  missingItems: string[]
): Promise<string> => {
  const prompt = `
You are a compliance advisor for small businesses.
Give specific, actionable advice in 3-4 sentences.

Business: ${businessType} in ${state}
Compliance score: ${currentScore}%
Missing items: ${missingItems.join(', ')}

Be direct and practical. No legal jargon.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.5,
  });

  return response.choices[0].message.content ||
    'Please review your missing compliance items and take action immediately.';
};