import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Report } from '../types';
import api from '../services/api';
import { Mic, LogOut, ChevronRight, Clock, BookOpen, Zap } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const CEFR_COLORS: Record<string, string> = {
  A1: '#ef4444', A2: '#f97316', B1: '#3b82f6', B2: '#8b5cf6', C1: '#10b981', C2: '#f59e0b',
};

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports').then(({ data }) => setReports(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const latestReport = reports.find(r => r.status === 'completed');

  const radarData = latestReport ? [
    { subject: 'Fluidez', value: latestReport.dimensions.fluency.score, fullMark: 100 },
    { subject: 'Vocabulario', value: latestReport.dimensions.vocabulary.score, fullMark: 100 },
    { subject: 'Interacción', value: latestReport.dimensions.interaction.score, fullMark: 100 },
    { subject: 'Pronunciación', value: latestReport.dimensions.pronunciation.score, fullMark: 100 },
    { subject: 'Gramática', value: latestReport.dimensions.grammar.score, fullMark: 100 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">SpeakingApp</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {user?.name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tu progreso</h1>
            <p className="text-gray-500 text-sm mt-1">Practica speaking y mejora tu nivel</p>
          </div>
          <Link to="/test" className="btn-primary">
            <Mic className="w-4 h-4" />
            Nuevo test
          </Link>
        </div>

        {/* Level + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Tu nivel</h2>
              {latestReport && (
                <span className="text-xs text-gray-400">Basado en tu último test</span>
              )}
            </div>
            {latestReport ? (
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: CEFR_COLORS[latestReport.overallLevel] || '#3b82f6' }}
                >
                  {latestReport.overallLevel}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Puntuación general</p>
                  <p className="text-3xl font-bold text-gray-900">{latestReport.overallScore}</p>
                  <p className="text-xs text-gray-400">de 100 puntos</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Aún no has hecho ningún test</p>
                <Link to="/test" className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block">
                  Empieza ahora →
                </Link>
              </div>
            )}
          </div>

          {latestReport && radarData.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Habilidades</h2>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Test history */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Historial de tests</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Cargando...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No hay tests completados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Link
                  key={report._id}
                  to={`/report/${report._id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: CEFR_COLORS[report.overallLevel] || '#3b82f6' }}
                    >
                      {report.status === 'processing' ? '…' : report.overallLevel || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Test de Speaking en Inglés
                        {report.status === 'processing' && <span className="ml-2 text-xs text-orange-500 font-normal">Procesando...</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {report.wordCount > 0 && (
                          <span className="text-xs text-gray-400">{report.wordCount} palabras</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
