import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // État de chargement
    const [notification, setNotification] = useState(''); // État de notification
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Démarrer le chargement
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/ListProjects'); // Rediriger à ListProjects
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Une erreur inconnue est survenue");
            }
        } finally {
            setLoading(false); // Arrêter le chargement
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe.");
            return;
        }
        setLoading(true);
        const auth = getAuth();
        try {
            await sendPasswordResetEmail(auth, email);
            setNotification("Un e-mail de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Une erreur est survenue lors de l'envoi de l'e-mail de réinitialisation.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Connectez-vous à votre compte
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Adresse e-mail
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Mot de passe
                                </label>
                                <div className="text-sm">
                                    <button 
                                        onClick={handleForgotPassword}
                                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500">{error}</p>}
                        {notification && <p className="text-green-500">{notification}</p>}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                disabled={loading} // Désactiver le bouton pendant le chargement
                            >
                                {loading ? 'Connexion...' : 'Se connecter'} {/* Afficher le texte approprié */}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        Vous n'avez pas de compte ?{' '}
                        <Link to="Sigin" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Inscrivez-vous ici
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}

