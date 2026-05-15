# 🎤 Charla: "De idea a producción en minutos: Kiro + IA + AWS Amplify"

**Evento:** AWS User Group Meetup
**Duración:** 30-35 minutos
**Audiencia:** Developers, DevOps, Cloud Engineers

---

## SECCIÓN 1 — INTRO: EL PROBLEMA (3 min)

### Lo que dices:

"Hola a todos, soy [tu nombre], trabajo como DevOps Engineer y hoy les quiero contar cómo resolví un problema que probablemente todos tenemos."

"Todos los días hago las mismas tareas repetitivas:
- Me sale un error en Kubernetes y paso 10 minutos googleando
- Necesito un YAML para un deployment y lo escribo desde cero o copio de otro proyecto
- Llego al daily standup y no sé cómo resumir lo que hice ayer"

"Un día dije: quiero una herramienta que me ayude con esto. Pero no quiero pasar semanas construyéndola, no quiero mantener un backend, y no quiero pagar servidores."

"Hoy les voy a mostrar cómo en menos de una hora construí una app funcional con IA, sin backend, deployada en AWS, y con costo cero."

### Lo que muestras:
- Nada todavía, solo tú hablando (o un slide con el título de la charla)

---

## SECCIÓN 2 — LA HERRAMIENTA: KIRO (5 min)

### Lo que dices:

"Para construir esto usé Kiro. ¿Quién conoce Kiro? Es un IDE — como VS Code — pero con IA integrada de Amazon."

"No es solo autocompletado de código. Kiro entiende lo que quieres hacer y genera proyectos completos. Le puedes decir: 'quiero una app con React que tenga 3 módulos' y te la crea."

"Yo le dije exactamente esto:"
- "Quiero una web app con 3 módulos: troubleshooting de errores, generador de YAMLs, y preparador de daily speech"
- "Que use React, Vite, TailwindCSS"
- "Que se pueda deployar en AWS Amplify"

"Y Kiro me generó toda la estructura del proyecto, los componentes, el routing, los estilos — todo."

"Después fui iterando: 'ahora agrega IA con Groq', 'ahora haz que el speech sea en inglés', 'ahora que soporte múltiples tickets'. Y Kiro iba haciendo los cambios."

"El punto es: yo no escribí el 90% de este código. Lo que hice fue tomar decisiones de diseño y guiar a la IA."

### Lo que muestras:
- Kiro abierto con el proyecto
- La estructura de archivos en el explorador (src/modules/, src/components/)
- Opcionalmente: el chat de Kiro mostrando alguna interacción

---

## SECCIÓN 3 — DEMO: TROUBLESHOOTING (5 min)

### Lo que dices:

"Vamos al primer módulo. Imaginen que están trabajando y les sale este error:"

*Pegas el error en la app*

"Normalmente yo iría a Google, buscaría el error, abriría 3 tabs de Stack Overflow, leería respuestas de hace 5 años..."

"Ahora solo pego el error aquí y..."

*Click en Diagnosticar*

"En 2 segundos tengo:
- La categoría del error (Kubernetes, Docker, Terraform, lo que sea)
- La severidad
- La causa raíz explicada
- Pasos de troubleshooting con comandos que puedo copiar
- Y la solución más probable"

"Esto funciona con cualquier error. No solo Kubernetes. Docker, Terraform, AWS, bases de datos, Linux, CI/CD — lo que sea."

*Muestra que los comandos se copian con un click*

"Cada comando tiene un botón de copiar. Lo pego directo en mi terminal."

### Lo que muestras:
- La app en el browser → módulo Troubleshooting
- Pegar un error preparado (usa uno que sepas que da buen resultado)
- El resultado del diagnóstico
- Copiar un comando

### Error sugerido para la demo:
```
CrashLoopBackOff: back-off 5m0s restarting failed container=payment-service pod=payment-service-7d4f8b6c9-x2k4m
```

---

## SECCIÓN 4 — DEMO: YAML GENERATOR (5 min)

### Lo que dices:

"Segundo módulo. ¿Cuántas veces han tenido que escribir un YAML de Kubernetes desde cero?"

*Pausa para que la gente se ría o asienta*

"Ahora solo describo lo que necesito en lenguaje natural:"

*Escribes en la app:*
"Un deployment para un servicio llamado payment-api con 3 replicas, imagen my-registry/payment-api:v2.1, puerto 8080, 512Mi de memoria, y health check en /health"

