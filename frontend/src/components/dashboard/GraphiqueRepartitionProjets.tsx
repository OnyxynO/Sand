import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjetStat {
  projet: { id: string; nom: string; code: string };
  tempsTotal: number;
  pourcentage: number;
}

interface GraphiqueRepartitionProjetsProps {
  donnees: ProjetStat[];
}

const COULEURS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function GraphiqueRepartitionProjets({ donnees }: GraphiqueRepartitionProjetsProps) {
  if (donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Repartition par projet</h3>
        <p className="text-gray-400 text-center py-8">Aucune donnee pour cette periode</p>
      </div>
    );
  }

  const dataChart = donnees.map((d) => ({
    nom: d.projet.code,
    nomComplet: d.projet.nom,
    valeur: d.tempsTotal,
    pourcentage: d.pourcentage,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Repartition par projet</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataChart}
            dataKey="valeur"
            nameKey="nom"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ nom, pourcentage }) => `${nom} (${pourcentage.toFixed(0)}%)`}
          >
            {dataChart.map((_entry, index) => (
              <Cell key={index} fill={COULEURS[index % COULEURS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(valeur: number, _nom: string, props: { payload: { nomComplet: string } }) => [
              `${valeur.toFixed(2)} j`,
              props.payload.nomComplet,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
