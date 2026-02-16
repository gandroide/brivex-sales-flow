
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import DossierTemplate from '@/lib/pdf-template';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections, salesperson, clientName, projectName, date, hidePrices } = body;
    
    // Validate sections have items
    if (!sections || !Array.isArray(sections) || sections.every((s: { items: unknown[] }) => s.items.length === 0)) {
        return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Helper to proxify URLs
    const proxify = (url: string | undefined) => {
      if (!url) return undefined;
      // If it's already a local path or data URI, leave it. Otherwise proxy.
      if (url.startsWith('http')) {
        return `${origin}/api/proxy-image?url=${encodeURIComponent(url)}`;
      }
      return url;
    };

    // Deep copy and transform sections to use proxy URLs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proxiedSections = sections.map((section: any) => ({
      ...section,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: section.items.map((item: any) => ({
        ...item,
        image_url: proxify(item.image_url),
        tech_drawing_url: proxify(item.tech_drawing_url),
        // If features or other nested images exist, proxy them too if needed
      }))
    }));

    // Render PDF to stream
    const stream = await renderToStream(
      <DossierTemplate 
        sections={proxiedSections}
        salesperson={salesperson}
        clientName={clientName} 
        projectName={projectName}
        date={date}
        hidePrices={hidePrices}
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