*Click en Generar YAML*

"Listo. Tengo un YAML completo con:
- Resource limits y requests
- Liveness y readiness probes
- Labels correctos
- API version actualizada"

"Puedo copiarlo o descargarlo como archivo. Y si necesito algo más complejo..."

*Escribes otro ejemplo:*
"Un ingress para payment.mycompany.com que apunte al service payment-api en puerto 80 con TLS"

*Click en Generar YAML*

"También funciona. Ingress, HPA, CronJobs, ConfigMaps, RBAC — lo que necesiten."

### Lo que muestras:
- La app → módulo YAML Generator
- Escribir la descripción del deployment
- El YAML generado
- Click en Copiar
- Un segundo ejemplo (ingress) para mostrar versatilidad

---

## SECCIÓN 5 — DEMO: DAILY SPEECH (5 min)

### Lo que dices:

"Tercer módulo. Este es mi favorito porque lo uso todos los días."

"¿Quién ha llegado al daily y no sabe cómo resumir lo que hizo?"

*Pausa*

"Yo agrego mis tickets aquí. Miren qué rápido:"

*Llenas el primer ticket:*
- Ticket ID: DEVOPS-123
- Status: In Progress
- Título: Migrate payment service to new EKS cluster
- Qué hiciste: Configured helm values and created namespace
- Qué sigue: Validate in QA environment

*Agregas un segundo ticket:*
- Ticket ID: DEVOPS-456
- Status: To Do
- Título: Setup monitoring dashboards for new cluster

*Click en Generar Speech*

"Miren — me genera un speech estructurado. Los tickets In Progress aparecen en 'ayer' y 'hoy'. Los To Do solo aparecen en 'hoy'. Es inteligente."

"Pero si quiero que suene más natural..."

*Click en ✨ Hacerlo sonar natural con IA*

"Ahora tengo un speech conversacional, listo para decir en mi daily. Solo lo copio y lo leo."

*Lee el speech en voz alta como si estuviera en un daily*

### Lo que muestras:
- La app → módulo Daily Speech
- Llenar 2 tickets rápido
- El speech estructurado generado
- Click en el botón de IA
- El speech natural generado
- Leerlo en voz alta (esto conecta con la audiencia)

---

## SECCIÓN 6 — CÓMO INTEGRÉ LA IA (5 min)

### Lo que dices:

"Ya vieron lo que hace la app. Ahora les muestro lo fácil que es integrar IA en cualquier proyecto."

"Uso Groq como proveedor de IA. ¿Qué es Groq? Es una plataforma que te da acceso a modelos de lenguaje como Llama 3.3 de Meta — modelos open source — pero corriendo en hardware ultra rápido. La respuesta llega en 1-2 segundos."

"¿Por qué elegí Groq y no OpenAI o Bedrock?"
- "Primero: es gratis. 14,400 requests por día sin pagar nada, sin tarjeta de crédito."
- "Segundo: es rápido. Groq tiene chips especializados para inferencia — LPU los llaman — y la respuesta es casi instantánea."
- "Tercero: la API es compatible con el formato de OpenAI. Si ya conocen la API de ChatGPT, es exactamente igual. Solo cambias la URL."

"Para usarlo, lo único que necesité fue crear una cuenta en console.groq.com y generar un API key. Literalmente 30 segundos."

*Muestras brevemente la consola de Groq (si quieres) o solo mencionas el paso*

"Ese API key es lo que mi app usa para autenticarse con Groq. Lo guardo como variable de entorno — nunca en el código."

"Ahora veamos cómo se integra en el código. Es sorprendentemente simple."

*Abres el archivo `groqService.js` en Kiro*

"Toda la integración son básicamente 3 cosas:"

"**1. La llamada a la API** — es un fetch normal a `https://api.groq.com/openai/v1/chat/completions`. Le paso el API key en el header, el modelo que quiero usar, los mensajes, y listo."

*Señalas el fetch en el código*

"**2. El system prompt** — aquí es donde está la magia. Le digo a la IA: 'eres un DevOps engineer senior, el usuario te va a pegar un error, y tú tienes que responder en este formato JSON con estos campos'. Eso es prompt engineering."

*Señalas el systemPrompt*

"**3. El parseo de la respuesta** — la IA me devuelve JSON y yo lo muestro en la UI con colores, badges, comandos copiables."

