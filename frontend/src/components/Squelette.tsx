// Composants squelette pour indiquer le chargement (animation pulse)
// Chaque composant imite la forme du vrai contenu qu'il remplace.

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

/** Carte statistique (icône ronde + grande valeur + label) */
export function SqueletteCarte() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <Pulse className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-7 w-24" />
        <Pulse className="h-4 w-36" />
      </div>
    </div>
  );
}

/** Graphique (titre + zone de tracé) */
export function SqueletteGraphique({ hauteur = 'h-52' }: { hauteur?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <Pulse className="h-5 w-40" />
      <Pulse className={`w-full ${hauteur}`} />
    </div>
  );
}

/** Tableau avec N lignes fantômes */
export function SqueletteTableau({ titre = 'Chargement…', lignes = 4 }: { titre?: string; lignes?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="text-lg font-semibold text-gray-300">{titre}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: lignes }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-4 w-40" />
              <Pulse className="h-3 w-24" />
            </div>
            <Pulse className="h-4 w-28" />
            <Pulse className="h-6 w-20 rounded-full" />
            <Pulse className="h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
