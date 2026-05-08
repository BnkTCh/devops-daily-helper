# DevOps Daily Helper 🚀

Tu asistente para el día a día en DevOps. Una web app con 3 módulos diseñados para agilizar tareas comunes.

## Módulos

### 🔧 Módulo 1 — Troubleshooting K8s/EKS
Runbook interactivo para diagnosticar problemas comunes en Kubernetes y EKS.
- Selecciona el síntoma → obtén pasos de resolución
- Comandos copiables con un click
- Variables rápidas (namespace, pod name) que se reemplazan automáticamente
- Categorías: Pods, Networking, Scaling, Nodes

### 📄 Módulo 2 — Generador de YAMLs
Genera manifiestos de Kubernetes con formularios guiados.
- Deployment, Service, Ingress, HPA, ConfigMap, CronJob
- Preview en tiempo real
- Copiar o descargar el YAML generado

### 🎤 Módulo 3 — Daily Speech Prep
Prepara tu speech para el daily standup.
- Ingresa el link/ID de tu Jira ticket
- Describe qué hiciste, qué falta y bloqueos
- Obtén un speech listo para decir
- Templates rápidos para diferentes tipos de tareas

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **YAML:** js-yaml
- **Icons:** react-icons
- **Deploy:** AWS Amplify

## Setup local

```bash
npm install
npm run dev
```

## Deploy en AWS Amplify

1. Push el repo a GitHub/GitLab/CodeCommit
2. En AWS Amplify Console → "New App" → "Host web app"
3. Conecta tu repo
4. Amplify detecta automáticamente el `amplify.yml`
5. Deploy!

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (Navbar, Layout, Cards)
├── modules/
│   ├── troubleshooting/  # Módulo 1 - Runbook interactivo
│   ├── yaml-generator/   # Módulo 2 - Generador de YAMLs
│   └── daily-speech/     # Módulo 3 - Daily speech prep
├── data/             # Datos estáticos (runbooks)
├── pages/            # Páginas principales
├── App.jsx           # Router principal
└── main.jsx          # Entry point
```

## Para la charla (30-45 min)

### Estructura sugerida:
1. **Intro (5 min):** El problema — tareas repetitivas en DevOps
2. **Demo Módulo 1 (10 min):** Troubleshooting en vivo
3. **Demo Módulo 2 (8 min):** Generar YAMLs para un microservicio
4. **Demo Módulo 3 (5 min):** Preparar un daily speech
5. **Arquitectura (7 min):** React + Vite + Amplify, por qué no necesitas backend
6. **Cómo lo construí con Kiro (5 min):** AI-assisted development
7. **Q&A (5 min)**

## Licencia

MIT
