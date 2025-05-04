import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Importar los archivos de idiomas por carpetas
// Español
import es_common from './locales/es/common.json';
import es_credits from './locales/es/credits.json';
import es_home from './locales/es/home.json';

// Inglés
import en_common from './locales/en/common.json';
import en_credits from './locales/en/credits.json';
import en_home from './locales/en/home.json';

// Objeto con todos los idiomas disponibles
export const locales = {
  es: {
    name: 'Español',
    flag: '🇲🇽',
    namespaces: {
      common: es_common,
      credits: es_credits,
      home: es_home
    }
  },
  en: {
    name: 'English',
    flag: '🇬🇧',
    namespaces: {
      common: en_common,
      credits: en_credits,
      home: en_home
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

// Función auxiliar para acceder a propiedades anidadas de forma segura
function getNestedProperty(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((prev, curr) => {
    return prev && typeof prev === 'object' ? prev[curr] : undefined;
  }, obj);
}

// Store derivado para las traducciones
export const t = derived(locale, ($locale) => {
  return function(key, params) {
    try {
      // Separar el namespace del resto de la clave
      const [namespace, ...rest] = key.split('.');
      const restKey = rest.join('.');
      
      if (!namespace || !restKey) return key;
      
      // Acceder primero al namespace y luego a la propiedad anidada
      const dict = locales[$locale]?.namespaces[namespace];
      if (!dict) return key;
      
      const value = getNestedProperty(dict, restKey);
      if (value === undefined) return key;
      
      // Si hay parámetros, reemplazarlos en la traducción
      if (params && typeof value === 'string') {
        let result = value;
        for (const [paramKey, paramValue] of Object.entries(params)) {
          result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
        }
        return result;
      }
      
      return value;
    } catch (error) {
      console.error(`Error al acceder a la traducción ${key}:`, error);
      return key;
    }
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
export function addNamespace(localeCode, namespace, translations) {
  if (locales[localeCode]) {
    locales[localeCode].namespaces[namespace] = translations;
  }
} 