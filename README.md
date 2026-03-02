# Portal de Acceso — Equipo de Trabajo

Página web para generar y gestionar enlaces de acceso únicos para los miembros de tu equipo de trabajo.

## Características

- **Generación de enlaces únicos** con tokens aleatorios seguros
- **Roles configurables**: Miembro, Administrador, Editor, Visualizador
- **Expiración flexible**: 24h, 48h, 7 días, 30 días o sin expiración
- **Copiar al portapapeles** con un solo clic
- **Gestión completa**: revocar o eliminar enlaces
- **Persistencia local** con `localStorage`
- **Diseño responsive** y moderno
- **Sin dependencias externas** — HTML, CSS y JavaScript puro

## Uso

1. Abre `index.html` en tu navegador
2. Completa el formulario con los datos del miembro
3. Haz clic en **"Generar Enlace de Acceso"**
4. Copia el enlace generado y compártelo con tu equipo
5. Gestiona los enlaces desde la tabla inferior (revocar / eliminar)

## Estructura

```
├── index.html    # Página principal
├── styles.css    # Estilos (diseño moderno con CSS custom properties)
├── script.js     # Lógica de generación y gestión de enlaces
└── README.md     # Documentación
```

## Tecnologías

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- JavaScript ES6+ (Vanilla)
- Google Fonts (Inter)
