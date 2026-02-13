import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Types ---
interface DealData {
  title: string;
  value: number;
  currency: string;
  organization: string;
  person: string;
  note_content: string;
}

// --- Pipedrive Helpers ---
const PIPEDRIVE_API_URL = process.env.PIPEDRIVE_API_URL || 'https://api.pipedrive.com/v1';
const API_KEY = process.env.PIPEDRIVE_API_KEY;

async function fetchPipedrive(endpoint: string, method = 'GET', body?: any) {
  const url = `${PIPEDRIVE_API_URL}${endpoint}?api_token=${API_KEY}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(`Pipedrive Error [${endpoint}]: ${data.error || 'Unknown error'}`);
  }
  return data.data;
}

async function getOrCreatePerson(name: string, orgId?: number) {
  // 1. Search
  const searchResults = await fetchPipedrive(`/persons/search?term=${encodeURIComponent(name)}`);
  if (searchResults.items && searchResults.items.length > 0) {
    return searchResults.items[0].item.id;
  }

  // 2. Create if not found
  const newPerson = await fetchPipedrive('/persons', 'POST', { name, org_id: orgId });
  return newPerson.id;
}

async function getOrCreateOrg(name: string) {
  // 1. Search
  const searchResults = await fetchPipedrive(`/organizations/search?term=${encodeURIComponent(name)}`);
  if (searchResults.items && searchResults.items.length > 0) {
    return searchResults.items[0].item.id;
  }

  // 2. Create if not found
  const newOrg = await fetchPipedrive('/organizations', 'POST', { name });
  return newOrg.id;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY || !process.env.PIPEDRIVE_API_KEY) {
      return NextResponse.json({ error: 'Missing API Keys' }, { status: 500 });
    }

    // --- 1. Gemini Processing ---
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Listen to this audio sales note. Extract the following fields in JSON format:
      - title (deal name)
      - value (number)
      - currency (default "USD")
      - organization (name)
      - person (name)
      - note_content (summary of the request)

      If value is missing, estimate or set to 0.
      Return ONLY the JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/webm",
          data: base64Audio
        }
      }
    ]);

    const responseText = result.response.text();
    // Clean markdown code blocks if present
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const dealData: DealData = JSON.parse(cleanJson);

    // --- 2. Pipedrive Execution ---
    
    // A. Org
    let orgId = null;
    if (dealData.organization) {
      orgId = await getOrCreateOrg(dealData.organization);
    }

    // B. Person
    let personId = null;
    if (dealData.person) {
      personId = await getOrCreatePerson(dealData.person, orgId);
    }

    // C. Deal
    const deal = await fetchPipedrive('/deals', 'POST', {
      title: dealData.title,
      value: dealData.value,
      currency: dealData.currency,
      org_id: orgId,
      person_id: personId,
      status: 'open'
    });

    // D. Note
    if (dealData.note_content) {
      await fetchPipedrive('/notes', 'POST', {
        deal_id: deal.id,
        content: `🎙️ Voice Note Summary:\n\n${dealData.note_content}`
      });
    }

    return NextResponse.json({ success: true, deal });

  } catch (error: any) {
    console.error('Voice Deal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
