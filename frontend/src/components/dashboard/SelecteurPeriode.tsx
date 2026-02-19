import { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SelecteurPeriodeProps {
  dateDebut: string;
  dateFin: string;
  onChangePeriode: (dateDebut: string, dateFin: string) => void;
}

function formatMoisAnnee(annee: number, mois: number): string {
  const date = new Date(annee, mois);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function dernierJourDuMois(annee: number, mois: number): number {
  return new Date(annee, mois + 1, 0).getDate();
}

export default function SelecteurPeriode({ onChangePeriode }: SelecteurPeriodeProps) {
  const maintenant = new Date();
  const [annee, setAnnee] = useState(maintenant.getFullYear());
  const [mois, setMois] = useState(maintenant.getMonth());

  const estMoisCourant = useMemo(() => {
    return annee === maintenant.getFullYear() && mois === maintenant.getMonth();
  }, [annee, mois, maintenant]);

  const allerMoisPrecedent = () => {
    const nouveauMois = mois === 0 ? 11 : mois - 1;
    const nouvelleAnnee = mois === 0 ? annee - 1 : annee;
    setMois(nouveauMois);
    setAnnee(nouvelleAnnee);
    const debut = `${nouvelleAnnee}-${String(nouveauMois + 1).padStart(2, '0')}-01`;
    const fin = `${nouvelleAnnee}-${String(nouveauMois + 1).padStart(2, '0')}-${dernierJourDuMois(nouvelleAnnee, nouveauMois)}`;
    onChangePeriode(debut, fin);
  };

  const allerMoisSuivant = () => {
    const nouveauMois = mois === 11 ? 0 : mois + 1;
    const nouvelleAnnee = mois === 11 ? annee + 1 : annee;
    setMois(nouveauMois);
    setAnnee(nouvelleAnnee);
    const debut = `${nouvelleAnnee}-${String(nouveauMois + 1).padStart(2, '0')}-01`;
    const fin = `${nouvelleAnnee}-${String(nouveauMois + 1).padStart(2, '0')}-${dernierJourDuMois(nouvelleAnnee, nouveauMois)}`;
    onChangePeriode(debut, fin);
  };

  const allerMoisCourant = () => {
    const m = maintenant.getMonth();
    const a = maintenant.getFullYear();
    setMois(m);
    setAnnee(a);
    const debut = `${a}-${String(m + 1).padStart(2, '0')}-01`;
    const fin = `${a}-${String(m + 1).padStart(2, '0')}-${dernierJourDuMois(a, m)}`;
    onChangePeriode(debut, fin);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={allerMoisPrecedent}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Mois precedent"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={allerMoisSuivant}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Mois suivant"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>

        {!estMoisCourant && (
          <button
            onClick={allerMoisCourant}
            className="ml-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Ce mois
          </button>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 capitalize">
        {formatMoisAnnee(annee, mois)}
      </h2>

      <div className="w-32" />
    </div>
  );
}
