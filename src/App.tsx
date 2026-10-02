/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Trueque Escolar - Plataforma colaborativa para el instituto.
 * "Los libros del año pasado duermen en una caja mientras otro los necesita."
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Tag,
  Camera,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  PackageCheck,
  AlertCircle,
  Download,
  Database,
  Brain,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { BookItem, BookCondition, EvaluacionIA } from './types';

// ============================================================================
// MATERIAS PREDEFINIDAS DEL INSTITUTO
// ============================================================================
const MATERIAS_COMUNES = [
  'Matemáticas',
  'Lengua y Literatura',
  'Ciencias Naturales',
  'Geografía e Historia',
  'Física y Química',
  'Biología y Geología',
  'Inglés',
  'Filosofía',
  'Tecnología',
  'Música',
  'Plástica y Dibujo',
  'Otra materia'
];

// Opciones de portada genérica ilustrada según la materia (utilizadas si el alumno no sube foto)
const PORTADAS_POR_MATERIA: Record<string, string> = {
  'Matemáticas': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
  'Lengua y Literatura': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
  'Ciencias Naturales': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
  'Geografía e Historia': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
  'Física y Química': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
  'Biología y Geología': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
  'Inglés': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'Filosofía': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'Tecnología': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'Música': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'Plástica y Dibujo': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
};

// ============================================================================
// DATOS SEMILLA INICIALES (para no arrancar con la app desierta)
// ============================================================================
const LIBROS_INICIALES: BookItem[] = [
  {
    id: 'demo-1',
    title: 'Matemáticas de 2.º año',
    subject: 'Matemáticas',
    year: '2.º año',
    condition: 'Bueno',
    photoUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    notes: 'Editorial Santillana. Contiene ejercicios resueltos a lápiz, muy cuidado.',
    contactName: 'Sofía (3.° B)',
    isDelivered: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // hace 1 día
    evaluacionIA: {
      nivelEstimado: '2.º año Secundaria',
      materiaDetectada: 'Matemáticas',
      vidaUtilCiclos: 2,
      indiceAprovechamiento: 88,
      etiquetasCompatibilidad: ['Santillana', 'Álgebra', 'Geometría', 'Secundaria'],
      consejoCuidado: 'Borrar apuntes a lápiz antes de entregar para que el compañero resuelva de cero.',
      origen: 'gemini_api'
    }
  },
  {
    id: 'demo-2',
    title: 'Lengua Castellana y Literatura 1.º',
    subject: 'Lengua y Literatura',
    year: '1.º año',
    condition: 'Excelente',
    photoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    notes: 'Forrado, sin subrayados ni marcas. Como nuevo.',
    contactName: 'Martín (2.° A)',
    isDelivered: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    evaluacionIA: {
      nivelEstimado: '1.º año Secundaria',
      materiaDetectada: 'Lengua y Literatura',
      vidaUtilCiclos: 3,
      indiceAprovechamiento: 96,
      etiquetasCompatibilidad: ['Gramática', 'Lecturas', 'Sin marcas', 'Forrado'],
      consejoCuidado: 'Mantener el forrado transparente original para proteger las tapas.',
      origen: 'gemini_api'
    }
  },
  {
    id: 'demo-3',
    title: 'Biología y Geología - Proyecto Saber Hacer',
    subject: 'Biología y Geología',
    year: '3.º año',
    condition: 'Aceptable',
    photoUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    notes: 'Tiene esquinas algo gastadas pero todas las páginas están completas y legibles.',
    contactName: 'Lucía (4.° C)',
    isDelivered: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    evaluacionIA: {
      nivelEstimado: '3.º año Secundaria',
      materiaDetectada: 'Biología y Geología',
      vidaUtilCiclos: 1,
      indiceAprovechamiento: 70,
      etiquetasCompatibilidad: ['Saber Hacer', 'Ecosistemas', 'Geología'],
      consejoCuidado: 'Reforzar lomo con cinta adhesiva transparente para evitar desprendimientos.',
      origen: 'gemini_api'
    }
  }
];

const LOCAL_STORAGE_KEY = 'trueque_escolar_libros_v1';

// ============================================================================
// FUNCIÓN AUXILIAR: Búsqueda tolerante a tildes, acentos y mayúsculas
// ----------------------------------------------------------------------------
// PUNTO CLAVE DE ERROR:
// Si alguien busca "Matematicas" sin tilde y el libro está registrado como "Matemáticas",
// un simple .toLowerCase().includes() fallará. Normalizamos con NFD eliminando marcas diacríticas.
// ============================================================================
function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .normalize('NFD') // Descompone caracteres con acento (ej. é -> e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Elimina los signos diacríticos
    .toLowerCase()
    .trim();
}

