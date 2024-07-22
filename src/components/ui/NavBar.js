import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import { logout } from '../../services/AuthService';
import { types } from '../../types/types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NavBar.css';

export default function NavBar() {
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    const navigate = useNavigate();
    const { user, dispatch, isAdmin } = useContext(AuthContext);

    const sendLogout = (e) => {
        e.preventDefault();
        navigate('/login', { replace: true });
        dispatch({ type: types.logout });
        logout();
    };

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
            <Link to="/" className="navbar-brand" aria-label="Ir al Inicio">HelpMeIUD</Link>
            
            <button 
                className="navbar-toggler" 
                type="button" 
                aria-controls="navbarNav" 
                aria-expanded={!isNavCollapsed} 
                aria-label="Toggle navigation" 
                onClick={handleNavCollapse}
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className={`collapse navbar-collapse${isNavCollapsed ? '' : ' show'}`} id="navbarNav">
                <ul className="navbar-nav ms-auto">
                    {!user ? (
                        <>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/login">Login</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/register">Registro</NavLink>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/public/map">Mapa</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/private/report">Reportar</NavLink>
                            </li>
                            {isAdmin && (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/private/delitos">Delitos</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/private/casos">Casos</NavLink>
                                    </li>
                                </>
                            )}
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/public/about">Acerca</NavLink>
                            </li>
                            <li className="nav-item dropdown">
                                <button 
                                    className="nav-link dropdown-toggle btn btn-lg btn-outline-light" 
                                    id="userDropdown" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                >
                                    {user.nombre} {/* Asegúrate de que `user.nombre` contiene el nombre del usuario */}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                    <li>
                                        <NavLink className="dropdown-item" to="/private/profile">Mi Perfil</NavLink>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item" type="button" onClick={sendLogout}>Salir</button>
                                    </li>
                                </ul>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
