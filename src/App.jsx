import { Routes, Route } from 'react-router-dom';
import './App.css';

import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Games from './pages/games/Games';
import GameDetails from './pages/game-details/GameDetails';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import NotFound from './pages/not-found/NotFound';

function App() {
    return (
        <Routes>
            {/* Every child route renders inside Layout's <Outlet /> */}
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="games" element={<Games />} />
                <Route path="games/:gameId" element={<GameDetails />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
