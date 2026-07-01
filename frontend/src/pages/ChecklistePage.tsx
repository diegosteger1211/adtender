import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, ChevronDown, ChevronUp, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'

const CLASSIFICATIONS = [
  'Allgemeine Fragen',
  'Prozesse',
  'Systeme',
  'Schnittstellen',
  'Anforderungen',
  'Bewertungskriterien',
  'Sonstiges',
]

type SheetMeta = {
  name: string
  rows: number
  cols: number
  preview: string[][]
}

type SheetClassification = Record<string, string>

type UploadedChecklist = {
  id: string
  filename: string
  file_size: number
  uploaded_at: string
  classifications: { sheet_name: string; classification: string }[] | null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseExcel(file: File): Promise<SheetMeta[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheets: SheetMeta[] = wb.SheetNames.map(name => {
          const ws = wb.Sheets[name]
          const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')
          const rows = range.e.r - range.s.r + 1
          const cols = range.e.c - range.s.c + 1
          const raw: string[][] = XLSX.utils.sheet_to_json(ws, {
            header: 1,
            defval: '',
            raw: false,
          }) as string[][]
          const preview = raw.slice(0, 20)
          return { name, rows, cols, preview }
        })
        resolve(sheets)
      } catch {
        reject(new Error('Die Datei konnte nicht gelesen werden.'))
      }
    }
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei.'))
    reader.readAsArrayBuffer(file)
  })
}

export default function ChecklistePage() {
  const { id: projectId } = useParams<{ id: string }>()

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Parsed sheets (client-side, before/during upload)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sheets, setSheets] = useState<SheetMeta[]>([])
  const [classifications, setClassifications] = useState<SheetClassification>({})
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Existing checklists
  const [checklists, setChecklists] = useState<UploadedChecklist[]>([])
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => { loadChecklists() }, [projectId])

  async function loadChecklists() {
    setLoadingList(true)
    try {
      const res = await api.get<{ checklists: UploadedChecklist[] }>(
        `/api/projects/${projectId}/checklists`
      )
      setChecklists(res.checklists)
    } catch {
      // non-blocking
    } finally {
      setLoadingList(false)
    }
  }

  async function handleFile(file: File) {
    setUploadError('')
    setSaveSuccess(false)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls'].includes(ext ?? '')) {
      setUploadError('Nur .xlsx und .xls Dateien werden akzeptiert.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Die Datei ist zu groß (max. 20 MB).')
      return
    }

    setUploading(true)
    try {
      const parsed = await parseExcel(file)
      setPendingFile(file)
      setSheets(parsed)
      const defaults: SheetClassification = {}
      parsed.forEach(s => { defaults[s.name] = 'Sonstiges' })
      setClassifications(defaults)
      setExpandedSheet(parsed[0]?.name ?? null)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setUploading(false)
    }
  }

  async function handleUploadAndSave() {
    if (!pendingFile) return
    setSaving(true)
    setUploadError('')
    try {
      // 1. Upload file to backend
      const fd = new FormData()
      fd.append('file', pendingFile)
      const API_BASE = import.meta.env.VITE_API_URL || 'https://adtender-api.steger.workers.dev'
      const token = localStorage.getItem('adtender_token')
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/checklists`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) throw new Error('Upload fehlgeschlagen.')
      const { id } = await res.json() as { id: string }

      // 2. Save classifications
      await api.put(`/api/projects/${projectId}/checklists/${id}/classify`, {
        classifications: Object.entries(classifications).map(([sheet_name, classification]) => ({
          sheet_name,
          classification,
        })),
      })

      setSaveSuccess(true)
      setPendingFile(null)
      setSheets([])
      setClassifications({})
      await loadChecklists()
    } catch {
      setUploadError('Die Datei konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteChecklist(clId: string) {
    if (!confirm('Checkliste wirklich löschen?')) return
    try {
      await api.delete(`/api/projects/${projectId}/checklists/${clId}`)
      setChecklists(prev => prev.filter(c => c.id !== clId))
    } catch {
      // silent
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkliste</h1>
        <p className="text-gray-500 text-sm mt-1">Excel-Checkliste hochladen und Tabellenblätter klassifizieren</p>
      </div>

      {/* Upload area */}
      {!pendingFile && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-8 ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-brand-400 animate-spin" />
              <p className="text-sm text-gray-500">Datei wird gelesen…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload size={32} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-700">
                Excel-Datei hierher ziehen oder <span className="text-brand-500">auswählen</span>
              </p>
              <p className="text-xs text-gray-400">.xlsx · .xls · max. 20 MB</p>
            </div>
          )}
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm mb-6">
          <AlertCircle size={16} className="flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Save success */}
      {saveSuccess && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm mb-6">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          Checkliste erfolgreich gespeichert.
        </div>
      )}

      {/* Pending file — sheet inspector */}
      {pendingFile && sheets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={18} className="text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{pendingFile.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(pendingFile.size)} · {sheets.length} Tabellenblatt{sheets.length !== 1 ? 'blätter' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setPendingFile(null); setSheets([]); setClassifications({}) }}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Sheets */}
          <div className="divide-y divide-gray-100">
            {sheets.map(sheet => (
              <div key={sheet.name}>
                {/* Sheet header */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{sheet.name}</p>
                      <p className="text-xs text-gray-400">{sheet.rows} Zeilen · {sheet.cols} Spalten</p>
                    </div>
                    {/* Classification */}
                    <select
                      value={classifications[sheet.name] ?? 'Sonstiges'}
                      onChange={e => setClassifications(prev => ({ ...prev, [sheet.name]: e.target.value }))}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:border-brand-500 bg-white"
                    >
                      {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => setExpandedSheet(prev => prev === sheet.name ? null : sheet.name)}
                    className="ml-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    Vorschau
                    {expandedSheet === sheet.name ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {/* Sheet preview */}
                {expandedSheet === sheet.name && sheet.preview.length > 0 && (
                  <div className="px-5 pb-4 overflow-x-auto">
                    <table className="text-xs w-full border-collapse">
                      <tbody>
                        {sheet.preview.map((row, ri) => (
                          <tr key={ri} className={ri === 0 ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={`border border-gray-100 px-2 py-1 max-w-[160px] truncate ${
                                  ri === 0 ? 'font-medium text-gray-700' : 'text-gray-600'
                                }`}
                                title={String(cell)}
                              >
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleUploadAndSave}
              disabled={saving}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {saving ? 'Wird gespeichert…' : 'Klassifikation speichern'}
            </button>
          </div>
        </div>
      )}

      {/* Existing checklists */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Hochgeladene Checklisten</h2>
        {loadingList ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
            <Loader2 size={16} className="animate-spin" /> Wird geladen…
          </div>
        ) : checklists.length === 0 ? (
          <p className="text-gray-400 text-sm py-6">Noch keine Checklisten hochgeladen.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
            {checklists.map(cl => {
              const clsArr = typeof cl.classifications === 'string'
                ? JSON.parse(cl.classifications ?? '[]')
                : (cl.classifications ?? [])
              return (
                <div key={cl.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSpreadsheet size={18} className="text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{cl.filename}</p>
                      <p className="text-xs text-gray-400">
                        {formatBytes(cl.file_size)} · {new Date(cl.uploaded_at).toLocaleDateString('de-DE')}
                        {clsArr.length > 0 && ` · ${clsArr.length} Blatt${clsArr.length !== 1 ? 'blätter' : ''} klassifiziert`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteChecklist(cl.id)}
                    title="Löschen"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
