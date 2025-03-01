import React, { useState } from 'react';
import Login from './Login';
import Rutas from './Rutas';

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'login':
                return <Login />;
            case 'rutas':
                return <Rutas />;
            case 'home':
            default:
                return (
                    <main>
                        <p>Esta es una página de ejemplo creada con React.</p>
                        <p>Aquí puedes incluir información sobre ti o tu proyecto.</p>
                        <button onClick={() => alert('¡Hola!')}>Haz clic aquí</button>
                    </main>
                );
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <header>
                <nav style={{ backgroundColor: '#282c34', padding: '10px' }}>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li style={{ display: 'inline', margin: '0 15px' }}>
                            <button onClick={() => setCurrentPage('home')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                Inicio
                            </button>
                        </li>
                        <li style={{ display: 'inline', margin: '0 15px' }}>
                            <button onClick={() => setCurrentPage('rutas')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                Rutas
                            </button>
                        </li>
                        <li style={{ display: 'inline', margin: '0 15px' }}>
                            <span style={{ color: 'white', textDecoration: 'none' }}>Acerca de</span>
                        </li>
                        <li style={{ display: 'inline', margin: '0 15px' }}>
                            <span style={{ color: 'white', textDecoration: 'none' }}>Contacto</span>
                        </li>
                        <li style={{ display: 'inline', margin: '0 15px' }}>
                            <button onClick={() => setCurrentPage('login')} style={{ backgroundColor: '#61dafb', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                                Iniciar Sesión
                            </button>
                        </li>
                    </ul>
                </nav>
                <h1>Bienvenido a Mi Página de Presentación</h1>
            </header>
            {renderPage()}
            <footer>
                <p>&copy; 2023 Mi Nombre</p>
            </footer>
        </div>
    );
}

export default App;
