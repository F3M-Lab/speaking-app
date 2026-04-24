import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Report } from '../types';
import api from '../services/api';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CEFR_COLORS: Record<string, string> = {
  A1: '#ef4444', A2: '#f97316', B1: '#3b82f6', B2: '#8b5cf6', C1: '#10b981', C2: '#f59e0b',
};
const LEVEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
const TABS = ['Vocabulario', 'Pronunciación y Fluidez', 'Gramática'];

const ACHIEVEMENT_ICONS: Record<string, string> = {
  mic: '🎙', zap: '⚡', crown: '👑', target: '🎯', star: '⭐', book: '📚', default: '🏆',
};

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/reports/${id}`);
        if (data.status === 'processing') {
          setTimeout(load, 4000);
          return;
        }
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !report || report.status === 'processing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 font-medium">Procesando tu análisis...</p>
        <p className="text-gray-400 text-sm mt-1">Esto puede tomar unos minutos</p>
      </div>
    );
  }

  const analysisFailure = report.status === 'error' || (report.status === 'completed' && report.wordCount === 0);

  if (analysisFailure) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Same header as the normal report */}
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Inicio
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Test de Speaking en Inglés de SpeakingApp</h1>
            <p className="text-sm text-gray-500 mt-1">
              Fecha: <strong className="text-gray-700">{new Date(report.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </p>
          </div>
        </div>

        {/* Error body */}
        <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No se pudo obtener el análisis</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-1">
            Ocurrió un problema al procesar tu audio y no fue posible generar el reporte de resultados.
          </p>
          <p className="text-gray-400 text-sm max-w-sm mb-8">
            Puedes intentar realizar el test de nuevo. Si el problema persiste, intenta más tarde.
          </p>
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Fluidez', value: report.dimensions.fluency.score, level: report.dimensions.fluency.level },
    { subject: 'Vocabulario', value: report.dimensions.vocabulary.score, level: report.dimensions.vocabulary.level },
    { subject: 'Interacción', value: report.dimensions.interaction.score, level: report.dimensions.interaction.level },
    { subject: 'Pronunciación', value: report.dimensions.pronunciation.score, level: report.dimensions.pronunciation.level },
    { subject: 'Gramática', value: report.dimensions.grammar.score, level: report.dimensions.grammar.level },
  ];

  const pieData = (report.vocabularyStats?.wordsByLevel || []).map(w => ({
    name: w.level,
    value: w.percentage,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-start justify-between">
          <div>
            <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Inicio
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Test de Speaking en Inglés de SpeakingApp</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>Fecha: <strong className="text-gray-700">{new Date(report.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
              {report.duration > 0 && <span>Duración: <strong className="text-gray-700">{report.duration} min</strong></span>}
              {report.wordCount > 0 && <span>Palabras: <strong className="text-gray-700">{report.wordCount}</strong></span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">🏅 Certificado</button>
            <button className="btn-secondary text-sm">↑ Compartir</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Score + Radar */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Puntuaciones</p>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ backgroundColor: CEFR_COLORS[report.overallLevel] || '#3b82f6' }}
                >
                  {report.overallLevel}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">Intermedio</p>
                  <p className="text-sm text-gray-500 mt-0.5 max-w-xs">
                    Una persona en este nivel puede entender los puntos principales de entradas claras sobre temas familiares.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {radarData.map(d => (
                  <div key={d.subject} className="flex items-center gap-2 text-sm">
                    <span className="w-24 text-gray-500">{d.subject}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${d.value}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium" style={{ color: CEFR_COLORS[d.level] }}>{d.level}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        {report.achievements?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Logros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {report.achievements.map((ach, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-dashed border-amber-300 rounded-xl bg-amber-50">
                  <span className="text-2xl">{ACHIEVEMENT_ICONS[ach.icon] || ACHIEVEMENT_ICONS.default}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{ach.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nicely done / Things to improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.niceDone?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Bien hecho</h3>
              <ul className="space-y-2">
                {report.niceDone.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.toImprove?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">A mejorar</h3>
              <ul className="space-y-2">
                {report.toImprove.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card p-6">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === i ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Vocabulary tab */}
          {activeTab === 0 && report.vocabularyStats && (
            <div className="space-y-6">
              {/* Rephrasing */}
              {report.vocabularyStats.rephrasing?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">🌐</span>
                    <h3 className="font-medium text-gray-800 text-sm">Cómo lo diría un nativo</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 text-gray-500 font-medium rounded-tl-lg">Oración original</th>
                        <th className="text-left px-4 py-2 text-gray-500 font-medium rounded-tr-lg">Oración reformulada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.vocabularyStats.rephrasing.map((r, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-gray-700">{r.original}</td>
                          <td className="px-4 py-3 text-gray-700">{r.native}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Vocabulario activo', value: report.vocabularyStats.activeVocabularyEstimate, suffix: ' palabras', sub: 'Nivel B2' },
                  { label: 'Palabras únicas', value: report.vocabularyStats.uniqueWords, sub: 'usadas una sola vez' },
                  { label: 'Palabras raras', value: `${report.vocabularyStats.rareWordsPercentage}%`, sub: 'no están entre las 5,000 más comunes' },
                  { label: 'Palabras frecuentes', value: `${report.vocabularyStats.frequentWordsPercentage}%`, sub: 'entre las 2,000 más usadas' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{s.value}{s.suffix || ''}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Pie chart + repetitions */}
              {pieData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas de vocabulario</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                          {pieData.map((_, i) => <Cell key={i} fill={LEVEL_COLORS[i % LEVEL_COLORS.length]} />)}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {report.vocabularyStats.repetitions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Palabras repetidas</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">Palabra</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">Repeticiones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.vocabularyStats.repetitions.slice(0, 6).map((r, i) => (
                            <tr key={i} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-blue-50' : ''}`}>
                              <td className="px-3 py-2 text-gray-700">{r.word}</td>
                              <td className="px-3 py-2 text-gray-700">{r.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {report.vocabularyStats.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Amplía tu vocabulario</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 rounded-lg">
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Palabra</th>
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Nivel</th>
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Sinónimos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.vocabularyStats.suggestions.slice(0, 10).map((s, i) => (
                        <tr key={i} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-4 py-2.5 text-gray-700 font-medium">{s.word}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{ backgroundColor: CEFR_COLORS[s.level] + '20', color: CEFR_COLORS[s.level] }}
                            >
                              {s.level}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{s.synonyms?.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Pronunciation tab */}
          {activeTab === 1 && report.pronunciationStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Velocidad de habla</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {report.pronunciationStats.speechRate === 'normal'
                      ? 'Normal'
                      : report.pronunciationStats.speechRate === 'fast'
                      ? 'Rápido'
                      : 'Lento'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Muletillas totales</p>
                  <p className="text-lg font-bold text-gray-900">{report.pronunciationStats.totalFillerWordCount}</p>
                  {report.pronunciationStats.fillerWords?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">{report.pronunciationStats.fillerWords.join(', ')}</p>
                  )}
                </div>
              </div>
              {report.pronunciationStats.issues?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Problemas específicos detectados</h3>
                  <ul className="space-y-2">
                    {report.pronunciationStats.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 rounded-lg p-3">
                        <span className="text-amber-500">⚠</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Grammar tab */}
          {activeTab === 2 && report.grammarStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Construcciones avanzadas</p>
                  <p className="text-2xl font-bold text-gray-900">{report.grammarStats.advancedConstructionsCount}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Errores detectados</p>
                  <p className="text-2xl font-bold text-gray-900">{report.grammarStats.errors?.length || 0}</p>
                </div>
              </div>
              {report.grammarStats.structuresUsed?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Estructuras utilizadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.grammarStats.structuresUsed.map((s, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {report.grammarStats.errors?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Errores y correcciones</h3>
                  <div className="space-y-3">
                    {report.grammarStats.errors.map((err, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 text-sm">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-red-400 text-xs font-medium mt-0.5">✗</span>
                          <span className="text-red-600 line-through">{err.original}</span>
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-green-500 text-xs font-medium mt-0.5">✓</span>
                          <span className="text-green-700 font-medium">{err.correction}</span>
                        </div>
                        <p className="text-gray-500 text-xs ml-4">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
