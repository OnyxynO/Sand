import { type ReactNode } from 'react';

interface CarteResumeProps {
  icone: ReactNode;
  valeur: string;
  label: string;
  couleurIcone?: string;
}

export default function CarteResume({
  icone,
  valeur,
  label,
  couleurIcone = 'text-blue-600 bg-blue-100',
}: CarteResumeProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${couleurIcone}`}>
        {icone}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{valeur}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
