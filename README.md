# Tradier Dashboard - Análisis Intradía del Mercado

Dashboard profesional para análisis intradía del mercado utilizando la API de Tradier. Visualiza en tiempo real métricas de GEX (Gamma Exposure), Open Interest, Volumen y otras señales derivadas de la cadena de opciones.

## 🚀 Características

- **Métricas Principales:** Spot, Dist. PG S/N, Movimiento Esperado, Tendencia, Score
- **Gráficos Interactivos:**
  - Gráfico principal con múltiples líneas (Precio, GEX, OI, Delta Neutro, Volumen)
  - Strikes GEX Put/Call con barras interactivas
  - Evolución del Score con banda de colores
  - Strikes Dominantes GEX
- **Panel de Tendencias:** Indicadores con barras de gradiente y estado del mercado
- **Tabla Histórica:** Datos intradía con timestamp y predicciones
- **Actualización Automática:** Refresco cada 30 segundos
- **Tema Oscuro Profesional:** Interfaz moderna y responsive

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Tailwind CSS para estilos
- Recharts para visualizaciones
- Zustand para gestión de estado
- Lucide React para iconos

### Backend
- Node.js + Express + TypeScript
- Axios para integración con Tradier API
- CORS y Helmet para seguridad
- Variables de entorno para configuración

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd tradier-dashboard
```

2. **Instalar dependencias**
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd api && npm install && cd ..
```

3. **Configurar variables de entorno**
Crea un archivo `.env` en la carpeta `api` con tu API key de Tradier:
```env
TRADIER_API_KEY=coGsj0jBfyTpftB7EOcZhydoaJtM
PORT=3001
```

4. **Iniciar la aplicación**
```bash
# Opción 1: Iniciar todo junto
npm run start:all

# Opción 2: Iniciar frontend y backend por separado
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🔧 Endpoints API

### Market Data
- `GET /api/market/quote/:symbol` - Cotización actual
- `GET /api/market/history/:symbol` - Datos históricos intradía

### Options Analysis
- `GET /api/options/chain/:symbol` - Cadena de opciones con GEX
- `GET /api/analysis/metrics/:symbol` - Métricas calculadas
- `GET /api/analysis/gex/:symbol` - Análisis GEX detallado

## 📊 Cálculos Implementados

### GEX (Gamma Exposure)
```typescript
gex = gamma * open_interest * contract_size
```

### Score de Tendencia
Algoritmo propietario basado en:
- GEX Score (40%)
- Price Movement Score (40%)
- Point of Gravity Score (20%)

### Punto de Gravedad
Strike con mayor GEX acumulado

## 🔒 Seguridad

- API keys almacenadas en variables de entorno
- CORS configurado para seguridad
- Rate limiting implementado
- Validación de datos de entrada

## 🎨 Personalización

### Colores
- Verde: Valores positivos, tendencia alcista
- Rojo: Valores negativos, tendencia bajista
- Amarillo: GEX, líneas principales
- Azul: Precio, delta neutro

### Temas
El dashboard utiliza un tema oscuro profesional con Tailwind CSS. Para modificar colores, edita `src/index.css`.

## 🚨 Notas Importantes

- **Sandbox Mode:** La aplicación está configurada para usar la API sandbox de Tradier
- **Datos Simulados:** Si la API no responde, se utilizan datos simulados para desarrollo
- **Fines Educativos:** Esta herramienta es para análisis educativo y no constituye asesoramiento financiero

## 📞 Soporte

Para reportar problemas o solicitar características, abre un issue en el repositorio.

## 📄 Licencia

Este proyecto está licenciado bajo MIT License.
