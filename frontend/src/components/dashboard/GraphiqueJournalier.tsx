import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';

interface JourStat {
  date: string;
  tempsTotal: number;
  estComplet: boolean;
}

interface GraphiqueJournalierProps {
  donnees: JourStat[];
}

function formatDateCourte(dateISO: string): string {
  const date = new Date(dateISO + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
}

export default function GraphiqueJournalier({ donnees }: GraphiqueJournalierProps) {
  if (donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisies journalieres</h3>
        <p className="text-gray-400 text-center py-8">Aucune donnee pour cette periode</p>
      </div>
    );
  }

  const dataChart = donnees.map((d) => ({
    date: formatDateCourte(d.date),
    etp: d.tempsTotal,
    estComplet: d.estComplet,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisies journalieres</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataChart}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 1.2]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(valeur: number) => [`${valeur.toFixed(2)} ETP`, 'Temps']}
          />
          <ReferenceLine y={1} stroke="#9CA3AF" strokeDasharray="3 3" label="1.0 ETP" />
          <Bar dataKey="etp" radius={[4, 4, 0, 0]}>
            {dataChart.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.estComplet ? '#10B981' : '#F59E0B'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
