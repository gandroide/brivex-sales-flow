import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar la API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("Error: Falta GOOGLE_API_KEY en .env");
      return NextResponse.json({ error: 'Server misconfiguration: Missing API Key' }, { status: 500 });
    }

    // 2. Obtener el archivo de audio
    const formData = await req.formData();
    // A veces el frontend lo manda como 'audio' o 'file', revisamos ambos
    const file = (formData.get('file') || formData.get('audio')) as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 3. Convertir Audio a Base64 (Requisito estricto de Gemini)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');
    
    // Usar 'audio/webm' como default si viene vacío (común en grabadoras web)
    const mimeType = file.type || 'audio/webm';

    // 4. Inicializar Gemini (Directamente aquí para evitar errores de importación)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 5. Prompt Maestro: Extraer datos JSON para Pipedrive
    const prompt = `
      You are an expert sales assistant. Listen to this audio note.
      Extract the deal details strictly into a JSON object.
      
      Required Fields:
      - title: Deal title (e.g. "Venta Grifería - [Client Name]")
      - value: Number (amount). If not mentioned, use 0.
      - currency: "USD" or "DOP" (default to USD).
      - organization: Client/Company name.
      - person: Contact person name (if mentioned).
      - note_content: A full transcription/summary of the note.

      Output ONLY valid JSON. No markdown code blocks.
    `;

    // 6. Generar contenido
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Limpiar el JSON (por si Gemini pone ```json ... ```)
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Intentar parsear para asegurar que devolvemos un objeto
    let data;
    try {
        data = JSON.parse(cleanJson);
    } catch (e) {
        // Si falla el JSON, devolvemos el texto plano en 'note_content'
        data = { note_content: text, title: "Nota de Voz (Sin procesar)", value: 0 };
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Transcription Error:', error);
    // Devolvemos el mensaje real del error para que sepas qué pasó
    return NextResponse.json({ error: error.message || 'Failed to process audio' }, { status: 500 });
  }
}