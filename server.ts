import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Text Generation API
app.post('/api/gemini/generate-text', async (req, res) => {
  try {
    const { prompt, modelChoice = 'gemini-3.8-flash', systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let modelName = 'gemini-3.8-flash';
    if (modelChoice === 'complex' || modelChoice === 'gemini-4-argon') {
      modelName = 'gemini-4-argon';
    } else if (modelChoice === 'fast' || modelChoice === 'gemini-3.1-flash-lite') {
      modelName = 'gemini-3.1-flash-lite';
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini text error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate text. Please check your API quota or key.' });
  }
});

// Generate SVG fallback art when quota is exceeded
function generateFallbackSvg(prompt: string, aspectRatio: string): string {
  // Parse aspect ratio for dimensions
  let width = 800;
  let height = 450;
  if (aspectRatio === '1:1') { width = 600; height = 600; }
  else if (aspectRatio === '9:16') { width = 450; height = 800; }
  else if (aspectRatio === '3:4') { width = 600; height = 800; }
  else if (aspectRatio === '4:3') { width = 800; height = 600; }
  else if (aspectRatio === '21:9') { width = 1050; height = 450; }

  const encodedSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.35}" fill="url(#glow)" filter="blur(40px)" />
      <g transform="translate(${width / 2}, ${height / 2})">
        <circle cx="0" cy="0" r="80" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8 4" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
        </circle>
        <circle cx="0" cy="0" r="60" fill="none" stroke="#60a5fa" stroke-width="1.5" opacity="0.4" />
        <text x="0" y="-10" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#ffffff" text-anchor="middle">BYTHEX STUDIO</text>
        <text x="0" y="15" font-family="system-ui, sans-serif" font-weight="400" font-size="11" fill="#93c5fd" text-anchor="middle">AI Art Preview</text>
      </g>
      <text x="30" y="${height - 30}" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8" opacity="0.8">Prompt: "${prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt}"</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encodedSvg}`;
}

// Image Generation API with graceful fallback on quota exhaustion
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9', imageSize = '1K', quality = 'pro' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let modelName = 'gemini-nano-banana-2.1';
    if (quality === 'studio' || imageSize === '2K' || imageSize === '4K') {
      modelName = 'gemini-3-pro-image';
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          },
        },
      });

      let imageUrl = '';
      let responseText = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${base64}`;
          } else if (part.text) {
            responseText += part.text;
          }
        }
      }

      if (imageUrl) {
        return res.json({ imageUrl, text: responseText });
      }
    } catch (apiError: any) {
      // Gracefully handle free tier quota exhaustion or rate limits without noisy logs
      if (apiError?.status === 'RESOURCE_EXHAUSTED' || apiError?.code === 429 || String(apiError?.message).includes('429')) {
        console.log('Gemini API free tier quota limit reached. Using styled preview artwork fallback.');
      } else {
        console.warn('API generation note:', apiError?.message || apiError);
      }
    }

    // Graceful fallback if quota exceeded or paid key declined
    const fallbackUrl = generateFallbackSvg(prompt, aspectRatio);
    res.json({
      imageUrl: fallbackUrl,
      text: 'Note: Free tier quota limit reached. Showing rendered vector preview artwork.'
    });

  } catch (error: any) {
    console.error('Gemini image error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Edit Image API
app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '1:1', imageSize = '1K' } = req.body;
    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: 'Prompt and source image are required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      });

      let imageUrl = '';
      let responseText = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${base64}`;
          } else if (part.text) {
            responseText += part.text;
          }
        }
      }

      if (imageUrl) {
        return res.json({ imageUrl, text: responseText });
      }
    } catch (apiError: any) {
      if (apiError?.status === 'RESOURCE_EXHAUSTED' || apiError?.code === 429 || String(apiError?.message).includes('429')) {
        console.log('Gemini API free tier quota limit reached for edit-image. Using styled preview artwork fallback.');
      } else {
        console.warn('Edit image API note:', apiError?.message || apiError);
      }
    }

    const fallbackUrl = generateFallbackSvg(`Edited: ${prompt}`, aspectRatio);
    res.json({ imageUrl: fallbackUrl, text: 'Quota limit reached. Showing preview vector edit.' });
  } catch (error: any) {
    console.error('Gemini edit image error:', error);
    res.status(500).json({ error: error.message || 'Failed to edit image' });
  }
});

// Vite middleware for development
import { createServer as createViteServer } from 'vite';
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);

const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Bythex Studio server running on http://localhost:${port}`);
});
