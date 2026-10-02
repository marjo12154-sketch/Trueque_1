import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Esquema estructurado obligatorio para la evaluación del libro escolar
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    nivelEstimado: {
      type: Type.STRING,
      description: "Nivel escolar estimado (ej: '2.º año Secundaria', '1.º Bachillerato', 'Ciclo Básico')."
    },
    materiaDetectada: {
      type: Type.STRING,
      description: "Materia escolar identificada para clasificar el libro."
    },
    vidaUtilCiclos: {
      type: Type.INTEGER,
      description: "Cantidad estimada de años o ciclos lectivos adicionales que puede soportar el ejemplar (1 a 4)."
    },
    indiceAprovechamiento: {
      type: Type.INTEGER,
      description: "Puntuación de 1 a 100 sobre qué tanto vale la pena rescatar e intercambiar este libro."
    },
    etiquetasCompatibilidad: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 a 5 palabras clave de compatibilidad curricular (editorial, temas, año)."
    },
    consejoCuidado: {
      type: Type.STRING,
      description: "Consejo breve y práctico para el estudiante que lo entrega o lo recibe."
    }
  },
  required: [
    "nivelEstimado",
    "materiaDetectada",
    "vidaUtilCiclos",
    "indiceAprovechamiento",
    "etiquetasCompatibilidad",
    "consejoCuidado"
  ]
};

// Función de contingencia (regla heurística manual) por si no hay API key o la IA no responde
function evaluarConReglasLocales(titulo: string, estado: string, notas?: string) {
  const norm = (titulo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  
  // Detección de nivel por patrones
  let nivel = 'Secundaria General';
  if (norm.includes('1') || norm.includes('1.°') || norm.includes('1.º')) nivel = '1.º año Secundaria';
  else if (norm.includes('2') || norm.includes('2.°') || norm.includes('2.º')) nivel = '2.º año Secundaria';
  else if (norm.includes('3') || norm.includes('3.°') || norm.includes('3.º')) nivel = '3.º año Secundaria';
  else if (norm.includes('4') || norm.includes('4.°') || norm.includes('4.º')) nivel = '4.º año Secundaria';
  else if (norm.includes('5') || norm.includes('bachill')) nivel = 'Bachillerato';

  // Detección de materia
  let materia = 'Matemáticas';
  if (norm.includes('matemat') || norm.includes('calcul') || norm.includes('algeb')) materia = 'Matemáticas';
  else if (norm.includes('lengua') || norm.includes('literat')) materia = 'Lengua y Literatura';
  else if (norm.includes('biolog') || norm.includes('cienc')) materia = 'Ciencias Naturales';
  else if (norm.includes('geograf') || norm.includes('histor')) materia = 'Geografía e Historia';
  else if (norm.includes('ingl') || norm.includes('english')) materia = 'Inglés';
  else if (norm.includes('fisic') || norm.includes('quimic')) materia = 'Física y Química';

  // Vida útil e índice según estado de conservación
  let vidaUtil = 2;
  let indice = 80;
  if (estado === 'Excelente') {
    vidaUtil = 3;
    indice = 95;
  } else if (estado === 'Aceptable') {
    vidaUtil = 1;
    indice = 65;
  }

  return {
    nivelEstimado: nivel,
    materiaDetectada: materia,
    vidaUtilCiclos: vidaUtil,
    indiceAprovechamiento: indice,
    etiquetasCompatibilidad: [materia, nivel, 'Plan Oficial', 'Libro Físico'],
    consejoCuidado: estado === 'Excelente' 
      ? 'Conservar el forro plástico para maximizar su uso.' 
      : 'Revisar ejercicios a lápiz y borrar anotaciones antes de entregar.',
    origen: 'regla_manual_contingencia'
  };
}

// Endpoint de la IA (Sello de Trueque Escolar: Evaluación de Reutilización)
app.post('/api/evaluar-libro', async (req, res) => {
  const { titulo, estado, notas, fotoBase64 } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'Se requiere el título del libro.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Si no hay API key configurada, aplicamos la regla de decisión a mano transparente y documentada
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const evaluacionManual = evaluarConReglasLocales(titulo, estado, notas);
    return res.json({
      exito: true,
      datos: evaluacionManual,
      aviso: 'Evaluación generada mediante reglas heurísticas locales (clave GEMINI_API_KEY no detectada).'
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const promptTexto = `Analiza este libro escolar para el trueque del instituto:
Título: "${titulo}"
Estado físico reportado: "${estado || 'Bueno'}"
Notas del alumno: "${notas || 'Sin notas adicionales'}"

Genera una evaluación técnica estructurada de compatibilidad y vida útil escolar.`;

    const contents: any[] = [];

    // Si viene foto en base64, la adjuntamos para análisis visual multimodal
    if (fotoBase64 && fotoBase64.startsWith('data:image/')) {
      const match = fotoBase64.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    contents.push({ text: promptTexto });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Gemini')), 3500)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: 'Eres el tasador y clasificador pedagógico de Trueque Escolar. Devuelve únicamente el objeto JSON con el esquema definido.',
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const response = (await Promise.race([callPromise, timeoutPromise])) as any;

    const rawText = response.text?.trim() || '{}';
    const jsonParsed = JSON.parse(rawText);

    return res.json({
      exito: true,
      datos: {
        ...jsonParsed,
        origen: 'gemini_api'
      }
    });
  } catch (error: any) {
    console.warn('Fallo en la llamada a Gemini API, activando contingencia:', error?.message || error);
    // Contingencia inmediata sin tumbar la app
    const fallback = evaluarConReglasLocales(titulo, estado, notas);
    return res.json({
      exito: true,
      datos: fallback,
      aviso: 'La IA demoró o no respondió; se aplicó la regla de contingencia local de forma automática.'
    });
  }
});

// Configuración de servidor Vite o estático
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Servidor de Trueque Escolar activo en http://localhost:${PORT}`);
  });
}

startServer();
