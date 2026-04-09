import dotenv from 'dotenv';
dotenv.config();

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : 'NOT SET ❌');

import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

try {
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: 'Xin chào' }],
    max_tokens: 50,
  });
  console.log('✅ SUCCESS:', res.choices[0].message.content);
} catch (err) {
  console.error('❌ ERROR:', err.message);
}
