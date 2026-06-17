# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: simulation.spec.ts >> Simulación completa con navegadores reales
- Location: e2e/simulation.spec.ts:46:5

# Error details

```
Test timeout of 120000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]: "1"
        - generic [ref=e16]: Issue
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - alert [ref=e20]
  - generic [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]: 🏥
        - generic [ref=e25]:
          - heading "[HU] - Visualización de movimientos [dashboard]" [level=1] [ref=e26]
          - generic [ref=e27]:
            - generic [ref=e28]: TC72EB
            - generic [ref=e29]: Crear tareas
      - button "🗑️ Eliminar sala" [ref=e31] [cursor=pointer]
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]: "Fase:"
        - button "⏳ Espera" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]: ⏳
          - generic [ref=e38]: Espera
        - button "📖 Lectura HU" [ref=e39] [cursor=pointer]:
          - generic [ref=e40]: 📖
          - generic [ref=e41]: Lectura HU
        - button "✏️ Crear tareas" [active] [ref=e42] [cursor=pointer]:
          - generic [ref=e43]: ✏️
          - generic [ref=e44]: Crear tareas
        - button "👀 Revisión" [ref=e45] [cursor=pointer]:
          - generic [ref=e46]: 👀
          - generic [ref=e47]: Revisión
        - button "📊 Resultados" [ref=e48] [cursor=pointer]:
          - generic [ref=e49]: 📊
          - generic [ref=e50]: Resultados
        - button "🔗 Comparación" [ref=e51] [cursor=pointer]:
          - generic [ref=e52]: 🔗
          - generic [ref=e53]: Comparación
        - button "🎉 Fin" [ref=e54] [cursor=pointer]:
          - generic [ref=e55]: 🎉
          - generic [ref=e56]: Fin
      - generic [ref=e57]:
        - generic [ref=e58]: "Timer:"
        - button "3 min" [ref=e59] [cursor=pointer]
        - button "5 min" [ref=e60] [cursor=pointer]
        - button "8 min" [ref=e61] [cursor=pointer]
        - button "10 min" [ref=e62] [cursor=pointer]
        - button "15 min" [ref=e63] [cursor=pointer]
        - button "⏹ Parar" [ref=e64] [cursor=pointer]
    - generic [ref=e66]:
      - group [ref=e67]:
        - generic "📖 Ver Historia de Usuario 2 pts" [ref=e68] [cursor=pointer]:
          - text: 📖 Ver Historia de Usuario
          - generic [ref=e69]: 2 pts
      - generic [ref=e70]:
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]: Backlog (0)
            - button "+ Nuevo" [ref=e74] [cursor=pointer]
          - generic [ref=e76]:
            - generic [ref=e77]: 📋
            - paragraph [ref=e78]: Sin tareas aún
            - button "Crear primera tarea" [ref=e79] [cursor=pointer]
        - generic [ref=e81]:
          - generic [ref=e82]: 📝
          - heading "Selecciona o crea un work item" [level=3] [ref=e83]
          - paragraph [ref=e84]: Usa el panel izquierdo para ver tus tareas o crea una nueva con el botón "+ Nuevo".
```