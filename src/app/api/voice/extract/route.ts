import { NextRequest, NextResponse } from 'next/server';
import { geminiFlash, fileToGenerativePart } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'audio/mp3';
    
    const audioPart = fileToGenerativePart(buffer, mimeType);

    const prompt = `Listen to this sales audio. Extract the following JSON:
    {
      "client_name": "Name of the client (if not mentioned, use 'Cliente Desconocido')",
      "deal_title": "A short title for the deal (e.g. 'Venta 2 Grifos Oro - Juan Pérez')",
      "value": "Numeric value (no currency symbol). If not mentioned, estimate or 0.",
      "products": ["List of products mentioned"],
      "stage": "Pipeline stage (Options: 'Lead In', 'Contact Made', 'Proposal Sent', 'Negotiation', 'Won'). If mentions 'closed' or 'paid', use 'Won'.",
      "next_step": "Suggested next step based on context"
    }
    If you hear 'Juanillo', that's the project name.
    Output ONLY valid JSON.`;

    const result = await geminiFlash.generateContent([
      audioPart,
      prompt
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Clean up response if it contains markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const data = JSON.parse(cleanText);
      return NextResponse.json(data);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      return NextResponse.json({ error: 'Failed to parse extracted data' }, { status: 500 });
    }

  } catch (error) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: 'Failed to extract data' }, { status: 500 });
  }
}