"Y esto es igual para los 3 módulos:"
- "Troubleshooting: le pido que diagnostique errores"
- "YAML Generator: le pido que genere manifiestos de Kubernetes"
- "Daily Speech: le pido que convierta bullet points en speech natural"

"La diferencia entre módulos es solo el prompt. La integración es la misma."

*Muestras brevemente el archivo `yamlAI.js` o `speechAI.js` para que vean que es el mismo patrón*

"¿Cuántas líneas de código es esto? Menos de 50 por módulo. La IA hace el trabajo pesado."

### Lo que muestras:
- (Opcional) Consola de Groq — la página de API keys para que vean lo simple que es
- Kiro con el archivo `src/modules/troubleshooting/groqService.js` abierto
- Señalar las 3 partes: fetch con API key, system prompt, parseo
- Brevemente mostrar que `yamlAI.js` y `speechAI.js` siguen el mismo patrón
- El archivo `.env` (sin mostrar el valor del key, solo los nombres de las variables)

### Puntos clave a resaltar:
- "Groq es gratis: 14,400 requests por día, sin tarjeta de crédito"
- "Crear el API key toma 30 segundos — solo necesitas una cuenta"
- "Es un fetch normal — no necesitas SDK ni librería especial"
- "El prompt es lo más importante — ahí defines qué tan buena es la respuesta"
- "El formato de respuesta (JSON) te permite mostrar la info de forma estructurada en la UI"

---

## SECCIÓN 7 — ARQUITECTURA (4 min)

### Lo que dices:

"Ahora veamos cómo funciona esto por detrás. Y aquí es donde se pone interesante para los que somos de infra."

*Muestra el diagrama*

"La arquitectura es ridículamente simple:
- Un frontend en React que se compila a archivos estáticos
- Groq como API de IA — se llama directo desde el browser
- AWS Amplify que hostea los archivos estáticos"

"No hay backend. No hay Lambda. No hay base de datos. No hay API Gateway."

"¿Por qué? Porque no lo necesito. La IA la provee Groq con su API. Mi app solo necesita servir HTML, CSS y JavaScript."

"Es como tener un S3 + CloudFront pero sin configurar nada. Amplify te da HTTPS, CI/CD, y custom domains — todo incluido."

"Y el costo..."

*Pausa dramática*

"Cero. Amplify tiene free tier: 1000 minutos de build al mes, 15 GB de hosting. Groq tiene free tier: 14,400 requests por día. Para uso personal o de equipo, no pagas nada."

### Lo que muestras:
- Un slide o diagrama con la arquitectura (puede ser simple, dibujado)
- O la misma explicación verbal si no tienes slides

### Diagrama sugerido:
```
┌──────────────────────────────────────────────────┐
│                    BROWSER                         │
│  ┌────────────────────────────────────────────┐  │
│  │         React SPA (Vite + Tailwind)        │  │
│  └──────────────────┬─────────────────────────┘  │
└─────────────────────┼────────────────────────────┘
                      │ HTTPS calls
                      ▼
              ┌───────────────┐
              │   Groq API    │
              │  (Llama 3.3)  │
              │   FREE TIER   │
              └───────────────┘

┌──────────────────────────────────────────────────┐
│              AWS AMPLIFY                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Build   │  │  Deploy  │  │    HTTPS     │  │
│  │  (CI/CD) │  │ (Static) │  │ (CloudFront) │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                   │
│  Push to GitHub → Auto build → Auto deploy       │
└──────────────────────────────────────────────────┘
```

---

## SECCIÓN 8 — DEPLOY EN AMPLIFY (4 min)

### Lo que dices:

"Ahora les muestro cómo se deploya esto. Es absurdamente fácil."

*Abres la consola de Amplify*

"Miren, aquí está mi app en Amplify. La conecté a mi repo de GitHub."

"El archivo de configuración es este:"

*Muestras el amplify.yml*

"Son literalmente 3 pasos: instalar dependencias, hacer build, y servir la carpeta dist. Eso es todo."

"Las variables de entorno — como el API key de Groq — las configuro aquí en Amplify. Nunca se suben al código."

*Muestras la sección de Environment Variables (sin mostrar los valores)*

"Y lo mejor: cada vez que hago push a main, Amplify hace build y deploy automático. No tengo que hacer nada."

