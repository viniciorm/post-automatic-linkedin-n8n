import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import mermaid from 'mermaid'
import {
  ArrowRight,
  BookOpenText,
  Check,
  CircleHalf,
  GithubLogo,
  List,
  MagnifyingGlass,
  PaperPlaneTilt,
  Rss,
  Robot,
  Sparkle,
  Table,
  UserCircleCheck,
  X,
} from '@phosphor-icons/react'
import manual from './content/manual.md?raw'

const chapters = [
  ['objetivo', '1. Objetivo'],
  ['arquitectura-actual', '2. Arquitectura actual'],
  ['requisitos', '3. Requisitos'],
  ['preparacion-de-google-sheets', '4. Google Sheets'],
  ['ciclo-de-vida-del-contenido', '5. Ciclo de vida'],
  ['instalacion-y-configuracion', '6. Instalación'],
  ['primera-prueba-de-una-publicacion-personal', '7. Primera prueba'],
  ['voz-personal-y-formato-editorial', '8. Voz editorial'],
  ['errores-encontrados-y-soluciones', '9. Errores y soluciones'],
  ['operacion-segura', '10. Operación segura'],
  ['migracion-a-n8n-en-vps', '11. Migración VPS'],
  ['asistente-editorial-por-telegram', '12. Telegram'],
  ['archivos-del-proyecto', '13. Archivos'],
  ['pendientes-conocidos', '14. Pendientes'],
  ['lista-de-seguridad-antes-de-publicar-el-proyecto', '15. Seguridad'],
  ['registro-de-cambios', '16. Cambios'],
]

const slug = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens)
      const plain = tokens.map((token) => token.text || token.raw || '').join('')
      return `<h${depth} id="${slug(plain.replace(/^\d+\.\s*/, ''))}">${text}</h${depth}>`
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens)
      const external = /^https?:/.test(href)
      return `<a href="${href}"${title ? ` title="${title}"` : ''}${external ? ' target="_blank" rel="noreferrer"' : ''}>${text}</a>`
    },
  },
})

