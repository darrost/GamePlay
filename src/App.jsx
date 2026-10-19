import { Routes, Route } from 'react-router-dom';
import './App.css';

import Layout from './components/layout/Layout';
import GuestOnlyRoute from './components/guards/GuestOnlyRoute';
import PrivateRoute from './components/guards/PrivateRoute';
import CreateGame from './pages/create-game/CreateGame';
import Home from './pages/home/Home';
import Games from './pages/games/Games';
import GameDetails from './pages/game-details/GameDetails';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import NotFound from './pages/not-found/NotFound';

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="games" element={<Games />} />
                <Route path="games/:gameId" element={<GameDetails />} />
                <Route element={<PrivateRoute />}>
                    <Route path="games/create" element={<CreateGame />} />
                </Route>
                <Route element={<GuestOnlyRoute />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
