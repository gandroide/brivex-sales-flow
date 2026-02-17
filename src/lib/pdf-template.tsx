// import React from 'react';
// import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// // --- COLORES PREMIUM ---
// const COLORS = {
//   primaryDark: '#1A1A1A', // Architect Black
//   accentGold: '#C9A84C',  // Baccessory Gold
//   textGray: '#555555',
//   lightGray: '#F4F4F4',
//   white: '#FFFFFF',
//   border: '#E0E0E0',
// };

// const styles = StyleSheet.create({
//   // --- CONFIGURACIÓN GENERAL ---
//   page: {
//     fontFamily: 'Helvetica',
//     backgroundColor: COLORS.white,
//     flexDirection: 'column',
//     padding: 0,
//   },

//   // --- PORTADA DEL DOSSIER (COVER) ---
//   coverPage: {
//     backgroundColor: COLORS.primaryDark,
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   coverTitle: {
//     fontSize: 50,
//     color: COLORS.white,
//     fontWeight: 'bold',
//     letterSpacing: 8,
//     textAlign: 'center',
//     textTransform: 'uppercase',
//   },
//   coverSubtitle: {
//     fontSize: 14,
//     color: COLORS.accentGold,
//     letterSpacing: 4,
//     marginTop: 20,
//     textTransform: 'uppercase',
//   },
//   coverFooter: {
//     position: 'absolute',
//     bottom: 50,
//     alignItems: 'center',
//   },

//   // --- NUEVO: PORTADA DE SECCIÓN (CATEGORY DIVIDER) ---
//   sectionCoverPage: {
//     backgroundColor: COLORS.lightGray, 
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'column',
//   },
//   sectionTitle: {
//     fontSize: 40,
//     fontWeight: 'bold',
//     color: COLORS.primaryDark,
//     textTransform: 'uppercase',
//     letterSpacing: 5,
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.accentGold,
//     paddingBottom: 10,
//   },
//   sectionSubtitle: {
//     fontSize: 10, 
//     color: '#888', 
//     marginTop: 15, 
//     letterSpacing: 3,
//     textTransform: 'uppercase'
//   },

//   // --- DISEÑO DE PÁGINA DE PRODUCTO ---
//   // 1. TOP BAR
//   topBar: {
//     backgroundColor: COLORS.primaryDark,
//     height: 50,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     borderBottomWidth: 3,
//     borderBottomColor: COLORS.accentGold,
//   },
//   topBarLogo: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: 'bold',
//     letterSpacing: 2,
//     textTransform: 'uppercase',
//   },
//   topBarInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },
//   topBarText: {
//     color: '#CCC',
//     fontSize: 8,
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },
//   separator: {
//     width: 1,
//     height: 15,
//     backgroundColor: COLORS.accentGold,
//   },

//   // 2. MAIN CONTENT
//   mainContent: {
//     flex: 1,
//     flexDirection: 'row',
//     padding: 30,
//     gap: 30,
//   },
//   leftColumn: {
//     flex: 1.4, // Un poco más de espacio para la imagen hero
//     backgroundColor: COLORS.lightGray,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 2,
//     padding: 20,
//   },
//   heroImage: {
//     width: '100%',
//     height: '100%',
//     objectFit: 'contain',
//   },
//   rightColumn: {
//     flex: 1,
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//   },
  
//   // Bloque de Texto
//   headerBlock: { marginBottom: 10 },
//   brandTitle: { fontSize: 10, color: COLORS.accentGold, fontWeight: 'bold', letterSpacing: 2, marginBottom: 5, textTransform: 'uppercase' },
//   productTitle: { fontSize: 22, color: COLORS.primaryDark, lineHeight: 1.1, marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
//   description: { fontSize: 9, color: COLORS.textGray, lineHeight: 1.5, textAlign: 'justify', marginBottom: 10 },

//   // NUEVO: Bloque de Características (Features Bullets)
//   featuresBlock: {
//     marginBottom: 15,
//     marginTop: 5,
//     paddingLeft: 5,
//   },
//   featureItem: {
//     fontSize: 9,
//     color: COLORS.primaryDark,
//     marginBottom: 4,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   bullet: {
//     color: COLORS.accentGold,
//     marginRight: 6,
//     fontSize: 10,
//     lineHeight: 1,
//   },

