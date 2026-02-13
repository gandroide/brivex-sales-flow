
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import DossierTemplate from '@/lib/pdf-template';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, clientName, projectName, date } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    // Render PDF to stream
    const stream = await renderToStream(
      <DossierTemplate 
        products={products} 
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
// import { NextResponse } from 'next/server';
// import { renderToStream } from '@react-pdf/renderer';
// import React from 'react';
// import { DossierDocument } from '@/lib/pdf-template';

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { products, clientName } = body;

//     console.log("🟢 Generando PDF para:", clientName);
//     console.log("📦 Productos:", products.length);

//     // 1. Validamos que haya datos
//     if (!products || products.length === 0) {
//       throw new Error("No hay productos para generar el dossier");
//     }

//     // 2. Renderizamos el PDF a un Stream
//     // Pasamos isPreview=false para que renderice completo
//     const stream = await renderToStream(
//       <DossierDocument products={products} clientName={clientName} />
//     );

//     // 3. Devolvemos la respuesta con las cabeceras correctas
//     return new NextResponse(stream as unknown as ReadableStream, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename=dossier-${Date.now()}.pdf`,
//       },
//     });

//   } catch (error: any) {
//     // ESTO ES LO IMPORTANTE: Imprimir el error real en la terminal
//     console.error("🔴 ERROR CRÍTICO AL GENERAR PDF:", error);
//     console.error("🔴 Causa:", error.message);
//     console.error("🔴 Stack:", error.stack);

//     return NextResponse.json(
//       { error: "Error generando PDF", details: error.message },
//       { status: 500 }
//     );
//   }
// }