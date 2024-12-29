import { Route, Routes, useLocation } from 'react-router-dom';
import ListProjects from './components/ListProjects'; 
import Calendar from './components/Calendar';
import Navbar from './layout/Navbar';
import Login from './auth/Login';
import Sigin from './auth/Sigin';

function App() {
    const location = useLocation();
    const noNavbarRoutes = ['/', '/Sigin'];

    return (
        <>
            {!noNavbarRoutes.includes(location.pathname) && <Navbar />} {/* Rendre le Navbar seulement s'il n'est pas dans les routes spécifiées */}
            <Routes>
                <Route path="/" element={<Login />} /> {/* Composant de connexion par défaut */}
                <Route path="/Sigin" element={<Sigin />} />
                <Route path="/ListProjects" element={<ListProjects />} />
                <Route path="/Calendar" element={<Calendar />} />
            </Routes>
        </>
    );
}

export default App;