//   // Bloque Plano Técnico
//   techDrawingContainer: {
//     height: 150, 
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 'auto',
//   },
//   techLabel: { position: 'absolute', top: 3, left: 3, fontSize: 5, color: '#999', textTransform: 'uppercase' },
//   techImage: { width: '95%', height: '95%', objectFit: 'contain', opacity: 0.9 },

//   // 3. BOTTOM BAR
//   bottomBar: {
//     height: 60,
//     backgroundColor: '#FAFAFA',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     flexDirection: 'row',
//     paddingHorizontal: 30,
//     alignItems: 'center',
//   },
//   specCell: { flex: 1, height: '100%', justifyContent: 'center', paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#EEE' },
//   specCellLast: { flex: 1.2, height: '100%', justifyContent: 'center', paddingHorizontal: 10, backgroundColor: COLORS.primaryDark },
//   specLabel: { fontSize: 6, color: '#888', textTransform: 'uppercase', marginBottom: 3, letterSpacing: 1 },
//   specValue: { fontSize: 9, color: COLORS.primaryDark, fontWeight: 'bold' },
//   priceValue: { fontSize: 14, color: COLORS.accentGold, fontWeight: 'bold' },
// });

// // --- LÓGICA DE AGRUPACIÓN ---

// interface Product {
//   id: string;
//   sku: string;
//   name: string;
//   brand: string;
//   description: string;
//   price: number;
//   image_url: string;
//   tech_drawing_url?: string;
//   origin?: string;
//   collection_name?: string;
//   finish?: string;
//   type?: string;
//   features?: string[]; // Array de caracteristicas persistentes
// }

// const groupProductsByType = (products: Product[]) => {
//   return products.reduce((acc, product) => {
//     // Si no tiene tipo, lo ponemos en "GENERAL"
//     const type = product.type || 'GENERAL';
//     if (!acc[type]) acc[type] = [];
//     acc[type].push(product);
//     return acc;
//   }, {} as Record<string, Product[]>);
// };

// interface Section {
//   id: string;
//   name: string;
//   items: Product[];
// }

// interface DossierProps {
//   sections: Section[];
//   salesperson?: string;
//   clientName: string;
//   projectName?: string;
//   date?: string;
// }

// const DossierTemplate: React.FC<DossierProps> = ({ sections, salesperson, clientName, projectName, date }) => {
  


//   return (
//     <Document>
      
//       {/* --- PORTADA GENERAL DEL DOSSIER --- */}
//       <Page size="A4" orientation="landscape" style={styles.coverPage}>
//         <View style={{alignItems: 'center'}}>
//            <Text style={styles.coverTitle}>{projectName || 'DOSSIER'}</Text>
//            <View style={{width: 80, height: 3, backgroundColor: COLORS.accentGold, marginVertical: 20}} />
//            <Text style={styles.coverSubtitle}>BACCESSORY</Text>
//         </View>
//          <View style={styles.coverFooter}>
//             <Text style={{color: '#888', fontSize: 10, marginBottom: 5}}>PREPARADO PARA</Text>
//             <Text style={{color: COLORS.white, fontSize: 16, letterSpacing: 2}}>{clientName || 'CLIENTE VIP'}</Text>
            
//             <Text style={{color: COLORS.accentGold, fontSize: 10, marginTop: 15, textTransform: 'uppercase', letterSpacing: 2}}>
//                 {salesperson || 'JOHALIS MONTILLA'} • SALES EXECUTIVE
//             </Text>

//             <Text style={{color: '#666', fontSize: 10, marginTop: 5}}>{date || new Date().toLocaleDateString()}</Text>
//         </View>
//       </Page>

//       {/* --- BUCLE PRINCIPAL: ITERAR POR SECCIONES (ROOMS) --- */}
//       {sections.map((section, sectionIndex) => {
//         // Group products within this section
//         const groupedProducts = groupProductsByType(section.items);
//         const categories = Object.keys(groupedProducts);