"Si quiero probar un feature branch, Amplify me crea un preview automático con su propia URL. Puedo compartirla con mi equipo antes de hacer merge."

### Lo que muestras:
- Consola de AWS Amplify con la app
- El amplify.yml (es corto, se ve bien)
- La sección de Environment Variables
- El historial de deploys (mostrando que es automático)
- La URL pública de la app

---

## SECCIÓN 9 — CIERRE (2 min)

### Lo que dices:

"Para resumir lo que vimos hoy:"

"1. Kiro me ayudó a crear la app completa — yo tomé las decisiones, la IA escribió el código"
"2. Groq le da inteligencia a la app — diagnóstica errores, genera YAMLs, mejora mi daily speech"
"3. AWS Amplify la pone en producción — sin servidores, sin configuración compleja, gratis"

"Todo esto lo hice en menos de una hora. Y lo uso todos los días en mi trabajo."

"El código está en GitHub, se los comparto por el chat del meetup. Si quieren replicarlo o agregarle módulos, está todo ahí."

"¿Preguntas?"

### Lo que muestras:
- Un slide final con:
  - Link del repo de GitHub
  - Tu LinkedIn/Twitter (opcional)
  - Los 3 logos: Kiro + Groq + AWS Amplify

---

## PREGUNTAS FRECUENTES QUE TE PUEDEN HACER

**"¿Por qué Groq y no Bedrock?"**
→ "Groq es gratis permanentemente y no requiere configuración de AWS. Para una app personal es perfecto. Si fuera para una empresa, probablemente usaría Bedrock con una Lambda como proxy."

**"¿El API key no queda expuesto en el browser?"**
→ "Sí, en el código del frontend se puede ver. Para uso personal está bien. Para producción real, pondrías una Lambda en el medio. Pero para este caso de uso, el riesgo es mínimo porque Groq tiene rate limits en el free tier."

**"¿Cuánto tardaste realmente?"**
→ "La primera versión funcional la tuve en 30 minutos con Kiro. Después fui iterando y agregando features durante un par de horas más."

**"¿Amplify es mejor que S3 + CloudFront?"**
→ "Para apps estáticas con CI/CD, sí. Te ahorra configurar el bucket, la distribución, los permisos, el build pipeline. Amplify te da todo eso en un click."

**"¿Puedo usar otro modelo de IA?"**
→ "Sí, la app está diseñada para que cambies el modelo fácilmente. Solo cambias la URL y el modelo en el servicio. Podrías usar Gemini, OpenAI, o cualquier API compatible."

---

## CHECKLIST PARA EL DÍA DE LA CHARLA

### Antes de la charla:
- [ ] App deployada en Amplify y funcionando (probar la URL)
- [ ] Groq API key con requests disponibles (verificar en console.groq.com)
- [ ] Error de K8s preparado que dé buen resultado
- [ ] Prompt de YAML preparado
- [ ] 2 tickets de ejemplo pensados para el daily
- [ ] Consola de Amplify abierta en una tab
- [ ] Kiro abierto con el proyecto en otra tab
- [ ] Link del repo de GitHub listo para compartir
- [ ] Internet funcionando (la app necesita conexión para Groq)

### Tabs abiertas en el browser:
1. La app deployada (URL de Amplify)
2. Consola de AWS Amplify
3. Kiro con el proyecto abierto

### Plan B (si falla internet):
- Tener screenshots de los resultados de cada módulo
- El YAML generator y troubleshooting no funcionan sin internet
- El daily speech estructurado (sin IA) sí funciona offline

---

## TIMING DETALLADO

| Sección | Duración | Acumulado |
|---------|----------|-----------|
| 1. Intro | 3 min | 3 min |
| 2. Kiro | 5 min | 8 min |
| 3. Demo Troubleshooting | 5 min | 13 min |
| 4. Demo YAML Generator | 5 min | 18 min |
| 5. Demo Daily Speech | 5 min | 23 min |
| 6. Integración de IA | 5 min | 28 min |
| 7. Arquitectura | 4 min | 32 min |
| 8. Deploy Amplify | 4 min | 36 min |
| 9. Cierre | 2 min | 38 min |
| Q&A | 2-5 min | 40-43 min |

**Total: 38-43 minutos**

> 💡 Si necesitas acortar a 35 min: reduce Kiro a 3 min y Arquitectura a 2 min (ya la explicaste en la sección de IA).
