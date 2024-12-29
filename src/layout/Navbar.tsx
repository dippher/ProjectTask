import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo1.ico';

const navigation = [
    { name: 'Authentification', href: '/', current: false },
    { name: 'Calendrier', href: '/calendar', current: false },
    { name: 'Projects', href: '/ListProjects', current: false },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate('/'); // Rediriger vers la page de connexion
    };

    return (
        <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Ouvrir le menu principal</span>
                            <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                        </DisclosureButton>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex shrink-0 items-center">
                            <img
                                alt="Votre Entreprise"
                                src={logo}
                                className="h-11 w-auto"
                            />
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href === '/dashboard' ? '/login' : item.href} // Rediriger vers login si c'est le Dashboard
                                        aria-current={item.current ? 'page' : undefined}
                                        className={classNames(
                                            location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'rounded-md px-3 py-2 text-sm font-medium',
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {/* Removed BellIcon button */}
                        <button
                            onClick={handleLogout}
                            className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Fermer Connexion
                        </button>
                    </div>
                </div>
            </div>

            <DisclosurePanel className="sm:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation.map((item) => (
                        <DisclosureButton
                            key={item.name}
                            as={Link}
                            to={item.href === '/dashboard' ? '/login' : item.href} // Rediriger vers login si c'est le Dashboard
                            aria-current={item.current ? 'page' : undefined}
                            className={classNames(
                                location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                'block rounded-md px-3 py-2 text-base font-medium',
                            )}
                        >
                            {item.name}
                        </DisclosureButton>
                    ))}
                    <DisclosureButton
                        as={Link}
                        to="/create-project" // Lien vers le formulaire de création de projet
                        className="block rounded-md bg-blue-600 text-white px-3 py-2 text-base font-medium hover:bg-blue-700"
                    >
                        Créer Projet
                    </DisclosureButton>
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
}