//         return (
//         <React.Fragment key={sectionIndex}>
          
//           {/* A. PORTADA DE SECCIÓN (ROOM COVER) */}
//           <Page size="A4" orientation="landscape" style={styles.sectionCoverPage}>
//              <Text style={styles.sectionTitle}>{section.name}</Text>
//              <Text style={styles.sectionSubtitle}>{section.items.length} PRODUCTOS SELECCIONADOS</Text>
//           </Page>

//           {/* B. PRODUCTOS DENTRO DE ESA SECCIÓN (AGRUPADOS POR TIPO) */}
//           {categories.map((category) => (
//              groupedProducts[category].map((product: Product, prodIndex: number) => (
//             <Page key={`${sectionIndex}-${category}-${prodIndex}`} size="A4" orientation="landscape" style={styles.page}>
              
//               {/* TOP BAR */}
//               <View style={styles.topBar}>
//                 <Text style={styles.topBarLogo}>BACCESSORY • {section.name}</Text>
//                 <View style={styles.topBarInfo}>
//                     <Text style={styles.topBarText}>{product.brand}</Text>
//                     {product.collection_name && (
//                         <>
//                             <View style={styles.separator} />
//                             <Text style={styles.topBarText}>{product.collection_name}</Text>
//                         </>
//                     )}
//                     {product.type && (
//                          <>
//                             <View style={styles.separator} />
//                             <Text style={styles.topBarText}>{product.type}</Text>
//                         </>
//                     )}
//                 </View>
//               </View>

//               {/* CONTENIDO CENTRAL */}
//               <View style={styles.mainContent}>
//                  {/* IZQUIERDA: FOTO */}
//                  <View style={styles.leftColumn}>
//                     {product.image_url ? (
//                         <Image src={product.image_url} style={styles.heroImage} />
//                     ) : (
//                         <Text style={{color: '#ccc'}}>Sin Imagen</Text>
//                     )}
//                  </View>

//                  {/* DERECHA: DATOS + CARACTERÍSTICAS + PLANO */}
//                  <View style={styles.rightColumn}>
//                     <View>
//                         <View style={styles.headerBlock}>
//                             <Text style={styles.brandTitle}>{product.brand}</Text>
//                             <Text style={styles.productTitle}>{product.name}</Text>
                            
//                             {/* Descripción Corta */}
//                             <Text style={styles.description}>
//                                 {product.description ? (product.description.length > 250 ? product.description.substring(0, 250) + '...' : product.description) : ''}
//                             </Text>
//                         </View>

//                         {/* --- LISTA DE CARACTERÍSTICAS (LOS BULLETS) --- */}
//                         {product.features && product.features.length > 0 && (
//                             <View style={styles.featuresBlock}>
//                                 {product.features.map((feat, i) => (
//                                     <View key={i} style={styles.featureItem}>
//                                         <Text style={styles.bullet}>•</Text>
//                                         <Text style={{fontSize: 9, color: COLORS.textGray, width: '90%'}}>{feat}</Text>
//                                     </View>
//                                 ))}
//                             </View>
//                         )}
//                     </View>

//                     {/* DIBUJO TÉCNICO */}
//                     <View style={styles.techDrawingContainer}>
//                         <Text style={styles.techLabel}>DIBUJO TÉCNICO</Text>
//                         {product.tech_drawing_url ? (
//                             <Image src={product.tech_drawing_url} style={styles.techImage} />
//                         ) : (
//                             <Text style={{fontSize: 8, color: '#ccc'}}>Plano no disponible</Text>
//                         )}
//                     </View>
//                  </View>
//               </View>

