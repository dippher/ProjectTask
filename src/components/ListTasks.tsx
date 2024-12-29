import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../auth/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { CheckIcon, CheckCircleIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tache {
    id: string;
    titre: string;
    description: string;
    'projet-id': string;
    etat: 'en cours' | 'terminé';
    ordre: number;
    assignedTo: { userId: string; email: string } | null;
}

interface User {
    id: string;
    email: string;
}

interface ListTasksProps {
    projetId: string;
    mettreAJourEtatProjet: (projetId: string, toutesLesTachesTerminees: boolean) => void;
}

export default function ListTasks({ projetId, mettreAJourEtatProjet }: ListTasksProps) {
    const [taches, setTaches] = useState<Tache[]>([]);
    const [tacheEnEdition, setTacheEnEdition] = useState<string | null>(null);
    const [nouvelleTache, setNouvelleTache] = useState<{ titre: string; description: string }>({ titre: '', description: '' });
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

    useEffect(() => {
        recupererTaches();
        recupererUtilisateurs();
    }, [projetId]);

    const recupererTaches = async () => {
        try {
            const tachesQuery = query(collection(db, 'taches'), where('projet-id', '==', projetId));
            const tachesSnapshot = await getDocs(tachesQuery);
            const listeTaches = tachesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Tache))
                .sort((a, b) => a.ordre - b.ordre);
            setTaches(listeTaches);
            verifierEtatProjet(listeTaches);
        } catch (erreur) {
            console.error("Erreur lors de la récupération des tâches : ", erreur);
        }
    };

    const recupererUtilisateurs = async () => {
        try {
            const usersQuery = query(collection(db, 'users'));
            const usersSnapshot = await getDocs(usersQuery);
            const listeUtilisateurs = usersSnapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email } as User));
            setUsers(listeUtilisateurs);
        } catch (erreur) {
            console.error("Erreur lors de la récupération des utilisateurs : ", erreur);
        }
    };

    const verifierEtatProjet = useCallback((tachesProjet: Tache[]) => {
        const toutesLesTachesTerminees = tachesProjet.every(tache => tache.etat === 'terminé');
        mettreAJourEtatProjet(projetId, toutesLesTachesTerminees);
    }, [projetId, mettreAJourEtatProjet]);

    const ajouterTache = async () => {
        try {
            const nouvellesDonneesTache = {
                titre: nouvelleTache.titre,
                description: nouvelleTache.description,
                'projet-id': projetId,
                etat: 'en cours' as const,
                ordre: taches.length,
                assignedTo: null
            };
            const docRef = await addDoc(collection(db, "taches"), nouvellesDonneesTache);
            const nouvelleTacheAvecId = { ...nouvellesDonneesTache, id: docRef.id };
            setTaches(prevTaches => [...prevTaches, nouvelleTacheAvecId]);
            setNouvelleTache({ titre: '', description: '' });
            verifierEtatProjet([...taches, nouvelleTacheAvecId]);
        } catch (erreur) {
            console.error("Erreur lors de l'ajout de la tâche : ", erreur);
        }
    };

    const toggleEditerTache = useCallback((tacheId: string) => {
        setTacheEnEdition(prevId => prevId === tacheId ? null : tacheId);
    }, []);

    const sauvegarderTache = useCallback(async (tacheId: string, nouveauTitre: string, nouvelleDescription: string) => {
        const tacheAMettreAJour = taches.find(t => t.id === tacheId);
        if (!tacheAMettreAJour) return;

        const tacheMiseAJour = { ...tacheAMettreAJour, titre: nouveauTitre, description: nouvelleDescription };

        // Actualización optimista
        setTaches(prevTaches => prevTaches.map(t => t.id === tacheId ? tacheMiseAJour : t));
        setTacheEnEdition(null);

        try {
            await updateDoc(doc(db, 'taches', tacheId), {
                titre: nouveauTitre,
                description: nouvelleDescription
            });
            verifierEtatProjet(taches.map(t => t.id === tacheId ? tacheMiseAJour : t));
        } catch (erreur) {
            console.error("Erreur lors de la mise à jour de la tâche : ", erreur);
            // Revertir en caso de error
            setTaches(prevTaches => prevTaches.map(t => t.id === tacheId ? tacheAMettreAJour : t));
        }
    }, [taches, verifierEtatProjet]);

    const basculerEtatTache = useCallback(async (tache: Tache) => {
        const nouveauEtat = tache.etat === 'en cours' ? 'terminé' : 'en cours';

        // Actualización optimista
        setTaches(prevTaches =>
            prevTaches.map(t => t.id === tache.id ? { ...t, etat: nouveauEtat } : t)
        );

        try {
            await updateDoc(doc(db, 'taches', tache.id), { etat: nouveauEtat });
            verifierEtatProjet(taches.map(t => t.id === tache.id ? { ...t, etat: nouveauEtat } : t));
        } catch (erreur) {
            console.error("Erreur lors de la mise à jour de l'état de la tâche : ", erreur);
            // Revertir en caso de error
            setTaches(prevTaches =>
                prevTaches.map(t => t.id === tache.id ? { ...t, etat: tache.etat } : t)
            );
        }
    }, [taches, verifierEtatProjet]);

    const supprimerTache = useCallback(async (tacheId: string) => {
        // Actualización optimista
        setTaches(prevTaches => prevTaches.filter(tache => tache.id !== tacheId));

        try {
            await deleteDoc(doc(db, 'taches', tacheId));
            verifierEtatProjet(taches.filter(tache => tache.id !== tacheId));
        } catch (erreur) {
            console.error("Erreur lors de la suppression de la tâche : ", erreur);
            // Revertir en caso de error
            recupererTaches();
        }
    }, [taches, verifierEtatProjet, recupererTaches]);

    const assignerTache = useCallback(async (tacheId: string, userId: string | null, userEmail: string | null) => {
        const assignedTo = userId && userEmail ? { userId, email: userEmail } : null;

        // Actualización optimista
        setTaches(prevTaches =>
            prevTaches.map(t => t.id === tacheId ? { ...t, assignedTo } : t)
        );

        try {
            await updateDoc(doc(db, 'taches', tacheId), { assignedTo });
        } catch (erreur) {
            console.error("Erreur lors de l'assignation de la tâche : ", erreur);
            // Revertir en caso de error
            setTaches(prevTaches =>
                prevTaches.map(t => t.id === tacheId ? { ...t, assignedTo: t.assignedTo } : t)
            );
        }
    }, []);

    const showUserSelectionModal = useCallback((taskId: string) => {
        setCurrentTaskId(taskId);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentTaskId(null);
    }, []);

    const handleUserSelection = useCallback((userId: string, userEmail: string) => {
        if (currentTaskId) {
            assignerTache(currentTaskId, userId, userEmail);
        }
        closeModal();
    }, [currentTaskId, assignerTache, closeModal]);

    const onDragEnd = useCallback((event: { active: any; over: any }) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setTaches((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const updatedTaches = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
                        ...item,
                        ordre: index
                    }));

                    // Mise à jour des ordres dans Firestore
                    const batch = writeBatch(db);
                    updatedTaches.forEach((tache) => {
                        const tacheRef = doc(db, 'taches', tache.id);
                        batch.update(tacheRef, { ordre: tache.ordre });
                    });

                    batch.commit().catch((erreur) => {
                        console.error("Erreur lors de la mise à jour de l'ordre des tâches : ", erreur);
                    });

                    return updatedTaches;
                }

                return items;
            });
        }
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const SortableItem = useCallback(({ tache, index }: { tache: Tache; index: number }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({ id: tache.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        const [localTitre, setLocalTitre] = useState(tache.titre);
        const [localDescription, setLocalDescription] = useState(tache.description);

        useEffect(() => {
            setLocalTitre(tache.titre);
            setLocalDescription(tache.description);
        }, [tache]);

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <div className="bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between items-center">
                    <div className="flex items-center space-x-4 flex-grow">
                        <div className="flex flex-col flex-grow">
                            {tacheEnEdition === tache.id ? (
                                <div className="space-y-2">
                                    <input
                                        value={localTitre}
                                        onChange={(e) => setLocalTitre(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                    <input
                                        value={localDescription}
                                        onChange={(e) => setLocalDescription(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                    <button 
                                        onClick={() => sauvegarderTache(tache.id, localTitre, localDescription)} 
                                        className="bg-blue-500 text-white p-2 rounded text-sm"
                                    >
                                        Sauvegarder
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium">{tache.titre}</span>
                                    <span className="text-sm text-gray-600">{tache.description}</span>
                                    <span className="text-sm text-blue-600">
                                        {tache.assignedTo ? `Assigné à ${tache.assignedTo.email}` : "Non assigné"}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {tache.assignedTo ? (
                            <button
                                onClick={() => assignerTache(tache.id, null, null)}
                                className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors duration-200"
                            >
                                Réassigner
                            </button>
                        ) : (
                            <button
                                onClick={() => showUserSelectionModal(tache.id)}
                                className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors duration-200"
                            >
                                Assigner
                            </button>
                        )}
                        <button
                            onClick={() => basculerEtatTache(tache)}
                            className={`p-1 rounded-full transition-colors duration-200 ${
                                tache.etat === 'terminé' ? 'text-green-500 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {tache.etat === 'terminé' ? (
                                <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                                <CheckIcon className="h-5 w-5" />
                            )}
                        </button>
                        <button
                            onClick={() => toggleEditerTache(tache.id)}
                            className={`p-1 rounded-full transition-colors duration-200 ${
                                tacheEnEdition === tache.id ? 'bg-blue-500 text-white' : 'text-blue-500 hover:bg-blue-100'
                            }`}
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => supprimerTache(tache.id)}
                            className="text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [tacheEnEdition, toggleEditerTache, sauvegarderTache, basculerEtatTache, supprimerTache, assignerTache, showUserSelectionModal]);

    const tachesMemoized = useMemo(() => taches.map((tache, index) => (
        <SortableItem key={tache.id} tache={tache} index={index} />
    )), [taches, SortableItem]);

    return (
        <div>
            <h3 className="font-semibold mb-4">Tâches :</h3>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={taches.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {tachesMemoized}
                    </div>
                </SortableContext>
            </DndContext>
            <div className="mt-4">
                <input
                    value={nouvelleTache.titre}
                    onChange={(e) => setNouvelleTache({ ...nouvelleTache, titre: e.target.value })}
                    placeholder="Nouvelle tâche"
                    className="border p-2 mr-2 rounded"
                />
                <input
                    value={nouvelleTache.description}
                    onChange={(e) => setNouvelleTache({ ...nouvelleTache, description: e.target.value })}
                    placeholder="Description de la tâche"
                    className="border p-2 mr-2 rounded"
                />
                <button onClick={ajouterTache} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-200">
                    Ajouter une tâche
                </button>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Sélectionner un utilisateur</h3>
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleUserSelection(user.id, user.email)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                {user.email}
                            </button>
                        ))}
                        <button onClick={closeModal} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

