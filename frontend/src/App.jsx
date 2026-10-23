import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://127.0.0.1:4000/api/operacion'
const N8N_AGENT_URL = import.meta.env.VITE_N8N_AGENT_URL
const initialForm = { numero: '', fecha: new Date().toISOString().slice(0, 10), regimen: 'Importación', estado: 'Recibida', id_pais_origen: '', id_empresa: '', id_producto: '', cantidad: 1, id_almacen: '' }

function Status({ value }) { return <span className={`status status--${value.toLowerCase().replaceAll(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>{value}</span> }

function App() {
  const [section, setSection] = useState('resumen')
  const [catalogs, setCatalogs] = useState({ paises: [], empresas: [], productos: [], almacenes: [] })
  const [declarations, setDeclarations] = useState([])
  const [summary, setSummary] = useState({ total_declaraciones: 0, ingresos: 0, salidas: 0, retenidas: 0 })
  const [filter, setFilter] = useState('Todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [askingAi, setAskingAi] = useState(false)

  async function loadData() {
    try {
      const [catalogResponse, declarationResponse, summaryResponse] = await Promise.all([fetch(`${API_URL}/catalogos`), fetch(`${API_URL}/declaraciones`), fetch(`${API_URL}/resumen`)])
      if (!catalogResponse.ok || !declarationResponse.ok || !summaryResponse.ok) throw new Error('No se pudo conectar con la API.')
      setCatalogs(await catalogResponse.json())
      setDeclarations(await declarationResponse.json())
      setSummary(await summaryResponse.json())
    } catch (error) { setMessage(error.message) }
  }

  useEffect(() => {
    const requestId = setTimeout(() => { void loadData() }, 0)
    return () => clearTimeout(requestId)
  }, [])

  const visibleDeclarations = useMemo(() => declarations.filter((row) => filter === 'Todas' || row.regimen === filter), [declarations, filter])

  function updateForm(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }

  async function submitDeclaration(event) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      const response = await fetch(`${API_URL}/declaraciones`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, cantidad: Number(form.cantidad), id_pais_origen: Number(form.id_pais_origen), id_empresa: Number(form.id_empresa), id_producto: Number(form.id_producto), id_almacen: Number(form.id_almacen) }) })
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo registrar la mercancía.')
      setModalOpen(false); setForm(initialForm); setMessage(`Mercancía registrada con la declaración ${data.numero}.`); await loadData()
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }

  async function changeStatus(id, estado) {
    try {
      const response = await fetch(`${API_URL}/declaraciones/${id}/estado`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) })
      const data = await response.json(); if (!response.ok) throw new Error(data.error)
      setMessage(`Declaración actualizada a “${data.estado}”.`); await loadData()
    } catch (error) { setMessage(error.message) }
  }

  async function askAi(event) {
    event.preventDefault()
    if (!aiQuestion.trim()) return
    if (!N8N_AGENT_URL) { setAiAnswer('Falta configurar VITE_N8N_AGENT_URL en el archivo .env.local para conectar el agente de n8n.'); return }
    setAskingAi(true); setAiAnswer('')
    try {
      const response = await fetch(N8N_AGENT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatInput: aiQuestion, sessionId: 'aduana-frontend' }) })
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'n8n no pudo procesar la consulta.')
      setAiAnswer(data.output || data.text || data.response || JSON.stringify(data))
    } catch (error) { setAiAnswer(error.message) } finally { setAskingAi(false) }
  }

  const formLabel = form.regimen === 'Exportación' ? 'Registrar salida' : 'Registrar ingreso'

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#inicio"><span className="brand-mark">A</span><span>Aduana<span>Central</span></span></a>
      <p className="sidebar-label">OPERACIÓN</p>
      <nav aria-label="Navegación principal">
        <button className={`nav-link ${section === 'resumen' ? 'active' : ''}`} onClick={() => setSection('resumen')}><span>▦</span> Resumen</button>
        <button className={`nav-link ${section === 'declaraciones' ? 'active' : ''}`} onClick={() => setSection('declaraciones')}><span>⇄</span> Entradas y salidas</button>
      </nav>
      <div className="sidebar-bottom"><div className="operator"><span className="avatar">AC</span><span><b>Operador aduanero</b><small>Base de datos conectada</small></span></div></div>
    </aside>

    <section className="workspace" id="inicio">
      <header className="topbar"><div><p className="eyebrow">OPERACIÓN ADUANERA · BASE SQLITE</p><h1>{section === 'resumen' ? 'Inventario aduanero' : 'Administrar entradas y salidas'}</h1></div><button className="new-button" onClick={() => { setForm(initialForm); setModalOpen(true) }}>＋ Registrar mercancía</button></header>
      {message && <div className="flash" role="status">{message}<button onClick={() => setMessage('')} aria-label="Cerrar">×</button></div>}

      {section === 'resumen' && <>
        <section className="agent-card"><div className="agent-heading"><span className="agent-orb">✦</span><div><p>ASISTENTE IA · N8N</p><h2>Consulta la base aduanera en lenguaje natural</h2></div></div><form className="agent-form" onSubmit={askAi}><input aria-label="Pregunta para el agente" value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Ej. ¿Qué mercancías siguen retenidas y en qué bodega están?" /><button disabled={askingAi}>{askingAi ? 'Consultando…' : 'Consultar →'}</button></form>{aiAnswer && <div className="ai-answer" role="status">{aiAnswer}</div>}<p className="summary-copy">El agente n8n consulta la base por una herramienta SQL de solo lectura. Registrar movimientos continúa disponible abajo.</p><button className="agent-action" onClick={() => setModalOpen(true)}>Registrar mercancía →</button></section>
        <section className="metrics" aria-label="Indicadores de inventario">
          <article><span className="metric-icon cyan">▣</span><p>Declaraciones</p><strong>{summary.total_declaraciones}</strong><small>Registros almacenados</small></article>
          <article><span className="metric-icon green">↓</span><p>Ingresos</p><strong>{summary.ingresos}</strong><small>Importaciones registradas</small></article>
          <article><span className="metric-icon amber">↑</span><p>Salidas</p><strong>{summary.salidas}</strong><small>Exportaciones registradas</small></article>
          <article><span className="metric-icon red">!</span><p>Retenidas</p><strong>{summary.retenidas}</strong><small className="alert">Requieren seguimiento</small></article>
        </section>
        <section className="inventory"><div className="section-heading"><div><p className="eyebrow">ÚLTIMOS MOVIMIENTOS</p><h2>Declaraciones recientes</h2></div><button className="text-button" onClick={() => setSection('declaraciones')}>Administrar todo →</button></div><DeclarationTable rows={declarations.slice(0, 5)} compact /></section>
      </>}

      {section === 'declaraciones' && <section className="inventory"><div className="section-heading"><div><p className="eyebrow">CONTROL OPERATIVO</p><h2>Ingresos y salidas de mercancía</h2></div></div><div className="filters"><div className="filter-tabs">{['Todas', 'Importación', 'Exportación', 'Tránsito'].map((option) => <button className={filter === option ? 'selected' : ''} onClick={() => setFilter(option)} key={option}>{option}</button>)}</div><button className="outline-button" onClick={loadData}>↻ Actualizar</button></div><DeclarationTable rows={visibleDeclarations} onChangeStatus={changeStatus} /></section>}
    </section>

    {modalOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="register-title"><form className="register-modal" onSubmit={submitDeclaration}><div className="modal-title"><div><p className="eyebrow">NUEVO MOVIMIENTO</p><h2 id="register-title">{formLabel}</h2></div><button type="button" onClick={() => setModalOpen(false)} className="close-button">×</button></div><div className="form-grid">
      <label>Número de declaración<input required name="numero" value={form.numero} onChange={updateForm} placeholder="Ej. DUA-2026-0016" /></label>
      <label>Fecha<input required type="date" name="fecha" value={form.fecha} onChange={updateForm} /></label>
      <label>Tipo de movimiento<select name="regimen" value={form.regimen} onChange={updateForm}><option>Importación</option><option>Exportación</option><option>Tránsito</option></select></label>
      <label>Estado<select name="estado" value={form.estado} onChange={updateForm}><option>Recibida</option><option>En inspección</option><option>Retenida</option><option>Liberada</option></select></label>
      <Select label="País de origen" name="id_pais_origen" value={form.id_pais_origen} onChange={updateForm} items={catalogs.paises} />
      <Select label="Empresa" name="id_empresa" value={form.id_empresa} onChange={updateForm} items={catalogs.empresas} />
      <Select label="Mercancía" name="id_producto" value={form.id_producto} onChange={updateForm} items={catalogs.productos} labelKey="nombre" />
      <label>Cantidad<input required min="0.01" step="0.01" type="number" name="cantidad" value={form.cantidad} onChange={updateForm} /></label>
      <Select label="Bodega" name="id_almacen" value={form.id_almacen} onChange={updateForm} items={catalogs.almacenes} labelKey="nombre" />
    </div><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="new-button" disabled={saving}>{saving ? 'Guardando…' : formLabel}</button></div></form></div>}
  </main>
}

function Select({ label, name, value, onChange, items, labelKey = 'nombre' }) { return <label>{label}<select required name={name} value={value} onChange={onChange}><option value="">Selecciona una opción</option>{items.map((item) => <option value={item.id} key={item.id}>{item.codigo ? `${item.codigo} · ` : ''}{item[labelKey]}</option>)}</select></label> }

function DeclarationTable({ rows, compact = false, onChangeStatus }) { return <div className="table-wrap"><table><thead><tr><th>DECLARACIÓN</th><th>MOVIMIENTO</th><th>MERCANCÍA</th><th>EMPRESA</th><th>ORIGEN</th><th>ESTADO</th>{!compact && <th>ACCIÓN</th>}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><b>{row.numero}</b><small>{row.fecha}</small></td><td>{row.regimen}</td><td>{row.mercancias || 'Sin detalle'}</td><td>{row.empresa}</td><td>{row.pais_origen}</td><td><Status value={row.estado} /></td>{!compact && <td><select className="status-select" value={row.estado} onChange={(event) => onChangeStatus(row.id, event.target.value)}><option>Recibida</option><option>En inspección</option><option>Retenida</option><option>Liberada</option></select></td>}</tr>)}</tbody></table>{rows.length === 0 && <p className="empty">No hay movimientos para este filtro.</p>}</div> }

export default App