//               {/* BOTTOM BAR: FICHA TÉCNICA */}
//               <View style={styles.bottomBar}>
//                   <View style={styles.specCell}><Text style={styles.specLabel}>SKU</Text><Text style={styles.specValue}>{product.sku}</Text></View>
//                   <View style={styles.specCell}><Text style={styles.specLabel}>ACABADO</Text><Text style={styles.specValue}>{product.finish || '-'}</Text></View>
//                   <View style={styles.specCell}><Text style={styles.specLabel}>TIPO</Text><Text style={styles.specValue}>{product.type || category}</Text></View>
//                   <View style={styles.specCell}><Text style={styles.specLabel}>ORIGEN</Text><Text style={styles.specValue}>{product.origin || product.brand}</Text></View>
//                   <View style={styles.specCellLast}><Text style={{...styles.specLabel, color: COLORS.accentGold}}>PRECIO</Text><Text style={styles.priceValue}>${Number(product.price).toFixed(2)}</Text></View>
//               </View>

//             </Page>
//           ))
//           ))}
//         </React.Fragment>
//         );
//       })}
//     </Document>
//   );
// };

// export default DossierTemplate;

// --- COLORES PREMIUM ---
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const COLORS = {
  primaryDark: '#1A1A1A', // Architect Black
  accentGold: '#C9A84C',  // Baccessory Gold
  textGray: '#555555',
  lightGray: '#F4F4F4',
  white: '#FFFFFF',
  border: '#E0E0E0',
};