const manualBody = manual.replace(/^# .+\r?\n/, '')

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(chapters[0][0])

  const content = useMemo(() => marked.parse(manualBody), [])
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return chapters.filter(([, label]) => label.toLowerCase().includes(term))
  }, [query])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'base',
      securityLevel: 'strict',
      themeVariables: {
        primaryColor: dark ? '#25382c' : '#eef2e8',
        primaryTextColor: dark ? '#f7f4ec' : '#1f231f',
        primaryBorderColor: '#6f8069',
        lineColor: dark ? '#a8b7a4' : '#566452',
        fontFamily: 'Manrope, sans-serif',
      },
    })
    const diagrams = document.querySelectorAll('pre code.language-mermaid')
    diagrams.forEach((code, index) => {
      const pre = code.parentElement
      if (!pre || pre.dataset.rendered) return
      pre.dataset.rendered = 'true'
      const holder = document.createElement('div')
      holder.className = 'mermaid-diagram'
      holder.textContent = code.textContent
      holder.id = `mermaid-${index}-${dark ? 'dark' : 'light'}`
      pre.replaceWith(holder)
    })
    mermaid.run({ querySelector: '.mermaid-diagram' }).catch(() => {})
  }, [content, dark])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting)
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-15% 0px -72% 0px' })
    chapters.forEach(([id]) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [content])

  const jumpTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
    setQuery('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Abrir navegación">
          <List size={22} />
        </button>
        <a className="brand" href="#top" aria-label="Inicio">
          <span className="brand-mark"><Sparkle weight="fill" size={20} /></span>
          <span><b>n8n</b> · LinkedIn Publishing</span>
        </a>
        <div className="header-actions">
          <div className="search-wrap">
            <MagnifyingGlass size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en la guía…" aria-label="Buscar en la guía" />
            <kbd>/</kbd>
            {query && (
              <div className="search-results">
                {matches.length ? matches.map(([id, label]) => (
                  <button key={id} onClick={() => jumpTo(id)}>{label}</button>
                )) : <span>Sin capítulos coincidentes</span>}
              </div>
            )}
          </div>
          <a className="header-link" href="https://github.com/viniciorm/post-automatic-linkedin-n8n" target="_blank" rel="noreferrer"><GithubLogo size={20} weight="fill" /> <span>GitHub</span></a>
          <button className="theme-button" onClick={() => setDark((value) => !value)} aria-label="Cambiar tema">
            <CircleHalf size={20} /> <span>{dark ? 'Claro' : 'Oscuro'}</span>
          </button>
        </div>
      </header>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-head">
          <b>Índice de capítulos</b>
          <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación"><X size={20} /></button>
        </div>
        <div className="progress-block">
          <span>DOCUMENTACIÓN</span>
          <strong>{chapters.length} capítulos</strong>
          <div className="progress"><i style={{ width: `${((chapters.findIndex(([id]) => id === active) + 1) / chapters.length) * 100}%` }} /></div>
        </div>
        <nav aria-label="Capítulos del manual">
          {chapters.map(([id, label], index) => (
            <button key={id} className={active === id ? 'active' : ''} onClick={() => jumpTo(id)}>
              <span>{String(index + 1).padStart(2, '0')}</span>{label.replace(/^\d+\.\s*/, '')}
            </button>
          ))}
        </nav>
        <div className="repo-note">
          <GithubLogo size={25} weight="fill" />
          <strong>Proyecto open source</strong>
          <p>Workflows, documentación y web bajo licencia MIT.</p>
          <a href="https://github.com/viniciorm/post-automatic-linkedin-n8n" target="_blank" rel="noreferrer">Ir al repositorio <ArrowRight size={15} /></a>
        </div>
      </aside>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />}

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><BookOpenText size={17} /> Manual de implementación · Actualizado el 22 de junio de 2026</div>
          <h1>Automatiza tus publicaciones<br />en LinkedIn con n8n</h1>
          <p>Una guía práctica para generar, revisar y publicar contenido con aprobación humana en el punto justo.</p>
        </section>

        <section className="system-overview" aria-label="Arquitectura resumida">
          <h2>Arquitectura del flujo</h2>
          <div className="flow-row">
            <div className="flow-step"><Rss size={28} /><b>RSS e ideas</b><small>Fuentes de contenido</small></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step"><Sparkle size={28} /><b>n8n</b><small>Orquestación</small></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step"><Table size={28} /><b>Google Sheets</b><small>Revisión y control</small></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step"><Robot size={28} /><b>Groq / OpenAI</b><small>Generación del copy</small></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step"><UserCircleCheck size={28} /><b>Aprobación</b><small>Control humano</small></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step linkedin"><span>in</span><b>LinkedIn</b><small>Publicación</small></div>
          </div>

          <div className="lifecycle">
            <div><i className="state-generate"><Sparkle size={18} /></i><span><b>GENERAR</b><small>La IA crea el borrador</small></span></div>
            <ArrowRight />
            <div><i className="state-review"><MagnifyingGlass size={18} /></i><span><b>REVISANDO</b><small>Una persona corrige</small></span></div>
            <ArrowRight />
            <div><i className="state-approved"><Check size={18} /></i><span><b>APROBADO</b><small>Listo para publicar</small></span></div>
            <ArrowRight />
            <div><i className="state-published"><PaperPlaneTilt size={18} /></i><span><b>PUBLICADO</b><small>LinkedIn confirma</small></span></div>
          </div>
        </section>

        <div className="content-layout">
          <article className="manual-content" dangerouslySetInnerHTML={{ __html: content }} />
          <aside className="on-page">
            <span>EN ESTA GUÍA</span>
            {chapters.slice(0, 12).map(([id, label]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => jumpTo(id)}>{label}</button>)}
          </aside>
        </div>

        <footer>
          <span><Sparkle weight="fill" /> Construye · Prueba · Revisa · Publica</span>
          <p>Automatiza con control humano en el punto justo.</p>
        </footer>
      </main>
    </div>
  )
}

export default App
