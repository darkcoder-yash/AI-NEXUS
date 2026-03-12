import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testTranscription() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // We need a small audio file to test. Since we don't have one, 
  // we'll just test if the model exists and supports the multimodal call with a dummy buffer.
  const dummyBuffer = Buffer.from('RIFF....WAVEfmt ....data....'); 
  
  const modelsToTest = ['models/gemini-2.0-flash', 'models/gemini-2.5-flash', 'models/gemini-2.5-flash-native-audio-latest'];

  for (const modelName of modelsToTest) {
    console.log(`Testing model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: dummyBuffer.toString('base64')
          }
        },
        { text: 'Is this audio? Just say YES if you received the data, even if it is garbage.' }
      ]);
      console.log(`Response from ${modelName}:`, result.response.text());
    } catch (err: any) {
      console.error(`Error with ${modelName}:`, err.message);
    }
  }
}

testTranscription();
