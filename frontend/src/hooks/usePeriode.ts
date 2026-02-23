function dernierJourDuMois(annee: number, mois: number): number {
  return new Date(annee, mois + 1, 0).getDate();
}

export function periodeInitiale(): { debut: string; fin: string } {
  const maintenant = new Date();
  const a = maintenant.getFullYear();
  const m = maintenant.getMonth();
  const debut = `${a}-${String(m + 1).padStart(2, '0')}-01`;
  const fin = `${a}-${String(m + 1).padStart(2, '0')}-${dernierJourDuMois(a, m)}`;
  return { debut, fin };
}

export function periodePrecedente(dateDebut: string): { debutPrec: string; finPrec: string } {
  const debut = new Date(dateDebut + 'T00:00:00');
  const moisPrec = debut.getMonth() === 0 ? 11 : debut.getMonth() - 1;
  const anneePrec = debut.getMonth() === 0 ? debut.getFullYear() - 1 : debut.getFullYear();
  const debutPrec = `${anneePrec}-${String(moisPrec + 1).padStart(2, '0')}-01`;
  const finPrec = `${anneePrec}-${String(moisPrec + 1).padStart(2, '0')}-${dernierJourDuMois(anneePrec, moisPrec)}`;
  return { debutPrec, finPrec };
}
