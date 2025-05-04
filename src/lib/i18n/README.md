# Sistema de Internacionalización (i18n)

Este directorio contiene el sistema de internacionalización (i18n) de la aplicación.

## Principios de organización

El sistema está organizado siguiendo estos principios:

1. **Estructura basada en carpetas**: Todas las traducciones se almacenan en la carpeta `locales/`, organizadas por idioma.
2. **Separación por espacios de nombres**: Las traducciones se dividen en espacios de nombres (archivos) para una mejor organización.
3. **Carga dinámica**: Se pueden cargar espacios de nombres adicionales según sea necesario.
4. **Simplicidad**: La API es simple y fácil de usar.

## Estructura de archivos

```
i18n/
├── i18n.js          # Configuración principal del sistema i18n
├── index.js         # Archivo de exportación para facilitar importaciones
├── locales/         # Directorio de traducciones
│   ├── en/          # Traducciones en inglés
│   │   ├── common.json  # Traducciones comunes
│   │   └── ...      # Otros espacios de nombres
│   └── es/          # Traducciones en español
│       ├── common.json  # Traducciones comunes
│       └── ...      # Otros espacios de nombres
└── README.md        # Esta documentación
```

## Uso básico

### Traducir texto

Para traducir texto, importa la función `t` y úsala con la clave de traducción:

```javascript
import { t } from '$lib/i18n';

// Usar la función t
const message = $t('common.welcome');
```

### Cambiar el idioma

Para cambiar el idioma, importa la función `setLocale` y úsala con el código de idioma:

```javascript
import { setLocale } from '$lib/i18n';

// Cambiar al español
setLocale('es');

// Cambiar al inglés
setLocale('en');
```

### Obtener el idioma actual

Para obtener el idioma actual, importa la variable reactiva `locale`:

```javascript
import { locale } from '$lib/i18n';

// Usar la variable locale
console.log($locale); // 'es' o 'en'
```

## Uso avanzado

### Añadir nuevos espacios de nombres

Para añadir un nuevo espacio de nombres, crea un archivo JSON en la carpeta del idioma correspondiente y luego cárgalo usando la función `addNamespace`:

```javascript
import { addNamespace } from '$lib/i18n';

// Añadir un nuevo espacio de nombres
addNamespace('dashboard');
```

### Añadir un nuevo idioma

Para añadir un nuevo idioma:

1. Crea una nueva carpeta con el código del idioma en `locales/`
2. Añade los archivos JSON con las traducciones
3. Actualiza la configuración en `i18n.js` para incluir el nuevo idioma

### Parámetros en traducciones

Puedes usar parámetros en las traducciones:

```json
{
  "greeting": "Hola, {{name}}!"
}
```

```javascript
const message = $t('common.greeting', { name: 'Juan' });
// "Hola, Juan!"
```

### Añadir traducciones a un componente nuevo

1. Decide si tus traducciones deberían ir en un espacio de nombres existente o uno nuevo
2. Añade las claves y valores en los archivos JSON de cada idioma
3. Usa la función `t` en tu componente para acceder a las traducciones

## Recomendaciones

1. **Mantén las claves organizadas**: Usa una estructura jerárquica para las claves (ej. `common.buttons.save`)
2. **Sé consistente con los nombres de las claves**: Usa el mismo patrón en todos los espacios de nombres
3. **Documenta las claves**: Si una clave tiene un uso especial, documéntalo
4. **Evita hardcodear texto**: Todo el texto visible debe usar el sistema i18n 