// ============================================================================
// COMPRESIÓN Y REDIMENSIÓN DE IMÁGENES
// ----------------------------------------------------------------------------
// PUNTO CLAVE DE ERROR:
// Las fotos tomadas directamente con cámaras móviles modernas pesan entre 4 MB y 15 MB.
// Si se convierten en Base64 tal cual, localStorage explotará con DOMException: QuotaExceededError
// (el límite estándar de localStorage en navegadores es de solo ~5 MB totales).
// Redimensionamos la imagen mediante un canvas a un ancho máximo de 600px y compresión JPEG 0.72.
// ============================================================================
function comprimirImagen(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer el archivo de imagen'));
    lector.onload = (evento) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no compatible'));
      img.onload = () => {
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let ancho = img.width;
        let alto = img.height;

        if (ancho > alto) {
          if (ancho > MAX_WIDTH) {
            alto = Math.round((alto * MAX_WIDTH) / ancho);
            ancho = MAX_WIDTH;
          }
        } else {
          if (alto > MAX_HEIGHT) {
            ancho = Math.round((ancho * MAX_HEIGHT) / alto);
            alto = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de imagen'));
          return;
        }

        // Fondo blanco por si la imagen tiene transparencias (PNG/WebP)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, ancho, alto);
        ctx.drawImage(img, 0, 0, ancho, alto);

        // Convertir a JPEG optimizado (calidad 0.72 ~ 30-50 KB en Base64)
        const base64Comprimido = canvas.toDataURL('image/jpeg', 0.72);
        resolve(base64Comprimido);
      };
      img.src = evento.target?.result as string;
    };
    lector.readAsDataURL(archivo);
  });
}

