import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Importar los archivos de idiomas por carpetas
// Español
import es_common from './locales/es/common.json';
import es_credits from './locales/es/credits.json';

// Inglés
import en_common from './locales/en/common.json';
import en_credits from './locales/en/credits.json';

// Objeto con todos los idiomas disponibles
export const locales = {
  es: {
    name: 'Español',
    flag: '🇪🇸',
    namespaces: {
      common: es_common,
      credits: es_credits
    }
  },
  en: {
    name: 'English',
    flag: '🇬🇧',
    namespaces: {
      common: en_common,
      credits: en_credits
    }
  }
};

// Determinar el idioma inicial (guardado en localStorage o por defecto del navegador)
function getInitialLocale() {
  if (!browser) return 'es'; // Por defecto español en el servidor
  
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && locales[savedLocale]) return savedLocale;
  
  // Detectar idioma del navegador
  const browserLocale = navigator.language.split('-')[0];
  return locales[browserLocale] ? browserLocale : 'es';
}

// Store para el idioma actual
export const locale = writable(getInitialLocale());

// Store derivado para las traducciones
export const t = derived(locale, ($locale) => {
  // Función para acceder a las traducciones anidadas
  return function(key) {
    // Separar el namespace del resto de la clave
    const [namespace, ...rest] = key.split('.');
    const restKey = rest.join('.');
    
    if (!namespace || !restKey) return key;
    
    // Obtener el diccionario del namespace para el idioma actual
    const dict = locales[$locale]?.namespaces[namespace] || locales.es.namespaces[namespace];
    
    if (!dict) return key;
    
    // Navegar por las claves anidadas
    const keys = restKey.split('.');
    let value = dict;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key; // Si no existe la traducción, devolver la clave
    }
    
    return value;
  };
});

// Función para cambiar el idioma
export function setLocale(newLocale) {
  if (locales[newLocale]) {
    locale.set(newLocale);
    if (browser) {
      localStorage.setItem('locale', newLocale);
    }
  }
}

// Función para añadir un nuevo namespace (útil para cargar traducciones dinámicamente)
export function addNamespace(locale, namespace, translations) {
  if (locales[locale]) {
    locales[locale].namespaces[namespace] = translations;
  }
} 