import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Importar los archivos de idiomas por carpetas
// Español
import es_common from './locales/es/common.json';
import es_credits from './locales/es/credits.json';

// Inglés
import en_common from './locales/en/common.json';
import en_credits from './locales/en/credits.json';

/**
 * @typedef {Object} TranslationNamespace
 * @property {Object.<string, string|TranslationNamespace>} [key] - Claves de traducción anidadas
 */

/**
 * @typedef {Object} LocaleConfig
 * @property {string} name - Nombre del idioma
 * @property {string} flag - Emoji de la bandera
 * @property {Object.<string, TranslationNamespace>} namespaces - Espacios de nombres con traducciones
 */

/**
 * @type {Object.<string, LocaleConfig>}
 */
// Objeto con todos los idiomas disponibles
export const locales = {
  es: {
    name: 'Español',
    flag: '🇲🇽',
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

/**
 * @returns {string} - Código del idioma
 */
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
  /**
   * Función para acceder a las traducciones anidadas
   * @param {string} key - Clave de traducción en formato 'namespace.clave.subclave'
   * @param {Object.<string, string>} [params] - Parámetros para reemplazar en la traducción
   * @returns {string} - Traducción
   */
  return function(key, params) {
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
    
    // Si hay parámetros, reemplazarlos en la traducción
    if (params && typeof value === 'string') {
      return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
        return result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
      }, value);
    }
    
    return value;
  };
});

/**
 * Cambia el idioma actual
 * @param {string} newLocale - Código del nuevo idioma
 */
// Función para cambiar el idioma
export function setLocale(newLocale) {
  if (locales[newLocale]) {
    locale.set(newLocale);
    if (browser) {
      localStorage.setItem('locale', newLocale);
    }
  }
}

/**
 * Añade un nuevo espacio de nombres
 * @param {string} localeCode - Código del idioma
 * @param {string} namespace - Nombre del espacio
 * @param {Object} translations - Objeto con traducciones
 */
// Función para añadir un nuevo namespace (útil para cargar traducciones dinámicamente)
export function addNamespace(localeCode, namespace, translations) {
  if (locales[localeCode]) {
    locales[localeCode].namespaces[namespace] = translations;
  }
} 