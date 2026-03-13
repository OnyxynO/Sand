import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface UtilisateurStat {
  utilisateur: { id: string; nomComplet: string };
  tempsTotal: number;
  tauxCompletion: number;
}

interface GraphiqueUtilisateursProps {
  donnees: UtilisateurStat[];
}

export default function GraphiqueUtilisateurs({ donnees }: GraphiqueUtilisateursProps) {
  if (donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps par utilisateur</h3>
        <p className="text-gray-400 text-center py-8">Aucune donnee pour cette periode</p>
      </div>
    );
  }

  const dataChart = [...donnees]
    .sort((a, b) => b.tempsTotal - a.tempsTotal)
    .map((d) => ({
      nom: d.utilisateur.nomComplet,
      temps: d.tempsTotal,
      tauxCompletion: d.tauxCompletion,
    }));

  const renderTooltip = (
    valeur: ValueType | undefined,
    _nom: NameType | undefined,
    props: { payload?: { tauxCompletion?: number } },
  ): [string, string] => [
    `${Number(valeur ?? 0).toFixed(2)} j (completion: ${props.payload?.tauxCompletion ?? 0}%)`,
    'Temps',
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps par utilisateur</h3>
      <ResponsiveContainer width="100%" height={Math.max(300, dataChart.length * 40)}>
        <BarChart data={dataChart} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="nom" type="category" tick={{ fontSize: 12 }} width={120} />
          <Tooltip formatter={renderTooltip} />
          <Bar dataKey="temps" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