export default function App() {
  // --------------------------------------------------------------------------
  // ESTADO PRINCIPAL: Lista de libros con persistencia en localStorage
  // --------------------------------------------------------------------------
  const [libros, setLibros] = useState<BookItem[]>(() => {
    /* PUNTO CLAVE DE ERROR:
     * El acceso a localStorage puede fallar si el usuario está en modo privado estricto
     * o si los datos almacenados quedaron en un formato JSON corrupto.
     * Siempre se debe envolver en try/catch y tener un fallback predefinido.
     */
    try {
      const guardados = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (guardados) {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer localStorage; usando datos iniciales.', e);
    }
    return LIBROS_INICIALES;
  });

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(libros));
    } catch (e) {
      console.error('Error al guardar en localStorage (posible límite de espacio):', e);
    }
  }, [libros]);

  // --------------------------------------------------------------------------
  // ESTADO DE BÚSQUEDA Y FILTROS
  // --------------------------------------------------------------------------
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('Todas');
  const [pestanaActiva, setPestanaActiva] = useState<'disponibles' | 'entregados'>('disponibles');

  // --------------------------------------------------------------------------
  // ESTADO DEL MODAL DE PUBLICACIÓN
  // --------------------------------------------------------------------------
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaMateria, setNuevaMateria] = useState('Matemáticas');
  const [materiaPersonalizada, setMateriaPersonalizada] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<BookCondition>('Bueno');
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
  const [nuevasNotas, setNuevasNotas] = useState('');
  const [nuevoContacto, setNuevoContacto] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false); // Previene doble clic

  // Estado del Sello de IA de Trueque Escolar (Salida Estructurada)
  const [evaluacionActual, setEvaluacionActual] = useState<EvaluacionIA | null>(null);
  const [analizandoIA, setAnalizandoIA] = useState(false);
  const [avisoIA, setAvisoIA] = useState('');

  // Mensaje flotante de notificación (Toast feedback)
  const [toast, setToast] = useState<{ mensaje: string; tipo?: 'exito' | 'info' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'info' | 'error' = 'exito') => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ mensaje, tipo });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // --------------------------------------------------------------------------
  // MEJORA 5 (M5): LLAMADA A LA API DE GEMINI CON SALIDA ESTRUCTURADA
  // --------------------------------------------------------------------------
  const analizarLibroConIA = async () => {
    const tituloLimpio = nuevoTitulo.trim();
    if (!tituloLimpio || tituloLimpio.length < 3) {
      setErrorFormulario('Para evaluar con IA, escribe al menos el título o materia del libro (mín. 3 letras).');
      return;
    }

    try {
      setAnalizandoIA(true);
      setErrorFormulario('');
      setAvisoIA('');

      const res = await fetch('/api/evaluar-libro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tituloLimpio,
          estado: nuevoEstado,
          notas: nuevasNotas.trim(),
          fotoBase64: nuevaFotoUrl
        })
      });

      const data = await res.json();
      if (data && data.datos) {
        setEvaluacionActual(data.datos);
        if (data.datos.materiaDetectada && MATERIAS_COMUNES.includes(data.datos.materiaDetectada)) {
          setNuevaMateria(data.datos.materiaDetectada);
        }
        if (data.aviso) {
          setAvisoIA(data.aviso);
        }
        mostrarToast('¡Evaluación estructurada completada con éxito!');
      } else {
        throw new Error('Respuesta inválida');
      }
    } catch {
      mostrarToast('No se pudo conectar con la IA de Gemini; los datos se pueden cargar manualmente sin problema.', 'info');
    } finally {
      setAnalizandoIA(false);
    }
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN 1: PUBLICAR UN ARTÍCULO CON VALIDACIONES ESTRICTAS DE QA
  // --------------------------------------------------------------------------
  const manejarPublicar = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Evitar doble clic concurrente
    if (enviandoFormulario) return;

    // 2. Sanitizar y validar título (no vacío, no solo espacios, mínimo 3 caracteres)
    const tituloLimpio = nuevoTitulo.trim().replace(/\s+/g, ' ');
    if (!tituloLimpio || tituloLimpio.length < 3) {
      setErrorFormulario('Por favor escribe un título claro de al menos 3 caracteres (ej: "Matemáticas 2.º año").');
      return;
    }

    if (tituloLimpio.length > 80) {
      setErrorFormulario('El título es demasiado largo (máximo 80 caracteres permitidos).');
      return;
    }

    // 3. Validar si seleccionó "Otra materia"
    let materiaFinal = nuevaMateria;
    if (nuevaMateria === 'Otra materia') {
      const materiaLimpia = materiaPersonalizada.trim().replace(/\s+/g, ' ');
      if (!materiaLimpia || materiaLimpia.length < 2) {
        setErrorFormulario('Por favor escribe el nombre de la materia (mínimo 2 letras).');
        return;
      }
      if (materiaLimpia.length > 40) {
        setErrorFormulario('El nombre de la materia es demasiado largo (máximo 40 caracteres).');
        return;
      }
      materiaFinal = materiaLimpia;
    }

    // 4. Validar límite de caracteres en notas y contacto
    const notasLimpias = nuevasNotas.trim().replace(/\s+/g, ' ');
    if (notasLimpias.length > 250) {
      setErrorFormulario('Las notas no pueden superar los 250 caracteres.');
      return;
    }

    const contactoLimpio = nuevoContacto.trim().replace(/\s+/g, ' ');
    if (contactoLimpio.length > 50) {
      setErrorFormulario('El dato de contacto no puede superar los 50 caracteres.');
      return;
    }

    try {
      setEnviandoFormulario(true);

      // Si el usuario no subió una foto propia, asignamos una foto ilustrativa de calidad por materia
      const fotoFinal =
        nuevaFotoUrl ||
        PORTADAS_POR_MATERIA[materiaFinal] ||
        PORTADAS_POR_MATERIA['default'];

      const nuevoLibro: BookItem = {
        id: 'libro-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: tituloLimpio,
        subject: materiaFinal,
        condition: nuevoEstado,
        photoUrl: fotoFinal,
        notes: notasLimpias || undefined,
        contactName: contactoLimpio || undefined,
        isDelivered: false,
        createdAt: Date.now(),
        evaluacionIA: evaluacionActual || undefined
      };

      setLibros((anteriores) => [nuevoLibro, ...anteriores]);

      // Limpiar formulario y cerrar modal
      setNuevoTitulo('');
      setNuevaMateria('Matemáticas');
      setMateriaPersonalizada('');
      setNuevoEstado('Bueno');
      setNuevaFotoUrl('');
      setNuevasNotas('');
      setNuevoContacto('');
      setErrorFormulario('');
      setEvaluacionActual(null);
      setAvisoIA('');
      setModalAbierto(false);

      setPestanaActiva('disponibles');

      mostrarToast(`¡Listo! "${tituloLimpio}" ya está publicado y visible para tus compañeros.`);
    } catch {
      setErrorFormulario('Ocurrió un problema inesperado al guardar la publicación. Por favor intenta de nuevo.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  // Manejo seguro de carga de archivo de foto desde cámara o galería
  const manejarSeleccionFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    const archivo = archivos[0];
    if (!archivo.type || !archivo.type.startsWith('image/')) {
      setErrorFormulario('El archivo debe ser una imagen válida (JPG, PNG o WebP).');
      return;
    }

    // Evitar procesar archivos excesivamente gigantes (> 25 MB)
    if (archivo.size > 25 * 1024 * 1024) {
      setErrorFormulario('La foto seleccionada es demasiado pesada. Elige una imagen menor a 25 MB.');
      return;
    }

    try {
      setProcesandoFoto(true);
      setErrorFormulario('');
      const base64Optimizado = await comprimirImagen(archivo);
      setNuevaFotoUrl(base64Optimizado);
    } catch {
      setErrorFormulario('No pudimos procesar esa foto. Por favor intenta con otra imagen o toma una foto directa.');
    } finally {
      setProcesandoFoto(false);
    }
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN 3: MARCAR COMO ENTREGADO Y RETIRARLO DE LA LISTA
  // --------------------------------------------------------------------------
  const marcarComoEntregado = (id: string, titulo: string) => {
    setLibros((anteriores) =>
      anteriores.map((item) =>
        item.id === id
          ? { ...item, isDelivered: true, deliveredAt: Date.now() }
          : item
      )
    );

    mostrarToast(`¡Excelente! "${titulo}" fue marcado como entregado y ya no figura en la lista activa.`, 'info');
  };

  // Acción para restaurar en caso de que alguien se equivoque al tocar
  const restaurarLibro = (id: string, titulo: string) => {
    setLibros((anteriores) =>
      anteriores.map((item) =>
        item.id === id ? { ...item, isDelivered: false, deliveredAt: undefined } : item
      )
    );
    mostrarToast(`"${titulo}" volvió a estar disponible en la lista.`);
  };

  // Acción para eliminar definitivamente
  const eliminarDefinitivo = (id: string, titulo: string) => {
    setLibros((anteriores) => anteriores.filter((item) => item.id !== id));
    mostrarToast(`"${titulo}" fue eliminado del registro.`);
  };

  // --------------------------------------------------------------------------
  // MEJORA 2: EXPORTAR DATOS A ARCHIVO JSON (RESPALDO)
  // --------------------------------------------------------------------------
  const exportarDatosJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(libros, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `trueque_escolar_libros_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      mostrarToast('Archivo JSON de respaldo descargado con éxito.');
    } catch (err) {
      console.error('Error al exportar datos a JSON:', err);
      mostrarToast('No se pudo generar el archivo de respaldo.', 'info');
    }
  };

  // Restaurar datos iniciales de prueba (limpiar modificaciones locales)
  const reiniciarDatosEjemplo = () => {
    if (window.confirm('¿Deseas restaurar la lista a los libros de prueba iniciales?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setLibros(LIBROS_INICIALES);
      mostrarToast('Datos restaurados al estado inicial.');
    }
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN 2: BUSCAR POR MATERIA O PALABRA CLAVE
  // --------------------------------------------------------------------------
  const librosFiltrados = useMemo(() => {
    const terminoNormalizado = normalizarTexto(terminoBusqueda);

    return libros.filter((libro) => {
      // 1. Filtrar por pestaña (disponible vs entregado)
      if (pestanaActiva === 'disponibles' && libro.isDelivered) return false;
      if (pestanaActiva === 'entregados' && !libro.isDelivered) return false;

      // 2. Filtrar por materia seleccionada
      if (materiaSeleccionada !== 'Todas') {
        if (normalizarTexto(libro.subject) !== normalizarTexto(materiaSeleccionada)) {
          return false;
        }
      }

      // 3. Filtrar por palabra clave de búsqueda
      if (!terminoNormalizado) return true;

      const tituloNorm = normalizarTexto(libro.title);
      const materiaNorm = normalizarTexto(libro.subject);
      const notasNorm = normalizarTexto(libro.notes || '');
      const cursoNorm = normalizarTexto(libro.year || '');

      return (
        tituloNorm.includes(terminoNormalizado) ||
        materiaNorm.includes(terminoNormalizado) ||
        notasNorm.includes(terminoNormalizado) ||
        cursoNorm.includes(terminoNormalizado)
      );
    });
  }, [libros, terminoBusqueda, materiaSeleccionada, pestanaActiva]);

  // Contadores
  const totalDisponibles = useMemo(
    () => libros.filter((l) => !l.isDelivered).length,
    [libros]
  );
  const totalEntregados = useMemo(
    () => libros.filter((l) => l.isDelivered).length,
    [libros]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col pb-24 md:pb-12">
      {/* ==================================================================== */}
      {/* ENCABEZADO PRINCIPAL (Optimizado para móvil y escritorio) */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                Trueque Escolar
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  Instituto
                </span>
              </h1>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                Los libros del año pasado en manos de quien los necesita
              </p>
            </div>
          </div>

          {/* Acciones de cabecera: Respaldar JSON y Publicar */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportarDatosJSON}
              title="Descargar copia de seguridad en JSON"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            {/* Botón rápido de publicar para desktop / tablet */}
            <button
              onClick={() => {
                setErrorFormulario('');
                setModalAbierto(true);
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publicar libro
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* HERO BANNER INFORMATIVO (Contexto claro del problema que resuelve) */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-amber-200">
              Comunidad estudiantil
            </p>
            <p className="text-sm md:text-base font-medium text-amber-50">
              ¿Tus libros del curso pasado duermen en una caja? Donalos o intercambialos con otros compañeros.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>100% libre y gratuito</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ZONA DE CONTROL: BÚSQUEDA Y FILTROS */}
      {/* ==================================================================== */}
      <main className="max-w-4xl mx-auto w-full px-3 sm:px-4 pt-4 flex-1">
        {/* Barra de búsqueda interactiva con label accesible */}
        <div className="mb-3">
          <label htmlFor="barra-busqueda-libros" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Buscar libros por materia o palabras clave
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="barra-busqueda-libros"
              type="text"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Ej: Matemáticas, 2.º año, Lengua..."
              className="w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-300 rounded-2xl text-base font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600 shadow-xs transition-all"
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={() => setTerminoBusqueda('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 p-2"
                title="Borrar búsqueda"
                aria-label="Borrar texto de búsqueda"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Carrusel horizontal de materias para filtro táctil en móvil */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Filtrar por materia:
          </p>
          <div className="overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMateriaSeleccionada('Todas')}
              className={`shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                materiaSeleccionada === 'Todas'
                  ? 'bg-slate-950 text-white shadow-sm ring-2 ring-slate-900'
                  : 'bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Todas las materias
            </button>
            {MATERIAS_COMUNES.map((materia) => (
              <button
                key={materia}
                type="button"
                onClick={() => setMateriaSeleccionada(materia)}
                className={`shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  materiaSeleccionada === materia
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600'
                    : 'bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {materia}
              </button>
            ))}
          </div>
        </div>

        {/* Pestañas: Libros disponibles vs Libros entregados */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 mb-4 pb-2">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPestanaActiva('disponibles')}
              className={`text-base font-extrabold pb-2 relative transition-colors cursor-pointer ${
                pestanaActiva === 'disponibles'
                  ? 'text-amber-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disponibles ({totalDisponibles})
              {pestanaActiva === 'disponibles' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva('entregados')}
              className={`text-base font-extrabold pb-2 relative transition-colors cursor-pointer ${
                pestanaActiva === 'entregados'
                  ? 'text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ya entregados ({totalEntregados})
              {pestanaActiva === 'entregados' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-700 rounded-full" />
              )}
            </button>
          </div>

          <span className="text-sm text-slate-600 font-bold">
            {librosFiltrados.length}{' '}
            {librosFiltrados.length === 1 ? 'libro' : 'libros'}
          </span>
        </div>

        {/* ================================================================== */}
        {/* LISTADO DE ARTÍCULOS / LIBROS (Y ESTADO VACÍO CLARO) */}
        {/* ================================================================== */}
        {librosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center my-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-4 border border-amber-200">
              <BookOpen className="w-8 h-8" />
            </div>
            
            {/* Mensaje de estado vacío amigable y claro */}
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 mb-2">
              {terminoBusqueda || materiaSeleccionada !== 'Todas'
                ? 'No encontramos libros con esa búsqueda'
                : libros.length === 0
                ? 'Aún no hay publicaciones. ¡Sé el primero en intercambiar un libro!'
                : pestanaActiva === 'disponibles'
                ? '¡Todos los libros fueron entregados o no hay disponibles en esta categoría!'
                : 'Todavía no hay libros registrados como entregados.'}
            </h3>

            <p className="text-base text-slate-700 max-w-md mx-auto mb-6 leading-relaxed">
              {terminoBusqueda || materiaSeleccionada !== 'Todas'
                ? `No hay publicaciones para "${terminoBusqueda || materiaSeleccionada}". Puedes limpiar los filtros para ver todos los libros disponibles.`
                : 'Ayuda a un compañero del instituto publicando ese libro que ya no usas. Es gratis, rápido y colaborativo.'}
            </p>

            {terminoBusqueda || materiaSeleccionada !== 'Todas' ? (
              <button
                type="button"
                onClick={() => {
                  setTerminoBusqueda('');
                  setMateriaSeleccionada('Todas');
                }}
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-900 rounded-2xl text-base font-bold transition-all cursor-pointer"
              >
                Ver todos los libros
              </button>
            ) : (
              pestanaActiva === 'disponibles' && (
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-2xl text-base font-extrabold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  Publicar el primer libro
                </button>
              )
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {librosFiltrados.map((libro) => (
              <article
                key={libro.id}
                className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  libro.isDelivered
                    ? 'border-emerald-300 bg-emerald-50/30 opacity-90'
                    : 'border-slate-300 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Foto del artículo con badge de estado y materia */}
                  <div className="relative aspect-4/3 bg-slate-200 overflow-hidden">
                    <img
                      src={libro.photoUrl}
                      alt={libro.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Si falla la URL remota o hay corte de red, usamos portada genérica segura sin romper la consola
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PORTADAS_POR_MATERIA['default'];
                      }}
                    />

                    {/* Badge de Materia con alto contraste */}
                    <span className="absolute top-2.5 left-2.5 bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-lg border border-slate-800 shadow-sm">
                      {libro.subject}
                    </span>

                    {/* Badge de Condición / Estado con alto contraste */}
                    <span
                      className={`absolute top-2.5 right-2.5 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm border ${
                        libro.condition === 'Excelente'
                          ? 'bg-emerald-800 text-white border-emerald-950'
                          : libro.condition === 'Bueno'
                          ? 'bg-blue-800 text-white border-blue-950'
                          : 'bg-amber-700 text-white border-amber-900'
                      }`}
                    >
                      {libro.condition}
                    </span>

                    {/* Sello de entregado */}
                    {libro.isDelivered && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-3">
                        <div className="bg-emerald-700 text-white px-4 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg border border-emerald-500">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span>¡Entregado a un compañero!</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Datos del libro con tamaño legible >= 16px */}
                  <div className="p-4 space-y-2.5">
                    <h2 className="font-extrabold text-slate-950 text-lg leading-tight line-clamp-2">
                      {libro.title}
                    </h2>

                    {libro.notes && (
                      <p className="text-base text-slate-800 line-clamp-2 leading-relaxed bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 font-medium">
                        {libro.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1">
                      <span>
                        {libro.contactName
                          ? `Compañero: ${libro.contactName}`
                          : 'Disponible para entrega en el instituto'}
                      </span>
                    </div>

                    {/* Sello de IA de Trueque Escolar: Ficha de evaluación técnica estructurada */}
                    {libro.evaluacionIA && (
                      <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 space-y-2 mt-2">
                        <div className="flex items-center justify-between gap-1 text-xs font-bold text-purple-900">
                          <span className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-purple-700" />
                            Evaluación Pedagógica
                          </span>
                          <span className="bg-purple-200/90 text-purple-950 font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                            {libro.evaluacionIA.nivelEstimado}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-lg border border-purple-100 flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aprovechamiento</span>
                            <span className="font-black text-purple-950 text-sm">
                              {libro.evaluacionIA.indiceAprovechamiento} / 100
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-purple-100 flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vida útil</span>
                            <span className="font-black text-purple-950 text-sm">
                              {libro.evaluacionIA.vidaUtilCiclos} {libro.evaluacionIA.vidaUtilCiclos === 1 ? 'año lectivo' : 'años lectivos'}
                            </span>
                          </div>
                        </div>

                        {libro.evaluacionIA.etiquetasCompatibilidad && libro.evaluacionIA.etiquetasCompatibilidad.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {libro.evaluacionIA.etiquetasCompatibilidad.map((tag, i) => (
                              <span key={i} className="text-[10px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded-md border border-purple-200/60">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {libro.evaluacionIA.consejoCuidado && (
                          <p className="text-xs font-medium text-purple-950 leading-snug bg-white/80 p-2 rounded-lg border border-purple-100">
                            💡 <span className="font-bold">Consejo:</span> {libro.evaluacionIA.consejoCuidado}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones del libro: botón secundario neutro/outline para no competir con el FAB primario */}
                <div className="p-4 pt-0 border-t-2 border-slate-100 mt-2">
                  {!libro.isDelivered ? (
                    <button
                      type="button"
                      onClick={() => marcarComoEntregado(libro.id, libro.title)}
                      className="w-full mt-3 min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 text-emerald-950 font-extrabold text-base rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-5 h-5 stroke-[2.5] text-emerald-700" />
                      Marcar como entregado
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => restaurarLibro(libro.id, libro.title)}
                        className="flex-1 min-h-[48px] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-sm rounded-xl transition-all cursor-pointer"
                        title="Devolver a la lista de disponibles"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-700" />
                        Restaurar a disponibles
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarDefinitivo(libro.id, libro.title)}
                        className="min-h-[48px] px-3 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                        title="Eliminar registro"
                        aria-label="Eliminar registro definitivamente"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* BOTÓN FLOTANTE PRINCIPAL (FAB para celular) */}
      {/* ==================================================================== */}
      <div className="fixed bottom-4 right-4 z-20 sm:hidden">
        <button
          onClick={() => {
            setErrorFormulario('');
            setModalAbierto(true);
          }}
          className="flex items-center gap-2 px-5 py-3.5 bg-amber-600 text-white rounded-full font-bold text-sm shadow-lg shadow-amber-600/40 hover:bg-amber-700 active:scale-95 transition-all"
          aria-label="Publicar libro"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Publicar</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* MODAL DE PUBLICACIÓN DE ARTÍCULO */}
      {/* ==================================================================== */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    Publicar libro escolar
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Completa los datos para que otro compañero lo encuentre
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarPublicar} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {errorFormulario && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 text-sm font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-700" />
                  <span>{errorFormulario}</span>
                </div>
              )}

              {/* 1. TÍTULO DEL LIBRO (Ej: Matemáticas de 2.º año) */}
              <div>
                <label htmlFor="campo-titulo-libro" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Título del libro o curso <span className="text-rose-600">*</span>
                </label>
                <input
                  id="campo-titulo-libro"
                  type="text"
                  required
                  maxLength={80}
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: Matemáticas de 2.º año"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base font-semibold text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
                />
                {/* Botón de sugerencia rápida para la prueba requerida */}
                <button
                  type="button"
                  onClick={() => {
                    setNuevoTitulo('Matemáticas de 2.º año');
                    setNuevaMateria('Matemáticas');
                    setNuevoEstado('Bueno');
                    setNuevasNotas('Editorial Santillana. En excelente estado, con todas las páginas.');
                  }}
                  className="mt-1.5 text-xs text-amber-800 hover:text-amber-950 font-bold underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Rellenar sugerencia: "Matemáticas de 2.º año"
                </button>
              </div>

              {/* 2. MATERIA */}
              <div>
                <label htmlFor="campo-materia-libro" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Materia escolar <span className="text-rose-600">*</span>
                </label>
                <select
                  id="campo-materia-libro"
                  value={nuevaMateria}
                  onChange={(e) => setNuevaMateria(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
                >
                  {MATERIAS_COMUNES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {nuevaMateria === 'Otra materia' && (
                  <div className="mt-2">
                    <label htmlFor="campo-otra-materia" className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre específico de la materia:
                    </label>
                    <input
                      id="campo-otra-materia"
                      type="text"
                      required
                      maxLength={40}
                      value={materiaPersonalizada}
                      onChange={(e) => setMateriaPersonalizada(e.target.value)}
                      placeholder="Escribe el nombre de la materia..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-medium text-slate-950"
                    />
                  </div>
                )}
              </div>

              {/* 3. ESTADO DEL LIBRO */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Estado de conservación del libro <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Excelente', 'Bueno', 'Aceptable'] as BookCondition[]).map(
                    (estado) => (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => setNuevoEstado(estado)}
                        className={`min-h-[48px] py-2 px-3 rounded-xl border-2 text-sm font-bold text-center transition-all cursor-pointer ${
                          nuevoEstado === estado
                            ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                            : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {estado}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {nuevoEstado === 'Excelente' && 'Sin marcas ni hojas dobladas, como nuevo.'}
                  {nuevoEstado === 'Bueno' && 'Bien cuidado, puede tener algún apunte a lápiz.'}
                  {nuevoEstado === 'Aceptable' && 'Usado, marcas o esquinas dobladas, pero totalmente legible.'}
                </p>
              </div>

              {/* 4. FOTO DEL ARTÍCULO */}
              <div>
                <label htmlFor="campo-foto-libro" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Foto del libro (desde la cámara o galería)
                </label>

                {nuevaFotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-100 aspect-16/9 mb-2">
                    <img
                      src={nuevaFotoUrl}
                      alt="Vista previa del libro subido"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNuevaFotoUrl('')}
                      className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-950 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                      title="Quitar foto"
                    >
                      <X className="w-4 h-4" />
                      <span>Cambiar</span>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="campo-foto-libro"
                    className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-400 hover:border-amber-600 rounded-2xl cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-900">
                        {procesandoFoto ? 'Comprimiendo foto...' : 'Tocar para tomar foto o elegir de la galería'}
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        Se ajusta automáticamente para que cargue rápido
                      </p>
                    </div>
                  </label>
                )}
                <input
                  id="campo-foto-libro"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={manejarSeleccionFoto}
                  disabled={procesandoFoto}
                  className="hidden"
                />
                <p className="text-xs text-slate-600 font-medium mt-1">
                  * Si no tienes foto a mano, se asignará automáticamente una imagen ilustrativa de {nuevaMateria}.
                </p>
              </div>

              {/* BOTÓN Y PANEL DEL SELLO DE IA (MEJORA 5) */}
              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-xs shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider leading-tight">
                        Sello Inteligente de Reutilización
                      </h4>
                      <p className="text-[11px] text-purple-800 leading-tight">
                        Calcula compatibilidad, nivel y vida útil con IA
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={analizarLibroConIA}
                    disabled={analizandoIA || !nuevoTitulo.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {analizandoIA ? 'Evaluando...' : 'Evaluar con IA'}
                  </button>
                </div>

                {avisoIA && (
                  <p className="text-xs font-medium text-amber-900 bg-amber-100/80 p-2 rounded-xl border border-amber-200">
                    ℹ️ {avisoIA}
                  </p>
                )}

                {evaluacionActual && (
                  <div className="bg-white rounded-xl p-3 border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Nivel escolar sugerido:</span>
                      <span className="text-purple-950 bg-purple-100 px-2 py-0.5 rounded-md font-extrabold">
                        {evaluacionActual.nivelEstimado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Aprovechamiento</span>
                        <span className="text-base font-black text-purple-950">
                          {evaluacionActual.indiceAprovechamiento} / 100
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Vida útil</span>
                        <span className="text-base font-black text-purple-950">
                          {evaluacionActual.vidaUtilCiclos} {evaluacionActual.vidaUtilCiclos === 1 ? 'año lectivo' : 'años lectivos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {evaluacionActual.etiquetasCompatibilidad.map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-purple-950 bg-purple-50/50 p-2 rounded-lg border border-purple-100">
                      💡 <span className="font-bold">Consejo:</span> {evaluacionActual.consejoCuidado}
                    </p>
                  </div>
                )}
              </div>

              {/* 5. NOTAS ADICIONALES (Editorial, curso, etc.) */}
              <div>
                <label htmlFor="campo-notas-libro" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Notas adicionales (Opcional - máx. 250 caracteres)
                </label>
                <textarea
                  id="campo-notas-libro"
                  rows={2}
                  maxLength={250}
                  value={nuevasNotas}
                  onChange={(e) => setNuevasNotas(e.target.value)}
                  placeholder="Ej: Editorial Santillana, tiene tapas forradas o actividades completas..."
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-medium text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
                />
              </div>

              {/* 6. NOMBRE DEL ESTUDIANTE / CONTACTO */}
              <div>
                <label htmlFor="campo-contacto-alumno" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Tu nombre y división para coordinar la entrega (Opcional - máx. 50 caracteres)
                </label>
                <input
                  id="campo-contacto-alumno"
                  type="text"
                  maxLength={50}
                  value={nuevoContacto}
                  onChange={(e) => setNuevoContacto(e.target.value)}
                  placeholder="Ej: Mateo (3.º B) en el recreo de las 10:30"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base font-medium text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
                />
              </div>

              {/* ÚNICO BOTÓN PRINCIPAL DESTACADO EN EL FORMULARIO */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={procesandoFoto || enviandoFormulario}
                  className="w-full min-h-[52px] py-3.5 px-5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  {enviandoFormulario ? 'Guardando publicación...' : 'Publicar libro en el trueque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MENSAJE FLOTANTE DE RETROALIMENTACIÓN (Toast) */}
      {/* ==================================================================== */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-3 ${
              toast.tipo === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                toast.tipo === 'info' ? 'bg-slate-700 text-slate-200' : 'bg-emerald-700 text-emerald-200'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <p className="text-xs font-medium leading-tight flex-1">
              {toast.mensaje}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
