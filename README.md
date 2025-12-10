# Tradier Options Dashboard

Un dashboard profesional para análisis de opciones y generación de ideas de trading usando la API de Tradier.

## 🚀 Características

### Dashboard Principal
- **Análisis GEX (Gamma Exposure)** en tiempo real
- **Market Metrics** con cálculo de tendencias
- **Gráficos interactivos** de strikes dominantes
- **Tabla histórica** intradía
- **Soporte múltiple** para símbolos: SPX, XSP, SPY, QQQ, IWM

### Generador de Ideas de Trading
- **Estrategias automáticas** basadas en tendencia del mercado
- **Put Credit Spreads** para mercados alcistas
- **Call Debit Spreads** para mercados bajistas
- **Filtrado por delta** (~30 delta) para optimización
- **Actualización cada 5 minutos** durante horario de mercado
- **Espera inteligente** de 30 minutos después de apertura para claridad de tendencia

### Tarjetas de Métricas en Tiempo Real
- **Profitables**: Número de trades ganadores
- **Total Trades**: Total de operaciones generadas
- **Win Rate**: Porcentaje de trades exitosos
- **OTM/ITM/NTM**: Distribución de estados de las opciones

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Estado**: Zustand para gestión de estado global
- **API**: Tradier API para datos de mercado
- **Despliegue**: Vercel (frontend + backend serverless)

## 📦 Instalación

### Prerequisitos
- Node.js 18+
- Cuenta en Tradier con API key

### Setup Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/csubi1974/quant-dashboard.git
cd quant-dashboard
```

2. **Instalar dependencias**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd api
npm install
cd ..
```

3. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:
```env
TRADIER_API_KEY=tu_api_key_aqui
```

4. **Ejecutar en desarrollo**
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev
```

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `TRADIER_API_KEY` | Tu API key de Tradier | `UeZpmeGNuZSu78TeCfQkGce9UbTq` |

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conectar repositorio**
   - Ve a [Vercel](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno

2. **Variables de entorno en Vercel**
   ```
   TRADIER_API_KEY=tu_api_key_real
   ```

3. **Deploy automático**
   - Cada push a `main` desencadena un nuevo despliegue
   - Preview deployments en PRs

## 📊 Uso

### Dashboard
- Selecciona el símbolo deseado (SPX, XSP, SPY, QQQ, IWM)
- Observa métricas de GEX y tendencias en tiempo real
- Analiza strikes dominantes y volúmenes

### Generador de Ideas
- Las ideas comienzan a generarse 30 minutos después de la apertura del mercado
- Las estrategias se adaptan automáticamente a la tendencia detectada
- Las métricas se actualizan en tiempo real con cada nuevo ciclo

## 🔒 Seguridad

- La API key se maneja solo del lado del servidor
- Variables de entorno nunca se exponen al cliente
- Validación de entrada en todas las rutas

## 📈 Características Técnicas

### Backend
- **TypeScript** para type safety
- **Express.js** para el servidor
- **CORS** configurado apropiadamente
- **Error handling** robusto
- **Rate limiting** para prevenir abuso

### Frontend
- **React 18** con hooks modernos
- **TypeScript** para desarrollo seguro
- **Tailwind CSS** para estilos responsive
- **Zustand** para gestión ligera de estado
- **Componentes modulares** y reutilizables

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [Tradier](https://tradier.com) por proporcionar la API de datos de mercado
- La comunidad de open source por las herramientas y librerías utilizadas

## 📞 Contacto

Para soporte o preguntas, por favor abre un issue en GitHub.

---

**⚠️ Disclaimer**: Este es un proyecto educacional. No constituye asesoramiento financiero. Siempre realiza tu propia investigación antes de tomar decisiones de inversión.
