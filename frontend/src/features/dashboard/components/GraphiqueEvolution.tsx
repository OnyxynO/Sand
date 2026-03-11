import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';

interface JourStat {
  date: string;
  tempsTotal: number;
  estComplet: boolean;
}

interface GraphiqueEvolutionProps {
  donnees: JourStat[];
}

function formatDateCourte(dateISO: string): string {
  const date = new Date(dateISO + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function GraphiqueEvolution({ donnees }: GraphiqueEvolutionProps) {
  if (donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolution journaliere</h3>
        <p className="text-gray-400 text-center py-8">Aucune donnee pour cette periode</p>
      </div>
    );
  }

  const dataChart = donnees.map((d) => ({
    date: formatDateCourte(d.date),
    etp: d.tempsTotal,
  }));

  const renderTooltip = (valeur: number | string | undefined): [string, string] => [
    `${Number(valeur ?? 0).toFixed(2)} ETP`,
    'Temps total',
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolution journaliere</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataChart}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip formatter={renderTooltip} />
          <ReferenceLine y={1} stroke="#9CA3AF" strokeDasharray="3 3" label="1.0 ETP" />
          <Line type="monotone" dataKey="etp" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
