# DevOps Daily Helper 🚀

Tu asistente para el día a día en DevOps. Una web app con 3 módulos potenciados por IA para agilizar tareas comunes.

## Módulos

### 🔧 Módulo 1 — Troubleshooting
Diagnóstico de errores con IA. Pega cualquier error y obtén soluciones paso a paso.
- Funciona con K8s, Docker, Terraform, AWS, CI/CD, Linux, bases de datos y más
- Diagnóstico automático con categoría, severidad y root cause
- Comandos de troubleshooting copiables
- Solución más probable + tips adicionales
- Ejemplos clickeables para probar rápido

### 📄 Módulo 2 — Generador de YAMLs
Genera manifiestos de Kubernetes con lenguaje natural.
- Describe lo que necesitas → la IA genera el YAML completo
- Soporta Deployments, Services, Ingress, HPA, ConfigMaps, CronJobs, RBAC y más
- Incluye best practices (resource limits, probes, labels)
- Copiar o descargar el YAML generado
- Ejemplos clickeables en español

### 🎤 Módulo 3 — Daily Speech
Prepara tu speech para el daily standup en inglés.
- Soporte para múltiples tickets en un solo daily
- **Integración con Jira Cloud API** — importa tickets automáticamente
  - Trae título, status, subtareas, descripción y comentarios
  - Auto-completa "qué hiciste" y "qué sigue" basándose en subtareas
  - Detecta tickets bloqueados y llena el campo de bloqueos
- Lógica inteligente por status:
  - **In Progress:** aparece en "ayer" y "hoy"
  - **To Do:** solo aparece en "hoy"
  - **Done:** solo aparece en "ayer"
  - **Blocked:** auto-llena bloqueos con el motivo
- Generación de speech estructurado (sin IA, sin costo)
- Botón opcional "✨ Hacerlo sonar natural con IA" (usa Groq solo cuando tú decides)
- Speech siempre en inglés, UI en español

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **IA:** Groq API (Llama 3.3 70B) — free tier
- **Jira:** Atlassian REST API v3 (Cloud)
- **Icons:** react-icons
- **Deploy:** AWS Amplify / GitHub Pages

## Setup local

```bash
npm install
npm run dev
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Requerido — IA para troubleshooting, YAML generator y speech natural
VITE_GROQ_API_KEY=tu-groq-api-key

# Opcional — Integración con Jira Cloud
VITE_JIRA_DOMAIN=tu-empresa.atlassian.net
VITE_JIRA_EMAIL=tu-email@empresa.com
VITE_JIRA_TOKEN=tu-jira-api-token
```

### Obtener las keys:
- **Groq:** https://console.groq.com/keys (gratis, sin tarjeta)
- **Jira Token:** https://id.atlassian.com/manage-profile/security/api-tokens

## Deploy

### AWS Amplify
1. Push el repo a GitHub/GitLab/CodeCommit
2. En AWS Amplify Console → "New App" → "Host web app"
3. Conecta tu repo — Amplify detecta el `amplify.yml`
4. Agrega las variables de entorno en Amplify Console → Environment Variables
5. Deploy automático en cada push

### GitHub Pages
1. Agrega `VITE_GROQ_API_KEY` como secret en el repo (Settings → Secrets)
2. Push a `main` — el workflow `.github/workflows/deploy-pages.yml` hace el deploy
3. Habilita Pages en Settings → Pages → Source: GitHub Actions

## Estructura del proyecto

```
src/
├── components/          # Navbar, Layout, ModuleCard
├── modules/
│   ├── troubleshooting/
│   │   ├── TroubleshootingModule.jsx
│   │   └── groqService.js
│   ├── yaml-generator/
│   │   ├── YamlGeneratorModule.jsx
│   │   └── yamlAI.js
│   └── daily-speech/
│       ├── DailySpeechModule.jsx
│       ├── speechAI.js
│       └── jiraApi.js
├── pages/
│   └── Home.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Costos

| Servicio | Free tier |
|----------|-----------|
| Groq API | 14,400 requests/día, 30 req/min |
| AWS Amplify | 1000 min build/mes, 15 GB hosting |
| GitHub Pages | Ilimitado para repos públicos |
| Jira API | Sin límite práctico para uso personal |

**Costo total: $0**

## Licencia

MIT