const styles = StyleSheet.create({
  // --- CONFIGURACIÓN GENERAL ---
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white,
    flexDirection: 'column',
    padding: 0,
    height: '100%', // FORCE strict height
  },

  // --- PORTADA DEL DOSSIER (COVER) ---
  coverPage: {
    backgroundColor: COLORS.primaryDark,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 50,
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.accentGold,
    letterSpacing: 4,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },

  // --- PORTADA DE SECCIÓN (CATEGORY DIVIDER) ---
  sectionCoverPage: {
    backgroundColor: COLORS.lightGray, 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 5,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.accentGold,
    paddingBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 10, 
    color: '#888', 
    marginTop: 15, 
    letterSpacing: 3,
    textTransform: 'uppercase'
  },

  // --- DISEÑO DE PÁGINA DE PRODUCTO ---
  // 1. TOP BAR
  topBar: {
    backgroundColor: COLORS.primaryDark,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.accentGold,
    flexShrink: 0, 
  },
  topBarLogo: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  topBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  topBarText: {
    color: '#CCC',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  separator: {
    width: 1,
    height: 15,
    backgroundColor: COLORS.accentGold,
  },

  // 2. MAIN CONTENT WRAPPER 
  mainContent: {
    flex: 1, 
    flexDirection: 'row', 
    padding: 30,
    gap: 20,
    overflow: 'hidden', 
  },
  
  // Left Column (Images)
  leftColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 15,
  },

  // Section A: MAIN IMAGE 
  imageSection: {
    flex: 2, 
    maxHeight: 300, // <-- LÍMITE DE ALTURA AÑADIDO AQUÍ
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15, // Un poco más de padding para que respire
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

   // Section C: TECH DRAWING 
   techDrawingContainer: {
    flex: 0.8, 
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  techLabel: { position: 'absolute', top: 5, left: 5, fontSize: 6, color: '#999', textTransform: 'uppercase' },
  techImage: { width: '100%', height: '100%', objectFit: 'contain', marginTop: 10 },


  // Right Column (Text Content)
  rightColumn: {
    flex: 1.2, 
    flexDirection: 'column',
  },

  // Section B: TEXT CONTENT 
  textSection: {
    flex: 1,
    paddingTop: 10,
  },
  
  headerBlock: { marginBottom: 15 },
  brandTitle: { fontSize: 10, color: COLORS.accentGold, fontWeight: 'bold', letterSpacing: 2, marginBottom: 5, textTransform: 'uppercase' },
  productTitle: { fontSize: 20, color: COLORS.primaryDark, lineHeight: 1.2, marginBottom: 15, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  description: { fontSize: 10, color: COLORS.textGray, lineHeight: 1.5, textAlign: 'justify', marginBottom: 10 },

  featuresBlock: {
    marginTop: 10,
    paddingLeft: 5,
  },
  featureItem: {
    fontSize: 10,
    color: COLORS.primaryDark,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    color: COLORS.accentGold,
    marginRight: 6,
    fontSize: 10,
    lineHeight: 1,
  },

  // 3. BOTTOM BAR
  bottomBar: {
    height: 60,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    paddingHorizontal: 30,
    alignItems: 'center',
    flexShrink: 0, 
  },
  specCell: { flex: 1, height: '100%', justifyContent: 'center', paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#EEE' },
  specCellLast: { flex: 1.2, height: '100%', justifyContent: 'center', paddingHorizontal: 10, backgroundColor: COLORS.primaryDark },
  specLabel: { fontSize: 6, color: '#888', textTransform: 'uppercase', marginBottom: 3, letterSpacing: 1 },
  specValue: { fontSize: 9, color: COLORS.primaryDark, fontWeight: 'bold' },
  priceValue: { fontSize: 14, color: COLORS.accentGold, fontWeight: 'bold' },

  // New Warranty Block
  warrantyBlock: {
    marginTop: 'auto', 
    paddingTop: 15,
    alignItems: 'flex-start',
  },
  warrantyTitle: { fontSize: 7, color: '#888', letterSpacing: 1, textTransform: 'uppercase' },
  warrantyValue: { fontSize: 10, color: COLORS.accentGold, fontWeight: 'bold', marginTop: 2 },
});

// --- LÓGICA DE AGRUPACIÓN ---

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image_url: string;
  tech_drawing_url?: string;
  origin?: string;
  collection_name?: string;
  finish?: string;
  type?: string;
  features?: string[];
  warranty_type?: string;     
  warranty_duration?: string; 
}

const groupProductsByType = (products: Product[]) => {
  return products.reduce((acc, product) => {
    const type = product.type || 'GENERAL';
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

interface Section {
  id: string;
  name: string;
  items: Product[];
}

interface DossierProps {
  sections: Section[];
  salesperson?: string;
  clientName: string;
  projectName?: string;
  date?: string;
  hidePrices?: boolean;
}

const DossierTemplate: React.FC<DossierProps> = ({ sections, salesperson, clientName, projectName, date, hidePrices = false }) => {
  
  return (
    <Document>
      {/* --- PORTADA GENERAL DEL DOSSIER --- */}
      <Page size="A4" orientation="landscape" style={styles.coverPage}>
        <View style={{alignItems: 'center'}}>
           <Text style={styles.coverTitle}>{projectName || 'DOSSIER'}</Text>
           <View style={{width: 80, height: 3, backgroundColor: COLORS.accentGold, marginVertical: 20}} />
           <Text style={styles.coverSubtitle}>BACCESSORY</Text>
        </View>
         <View style={styles.coverFooter}>
            <Text style={{color: '#888', fontSize: 10, marginBottom: 5}}>PREPARADO PARA</Text>
            <Text style={{color: COLORS.white, fontSize: 16, letterSpacing: 2}}>{clientName || 'CLIENTE VIP'}</Text>
            
            <Text style={{color: COLORS.accentGold, fontSize: 10, marginTop: 15, textTransform: 'uppercase', letterSpacing: 2}}>
                {salesperson || 'JOHALIS MONTILLA'} • SALES EXECUTIVE
            </Text>

            <Text style={{color: '#666', fontSize: 10, marginTop: 5}}>{date || new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* --- BUCLE PRINCIPAL: ITERAR POR SECCIONES --- */}
      {sections.map((section, sectionIndex) => {
        const groupedProducts = groupProductsByType(section.items);
        const categories = Object.keys(groupedProducts);

        return (
        <React.Fragment key={sectionIndex}>
          
          {/* A. PORTADA DE SECCIÓN */}
          <Page size="A4" orientation="landscape" style={styles.sectionCoverPage}>
             <Text style={styles.sectionTitle}>{section.name}</Text>
             <Text style={styles.sectionSubtitle}>{section.items.length} PRODUCTOS SELECCIONADOS</Text>
          </Page>

          {/* B. PRODUCTOS */}
          {categories.map((category) => (
             groupedProducts[category].map((product: Product, prodIndex: number) => (
            <Page key={`${sectionIndex}-${category}-${prodIndex}`} size="A4" orientation="landscape" style={styles.page} wrap={false}>
              
              {/* 1. TOP BAR */}
              <View style={styles.topBar}>
                <Text style={styles.topBarLogo}>BACCESSORY • {section.name}</Text>
                <View style={styles.topBarInfo}>
                    <Text style={styles.topBarText}>{product.brand}</Text>
                    {product.collection_name && (
                        <>
                            <View style={styles.separator} />
                            <Text style={styles.topBarText}>{product.collection_name}</Text>
                        </>
                    )}
                    {product.type && (
                         <>
                            <View style={styles.separator} />
                            <Text style={styles.topBarText}>{product.type}</Text>
                        </>
                    )}
                </View>
              </View>

              {/* 2. MAIN CONTENT - TWO COLUMNS */}
              <View style={styles.mainContent}>
                 
                 {/* LEFT COLUMN: IMAGES */}
                 <View style={styles.leftColumn}>
                     <View style={styles.imageSection}>

                        {product.image_url ? (
                            // eslint-disable-next-line jsx-a11y/alt-text
                            <Image src={product.image_url} style={styles.heroImage} />
                        ) : (
                            <Text style={{color: '#ccc', fontSize: 10}}>Sin Imagen</Text>
                        )}
                     </View>

                     <View style={styles.techDrawingContainer}>
                            <Text style={styles.techLabel}>DIBUJO TÉCNICO</Text>
                            {product.tech_drawing_url ? (
                                // eslint-disable-next-line jsx-a11y/alt-text
                                <Image src={product.tech_drawing_url} style={styles.techImage} />
                            ) : (
                                <Text style={{fontSize: 8, color: '#ccc'}}>Plano no disponible</Text>
                            )}
                     </View>
                 </View>

                 {/* RIGHT COLUMN: TEXT */}
                 <View style={styles.rightColumn}>
                     <View style={styles.textSection}>
                            <View style={styles.headerBlock}>
                                <Text style={styles.brandTitle}>{product.brand}</Text>
                                <Text style={styles.productTitle}>{product.name}</Text>
                                
                                <Text style={styles.description}>
                                    {product.description || ''}
                                </Text>
                            </View>

                            {product.features && product.features.length > 0 && (
                                <View style={styles.featuresBlock}>
                                    {product.features.map((feat, i) => (
                                        <View key={i} style={styles.featureItem}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={{fontSize: 10, color: COLORS.textGray, width: '90%'}}>{feat}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                     </View>

                             {(product.warranty_type || product.warranty_duration) && (
                              <View style={styles.warrantyBlock}>
                                    <Text style={styles.warrantyTitle}>{product.warranty_type || 'GARANTÍA'}</Text>
                                    {product.warranty_duration && (
                                        <Text style={styles.warrantyValue}>{product.warranty_duration}</Text>
                                    )}
                              </View>
                            )}
                     </View>
                 </View>



              {/* 3. BOTTOM BAR */}
              <View style={styles.bottomBar}>
                  <View style={styles.specCell}><Text style={styles.specLabel}>SKU</Text><Text style={styles.specValue}>{product.sku}</Text></View>
                  <View style={styles.specCell}><Text style={styles.specLabel}>ACABADO</Text><Text style={styles.specValue}>{product.finish || '-'}</Text></View>
                  <View style={styles.specCell}><Text style={styles.specLabel}>TIPO</Text><Text style={styles.specValue}>{product.type || category}</Text></View>
                  <View style={styles.specCell}><Text style={styles.specLabel}>ORIGEN</Text><Text style={styles.specValue}>{product.origin || product.brand}</Text></View>
                  <View style={styles.specCellLast}>
                    <Text style={{...styles.specLabel, color: COLORS.accentGold}}>PRECIO</Text>
                    <Text style={styles.priceValue}>
                        {hidePrices ? 'CONSULTAR' : `$${Number(product.price).toFixed(2)}`}
                    </Text>
                  </View>
              </View>

            </Page>
          ))
          ))}
        </React.Fragment>
        );
      })}
    </Document>
  );
};

export default DossierTemplate;