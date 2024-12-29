import { useEffect, useState } from 'react';
import { db } from '../auth/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ListTasks from './ListTasks';

interface Projet {
    id: string;
    'titre-projet': string;
    'description-projet': string;
    'date-creation': string;
    etat: 'en cours' | 'terminé';
    ordre: number;
    tachesPendantes?: number;
}

export default function ListProjets() {
    const [projets, setProjets] = useState<Projet[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [projetEnEdition, setProjetEnEdition] = useState<Projet | null>(null);
    const [nouveauProjet, setNouveauProjet] = useState<{ titre: string; description: string }>({ titre: '', description: '' });
    const [projetEtendu, setProjetEtendu] = useState<string | null>(null);

    useEffect(() => {
        recupererProjets();
    }, []);

    const recupererProjets = async () => {
        try {
            const projetsCollection = collection(db, 'projets');
            const projetSnapshot = await getDocs(projetsCollection);
            const listeProjet = await Promise.all(projetSnapshot.docs.map(async doc => {
                const projet = { id: doc.id, ...doc.data() } as Projet;
                const tachesPendantes = await recupererTachesPendantes(projet.id);
                return { ...projet, tachesPendantes };
            }));
            listeProjet.sort((a, b) => a.ordre - b.ordre);
            setProjets(listeProjet);
        } catch (erreur) {
            console.error("Erreur lors de la récupération des projets : ", erreur);
            setNotification("Erreur lors du chargement des données.");
        }
    };

    const recupererTachesPendantes = async (projetId: string): Promise<number> => {
        const tachesQuery = query(
            collection(db, 'taches'),
            where('projet-id', '==', projetId),
            where('etat', '==', 'en cours')
        );
        const tachesSnapshot = await getDocs(tachesQuery);
        return tachesSnapshot.size;
    };

    const supprimerProjet = async (id: string, titre: string) => {
        const confirmationSuppression = window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${titre}" et toutes ses tâches ?`);
        if (!confirmationSuppression) return;

        try {
            await deleteDoc(doc(db, 'projets', id));
            setProjets(projets.filter(projet => projet.id !== id));
            setNotification(`Le projet "${titre}" et toutes ses tâches ont été supprimés.`);
        } catch (erreur) {
            console.error("Erreur lors de la suppression du projet : ", erreur);
            setNotification("Erreur lors de la suppression du projet.");
        }
    };

    const editerProjet = (projet: Projet) => {
        setProjetEnEdition({ ...projet });
    };

    const sauvegarderProjet = async () => {
        if (!projetEnEdition) return;

        try {
            await updateDoc(doc(db, 'projets', projetEnEdition.id), {
                'titre-projet': projetEnEdition['titre-projet'],
                'description-projet': projetEnEdition['description-projet'],
                etat: projetEnEdition.etat
            });
            setProjets(projets.map(p => p.id === projetEnEdition.id ? projetEnEdition : p));
            setProjetEnEdition(null);
            setNotification("Projet mis à jour avec succès.");
        } catch (erreur) {
            console.error("Erreur lors de la mise à jour du projet : ", erreur);
            setNotification("Erreur lors de la mise à jour du projet.");
        }
    };

    const ajouterProjet = async () => {
        try {
            const projetsCollection = collection(db, 'projets');
            const nouvellesDonneesProjet = {
                'titre-projet': nouveauProjet.titre,
                'description-projet': nouveauProjet.description,
                'date-creation': new Date().toISOString(),
                etat: 'en cours' as const,
                ordre: projets.length
            };
            const docRef = await addDoc(projetsCollection, nouvellesDonneesProjet);
            const nouveauProjetAvecId = { id: docRef.id, ...nouvellesDonneesProjet, tachesPendantes: 0 };
            setProjets([...projets, nouveauProjetAvecId]);
            setNouveauProjet({ titre: '', description: '' });
            setNotification("Nouveau projet créé avec succès.");
        } catch (erreur) {
            console.error("Erreur lors de la création du projet : ", erreur);
            setNotification("Erreur lors de la création du projet.");
        }
    };

    const mettreAJourEtatProjet = async (projetId: string, toutesLesTachesTerminees: boolean) => {
        const nouvelEtat = toutesLesTachesTerminees ? 'terminé' : 'en cours';

        try {
            await updateDoc(doc(db, 'projets', projetId), { etat: nouvelEtat });
            const tachesPendantes = await recupererTachesPendantes(projetId);
            setProjets(prevProjets =>
                prevProjets.map(p => p.id === projetId ? { ...p, etat: nouvelEtat, tachesPendantes } : p)
            );
        } catch (erreur) {
            console.error("Erreur lors de la mise à jour de l'état du projet : ", erreur);
            setNotification("Erreur lors de la mise à jour de l'état du projet.");
        }
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {notification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded">
                    {notification}
                    <button onClick={() => setNotification(null)} className="ml-2">✕</button>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4 text-center">Liste des Projets</h1>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Créer un nouveau projet</h2>
                <input
                    type="text"
                    value={nouveauProjet.titre}
                    onChange={(e) => setNouveauProjet({ ...nouveauProjet, titre: e.target.value })}
                    placeholder="Titre du projet"
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    value={nouveauProjet.description}
                    onChange={(e) => setNouveauProjet({ ...nouveauProjet, description: e.target.value })}
                    placeholder="Description du projet"
                    className="border p-2 mr-2"
                />
                <button onClick={ajouterProjet} className="bg-green-500 text-white p-2 rounded">Créer un projet</button>
            </div>

            <div className="space-y-4">
                {projets.map((projet) => (
                    <div
                        key={projet.id}
                        className="mb-6 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-semibold">{projet['titre-projet']}</h2>
                            <div className="flex items-center">
                                <span className={`mr-2 ${projet.etat === 'en cours' ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {projet.etat === 'en cours' 
                                        ? `en cours (${projet.tachesPendantes} tâche(s))` 
                                        : projet.etat}
                                </span>
                                <button
                                    onClick={() => editerProjet(projet)}
                                    className="text-blue-500 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200 mr-2"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => supprimerProjet(projet.id, projet['titre-projet'])}
                                    className="text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        {projetEnEdition && projetEnEdition.id === projet.id ? (
                            <div className="mb-4 space-y-2 bg-gray-100 p-4 rounded-lg shadow-md">
                                <input
                                    value={projetEnEdition['titre-projet']}
                                    onChange={(e) => setProjetEnEdition({ ...projetEnEdition, 'titre-projet': e.target.value })}
                                    className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Titre du projet"
                                />
                                <textarea
                                    value={projetEnEdition['description-projet']}
                                    onChange={(e) => setProjetEnEdition({ ...projetEnEdition, 'description-projet': e.target.value })}
                                    className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Description du projet"
                                    rows={3}
                                />
                                <button
                                    onClick={sauvegarderProjet}
                                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out flex items-center justify-center w-full"
                                >
                                    Sauvegarder
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setProjetEtendu(projetEtendu === projet.id ? null : projet.id)}
                                    className="text-blue-500 underline mt-2"
                                >
                                    {projetEtendu === projet.id ? "Masquer les détails du projet" : "Voir les détails du projet"}
                                </button>
                                {projetEtendu === projet.id && (
                                    <>
                                        <h3 className="font-semibold mt-2 mb-1">Description du projet :</h3>
                                        <p className="mb-2 p-2">{projet['description-projet']}</p>
                                        <ListTasks
                                            projetId={projet.id}
                                            mettreAJourEtatProjet={mettreAJourEtatProjet}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
