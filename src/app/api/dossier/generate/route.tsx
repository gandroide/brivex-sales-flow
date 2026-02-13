
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import DossierTemplate from '@/lib/pdf-template';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections, salesperson, clientName, projectName, date } = body;
    
    // Validate sections have items
    if (!sections || !Array.isArray(sections) || sections.every((s: { items: unknown[] }) => s.items.length === 0)) {
        return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    // Render PDF to stream
    const stream = await renderToStream(
      <DossierTemplate 
        sections={sections}
        salesperson={salesperson}
        clientName={clientName} 
        projectName={projectName}
        date={date}
      />
    );
    
    // Convert Node stream to Web stream for Next.js Response
    const responseStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Brivex_Dossier_${Date.now()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
