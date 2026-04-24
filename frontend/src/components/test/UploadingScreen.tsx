import { Loader2 } from 'lucide-react';

export default function UploadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md w-full">
        <div className="text-4xl mb-6">⏳</div>
        <p className="text-lg font-semibold text-gray-800 mb-2">Subiendo tus respuestas...</p>
        <p className="text-sm text-amber-600 font-medium mb-6">
          ⚠️ Importante: Mantén esta ventana abierta hasta que la carga se complete.
          Cerrarla podría perder tus resultados.
        </p>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
      </div>
    </div>
  );
}
