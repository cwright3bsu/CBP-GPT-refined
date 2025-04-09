import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // cache responses for 5 minutes

const systemPrompt = `
You are a traveler entering the United States. A Customs and Border Protection (CBP) officer is interviewing you.

Respond naturally and realistically. You may have something to hide (e.g., undeclared goods, expired visa, agricultural products, cash), but only admit these if asked directly.

At the end of each response, include private feedback (in parentheses) about how effective the officer’s question was.

Examples:
- "I'm here on vacation. (Feedback: Good opener. Asking purpose of travel is important.)"
- "Yes, I brought some fruits... (Feedback: Asking about what I packed was a smart follow-up.)"
`;

function buildConversationContext(conversationHistory, newUserMessage) {
  // Add new user message to the history
  const updatedHistory = [...conversationHistory, { role: 'user', content: newUserMessage }];
  return [
    { role: 'system', content: systemPrompt },
    ...updatedHistory
  ];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversation, newMessage } = req.body;

  if (!newMessage || typeof newMessage !== 'string') {
    return res.status(400).json({ error: 'Invalid input message.' });
  }

  const messages = buildConversationContext(conversation, newMessage);
  const cacheKey = JSON.stringify(messages);

  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return res.status(200).json({ reply: cachedResponse });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = response.data.choices[0].message.content;
    cache.set(cacheKey, reply);
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Something went wrong with the AI response.' });
  }
}
