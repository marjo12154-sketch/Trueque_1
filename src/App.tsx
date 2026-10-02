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
  AlertCircle
} from 'lucide-react';
import { BookItem, BookCondition } from './types';

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

  // Mensaje flotante de notificación (Toast feedback)
  const [toast, setToast] = useState<{ mensaje: string; tipo?: 'exito' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'info' = 'exito') => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ mensaje, tipo });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN 1: PUBLICAR UN ARTÍCULO
  // --------------------------------------------------------------------------
  const manejarPublicar = (e: React.FormEvent) => {
    e.preventDefault();

    const tituloLimpio = nuevoTitulo.trim();
    if (!tituloLimpio) {
      setErrorFormulario('Por favor escribe el título del libro o artículo.');
      return;
    }

    const materiaFinal =
      nuevaMateria === 'Otra materia'
        ? materiaPersonalizada.trim() || 'General'
        : nuevaMateria;

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
      notes: nuevasNotas.trim() || undefined,
      contactName: nuevoContacto.trim() || undefined,
      isDelivered: false,
      createdAt: Date.now()
    };

    /* PUNTO CLAVE DE ERROR:
     * Inmutabilidad en React: Nunca usar libros.unshift() o libros.push() directamente.
     * Creamos un nuevo arreglo con el nuevo elemento al inicio para que el render detecte el cambio.
     */
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
    setModalAbierto(false);

    // Asegurar que estamos en la pestaña de disponibles
    setPestanaActiva('disponibles');

    mostrarToast(`¡"${tituloLimpio}" fue publicado con éxito en el trueque!`);
  };

  // Manejo de carga de archivo de foto desde cámara o galería
  const manejarSeleccionFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    const archivo = archivos[0];
    if (!archivo.type.startsWith('image/')) {
      setErrorFormulario('El archivo seleccionado debe ser una imagen válida.');
      return;
    }

    try {
      setProcesandoFoto(true);
      setErrorFormulario('');
      const base64Optimizado = await comprimirImagen(archivo);
      setNuevaFotoUrl(base64Optimizado);
    } catch (err) {
      console.error('Error al procesar la foto:', err);
      setErrorFormulario('No se pudo procesar la foto. Intenta con otra imagen.');
    } finally {
      setProcesandoFoto(false);
    }
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN 3: MARCAR COMO ENTREGADO Y RETIRARLO DE LA LISTA
  // --------------------------------------------------------------------------
  const marcarComoEntregado = (id: string, titulo: string) => {
    /* PUNTO CLAVE DE ERROR:
     * No mutar el libro directamente (item.isDelivered = true).
     * Mapeamos devolviendo un nuevo objeto inmutable con isDelivered: true.
     */
    setLibros((anteriores) =>
      anteriores.map((item) =>
        item.id === id
          ? { ...item, isDelivered: true, deliveredAt: Date.now() }
          : item
      )
    );

    mostrarToast(`"${titulo}" marcado como entregado y retirado de la lista activa.`, 'info');
  };

  // Acción para restaurar en caso de que alguien se equivoque al tocar
  const restaurarLibro = (id: string, titulo: string) => {
    setLibros((anteriores) =>
      anteriores.map((item) =>
        item.id === id ? { ...item, isDelivered: false, deliveredAt: undefined } : item
      )
    );
    mostrarToast(`"${titulo}" restaurado a la lista de disponibles.`);
  };

  // Acción para eliminar definitivamente
  const eliminarDefinitivo = (id: string, titulo: string) => {
    setLibros((anteriores) => anteriores.filter((item) => item.id !== id));
    mostrarToast(`"${titulo}" eliminado del registro.`);
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

          {/* Botón rápido de publicar para desktop / tablet */}
          <button
            onClick={() => {
              setErrorFormulario('');
              setModalAbierto(true);
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Publicar libro
          </button>
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
      <main className="max-w-4xl mx-auto w-full px-4 pt-4 flex-1">
        {/* Barra de búsqueda interactiva */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por materia o palabra clave (ej: Matemáticas, 2.º año)..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-all"
          />
          {terminoBusqueda && (
            <button
              onClick={() => setTerminoBusqueda('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Carrusel horizontal de materias para filtro táctil en móvil */}
        <div className="mb-4 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 flex items-center gap-2">
          <button
            onClick={() => setMateriaSeleccionada('Todas')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              materiaSeleccionada === 'Todas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todas las materias
          </button>
          {MATERIAS_COMUNES.map((materia) => (
            <button
              key={materia}
              onClick={() => setMateriaSeleccionada(materia)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                materiaSeleccionada === materia
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {materia}
            </button>
          ))}
        </div>

        {/* Pestañas: Libros disponibles vs Libros entregados */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-4 pb-2">
          <div className="flex gap-4">
            <button
              onClick={() => setPestanaActiva('disponibles')}
              className={`text-sm font-bold pb-2 relative transition-colors ${
                pestanaActiva === 'disponibles'
                  ? 'text-amber-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Disponibles ({totalDisponibles})
              {pestanaActiva === 'disponibles' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setPestanaActiva('entregados')}
              className={`text-sm font-bold pb-2 relative transition-colors ${
                pestanaActiva === 'entregados'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ya entregados ({totalEntregados})
              {pestanaActiva === 'entregados' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {librosFiltrados.length}{' '}
            {librosFiltrados.length === 1 ? 'libro' : 'libros'}
          </span>
        </div>

        {/* ================================================================== */}
        {/* LISTADO DE ARTÍCULOS / LIBROS */}
        {/* ================================================================== */}
        {librosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No se encontraron libros
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {terminoBusqueda || materiaSeleccionada !== 'Todas'
                ? `No hay resultados para "${terminoBusqueda || materiaSeleccionada}". Prueba con otro término o limpia los filtros.`
                : pestanaActiva === 'disponibles'
                ? 'No hay libros disponibles en este momento. ¡Sé el primero en publicar uno!'
                : 'Todavía no hay libros registrados como entregados.'}
            </p>

            {terminoBusqueda || materiaSeleccionada !== 'Todas' ? (
              <button
                onClick={() => {
                  setTerminoBusqueda('');
                  setMateriaSeleccionada('Todas');
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
              >
                Limpiar búsqueda y filtros
              </button>
            ) : (
              pestanaActiva === 'disponibles' && (
                <button
                  onClick={() => setModalAbierto(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                >
                  <Plus className="w-4 h-4" />
                  Publicar un libro ahora
                </button>
              )
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {librosFiltrados.map((libro) => (
              <article
                key={libro.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  libro.isDelivered
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-85'
                    : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Foto del artículo con badge de estado y materia */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={libro.photoUrl}
                      alt={libro.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Badge de Materia */}
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {libro.subject}
                    </span>

                    {/* Badge de Condición / Estado */}
                    <span
                      className={`absolute top-2.5 right-2.5 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        libro.condition === 'Excelente'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : libro.condition === 'Bueno'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {libro.condition}
                    </span>

                    {/* Sello de entregado si corresponde */}
                    {libro.isDelivered && (
                      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                          ¡Entregado a un compañero!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Datos del libro */}
                  <div className="p-4 space-y-2">
                    <h2 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {libro.title}
                    </h2>

                    {libro.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {libro.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        {libro.contactName
                          ? `Ofrecido por: ${libro.contactName}`
                          : 'Disponible en el instituto'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones del libro */}
                <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                  {!libro.isDelivered ? (
                    <button
                      onClick={() => marcarComoEntregado(libro.id, libro.title)}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como entregado
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => restaurarLibro(libro.id, libro.title)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                        title="Devolver a la lista de disponibles"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restaurar
                      </button>
                      <button
                        onClick={() => eliminarDefinitivo(libro.id, libro.title)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Eliminar registro"
                      >
                        <X className="w-4 h-4" />
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
            <form onSubmit={manejarPublicar} className="p-6 overflow-y-auto space-y-4">
              {errorFormulario && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorFormulario}</span>
                </div>
              )}

              {/* 1. TÍTULO DEL LIBRO (Ej: Matemáticas de 2.º año) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título del libro o artículo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: Matemáticas de 2.º año"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="mt-1 text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Rellenar sugerencia: "Matemáticas de 2.º año"
                </button>
              </div>

              {/* 2. MATERIA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Materia <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nuevaMateria}
                  onChange={(e) => setNuevaMateria(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {MATERIAS_COMUNES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {nuevaMateria === 'Otra materia' && (
                  <input
                    type="text"
                    required
                    value={materiaPersonalizada}
                    onChange={(e) => setMateriaPersonalizada(e.target.value)}
                    placeholder="Escribe el nombre de la materia..."
                    className="mt-2 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                )}
              </div>

              {/* 3. ESTADO DEL LIBRO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado del libro <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Excelente', 'Bueno', 'Aceptable'] as BookCondition[]).map(
                    (estado) => (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => setNuevoEstado(estado)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          nuevoEstado === estado
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {estado}
                      </button>
                    )
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {nuevoEstado === 'Excelente' && 'Sin marcas, como nuevo.'}
                  {nuevoEstado === 'Bueno' && 'Bien cuidado, puede tener algún apunte a lápiz.'}
                  {nuevoEstado === 'Aceptable' && 'Usado, esquinas dobladas o subrayados, pero legible.'}
                </p>
              </div>

              {/* 4. FOTO DEL ARTÍCULO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto del libro
                </label>

                {nuevaFotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-16/9 mb-2">
                    <img
                      src={nuevaFotoUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNuevaFotoUrl('')}
                      className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1 rounded-full text-xs"
                      title="Quitar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700">
                        {procesandoFoto ? 'Comprimiendo imagen...' : 'Subir o tomar foto con el celular'}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Se optimiza automáticamente para no ocupar espacio
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={manejarSeleccionFoto}
                      disabled={procesandoFoto}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  * Si no subes foto, se asignará automáticamente una imagen ilustrativa de {nuevaMateria}.
                </p>
              </div>

              {/* 5. NOTAS ADICIONALES (Editorial, curso, etc.) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notas adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={nuevasNotas}
                  onChange={(e) => setNuevasNotas(e.target.value)}
                  placeholder="Ej: Editorial, si tiene las tapas forradas o algún detalle..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 6. NOMBRE DEL ESTUDIANTE / CONTACTO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tu nombre y curso (Opcional)
                </label>
                <input
                  type="text"
                  value={nuevoContacto}
                  onChange={(e) => setNuevoContacto(e.target.value)}
                  placeholder="Ej: Mateo (3.º B)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Botón de envío */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={procesandoFoto}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Publicar libro en el trueque
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
