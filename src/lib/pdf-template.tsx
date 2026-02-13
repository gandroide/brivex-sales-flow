/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- COLORES PREMIUM ---
const COLORS = {
  primaryDark: '#121212', 
  accentGold: '#C9A84C',  
  textGray: '#666666',    
  lightGray: '#F9F9F9',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white,
    fontSize: 9,
    color: COLORS.primaryDark,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
  },
  
  // --- CABECERA (A lo ancho) ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  goldDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.accentGold,
    borderRadius: 3, // Círculo
    marginLeft: 5,
    marginRight: 10,
  },
  tagline: {
    fontSize: 7,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingLeft: 10,
  },
  clientSection: {
    textAlign: 'right',
  },
  clientName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  docDate: {
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  // --- LAYOUT MAESTRO (Horizontal Split) ---
  // Una página por producto para máximo impacto
  productPageWrapper: {
    flex: 1,
    flexDirection: 'row', // Lado a lado
    gap: 30,
  },

  // COLUMNA IZQUIERDA: VISUAL (60% del ancho)
  leftColumn: {
    flex: 1.6, 
    height: '100%',
    backgroundColor: COLORS.lightGray,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  heroImage: {
    width: '100%',
    height: '90%',
    objectFit: 'contain',
  },

  // COLUMNA DERECHA: DATOS (40% del ancho)
  rightColumn: {
    flex: 1,
    justifyContent: 'space-between', // Distribuye contenido verticalmente
    paddingVertical: 10,
  },

  // Bloque Superior Derecha: Títulos
  titleBlock: {
    marginBottom: 20,
  },
  brandName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 5,
  },
  productName: {
    fontSize: 22, // Título grande
    fontWeight: 'light', 
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    lineHeight: 1.1,
  },

  // Bloque Medio Derecha: Specs y Plano
  specsBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: 15,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  specLabel: {
    fontSize: 8,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  specValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },

  // Plano Técnico pequeño
  techDrawingSmall: {
    height: 100,
    marginTop: 20,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 5,
  },

  // Bloque Inferior Derecha: Precio y Descripción
  bottomBlock: {
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 8,
    color: COLORS.textGray,
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 15,
  },
  priceContainer: {
    backgroundColor: COLORS.primaryDark, // Caja negra fuerte
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceLabel: {
    color: '#888',
    fontSize: 6,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 3,
  },
  priceValue: {
    color: COLORS.accentGold,
    fontSize: 20,
    fontWeight: 'bold',
  },

  footer: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 6,
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },


  // --- COVER PAGE STYLES ---
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.primaryDark,
    color: COLORS.white,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    position: 'relative', // For absolute positioning of footer
  },
  coverLogoText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 10,
    textTransform: 'uppercase',
    marginBottom: 80,
  },
  coverProjectName: {
    fontSize: 70,
    fontWeight: 'normal',
    color: COLORS.accentGold,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 40,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  coverClientLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 5,
  },
  coverClientName: {
    fontSize: 24,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  coverSalesperson: {
    fontSize: 10,
    color: COLORS.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  coverDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.accentGold,
    marginBottom: 20,
  },
});

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
}

interface DossierProps {
  products: Product[];
  clientName: string;
  projectName?: string;
  date?: string;
}

const DossierTemplate: React.FC<DossierProps> = ({ products, clientName, projectName, date }) => (
  <Document>
    {/* --- COVER PAGE --- */}
    <Page size="A4" orientation="landscape" style={styles.coverPage}>
      <Text style={styles.coverLogoText}>BACCESSORY</Text>
      
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.coverProjectName}>{projectName || 'ARQUITECTURA'}</Text>
        <View style={styles.coverDivider} />
      </View>

      <View style={styles.coverFooter}>
        <Text style={styles.coverClientLabel}>PREPARED FOR</Text>
        <Text style={styles.coverClientName}>{clientName || 'CLIENT'}</Text>
        
        <Text style={styles.coverSalesperson}>Johalis Montilla • Sales Executive</Text>
        <Text style={{fontSize: 8, color: '#444', marginTop: 10, letterSpacing: 1}}>
           {date || new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>

    {/* --- PRODUCT PAGES --- */}
    {/* Agregamos orientation="landscape" */}
    <Page size="A4" orientation="landscape" style={styles.page}>
      
      {/* Cabecera (Se repite en cada página si hay muchos productos, 
          o puedes moverla fuera del map si quieres una portada) */}
      <View style={styles.headerContainer}>
        <View style={styles.logoSection}>
            <Text style={styles.logoText}>BACCESSORY</Text>
            <View style={styles.goldDot} />
            <Text style={styles.tagline}>Architectural Solutions</Text>
        </View>
        <View style={styles.clientSection}>
          <Text style={styles.clientName}>{clientName || 'CLIENTE'}</Text>
          {projectName && <Text style={styles.clientName}>{projectName}</Text>}
          <Text style={styles.docDate}>{date || new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Como es apaisado, recomendamos 1 producto por página para que se vea INCREÍBLE.
          Pero si quieres lista, el diseño se adapta. Aquí forzamos salto de página por producto */}
      {products.map((product, index) => (
        <View key={index} style={styles.productPageWrapper} break={index > 0}>
            
            {/* IZQUIERDA: HERO IMAGE */}
            <View style={styles.leftColumn}>
                {product.image_url ? (
                    <Image src={product.image_url} style={styles.heroImage} />
                ) : (
                    <Text style={{color: '#ccc', fontSize: 10}}>Imagen de Referencia No Disponible</Text>
                )}
            </View>

            {/* DERECHA: INFO TÉCNICA */}
            <View style={styles.rightColumn}>
                
                {/* Títulos */}
                <View style={styles.titleBlock}>
                    <Text style={styles.brandName}>{product.brand || 'PREMIUM BRAND'}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                </View>

                {/* Tabla de Especificaciones */}
                <View style={styles.specsBlock}>
                    <View style={styles.specRow}>
                        <Text style={styles.specLabel}>CÓDIGO (SKU)</Text>
                        <Text style={styles.specValue}>{product.sku}</Text>
                    </View>
                    
                    {product.finish && (
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>ACABADO</Text>
                            <Text style={styles.specValue}>{product.finish}</Text>
                        </View>
                    )}

                    {product.collection_name && (
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>COLECCIÓN</Text>
                            <Text style={styles.specValue}>{product.collection_name}</Text>
                        </View>
                    )}

                    {product.origin && (
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>ORIGEN</Text>
                            <Text style={styles.specValue}>{product.origin}</Text>
                        </View>
                    )}

                    {/* Plano Técnico Miniatura (Si existe) */}
                    {product.tech_drawing_url && (
                         <View style={styles.techDrawingSmall}>
                             <Image src={product.tech_drawing_url} style={{width:'100%', height:'100%', objectFit:'contain'}} />
                         </View>
                    )}
                </View>

                {/* Footer del Producto: Descripción y Precio */}
                <View style={styles.bottomBlock}>
                    <Text style={styles.descriptionText}>
                        {product.description ? product.description.substring(0, 300) : 'Especificaciones técnicas disponibles bajo pedido. Producto de alta gama con garantía de fábrica.'}
                        {product.description && product.description.length > 300 ? '...' : ''}
                    </Text>
                    
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>PRECIO UNITARIO (USD)</Text>
                        <Text style={styles.priceValue}>${Number(product.price).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        </View>
      ))}

      <Text style={styles.footer} fixed>
         CONFIDENCIAL • Generado por Sales Flow para Baccessory • {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);

export default DossierTemplate;