import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    return;
  }

  // Use fetch to hit the API directly since listModels isn't always on genAI in the SDK version
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
       console.error('API Error:', JSON.stringify(data.error, null, 2));
       return;
    }
    console.log('Available Models:', data.models?.map((m: any) => m.name).join(', '));
  } catch (err: any) {
    console.error('Fetch failed:', err.message);
  }
}

listModels();
