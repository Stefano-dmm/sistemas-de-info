import React from 'react';

function Login() {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Iniciar Sesión</h2>
            <form>
                <div>
                    <label>
                        Correo Electrónico:
                        <input type="email" required style={{ margin: '10px', padding: '5px' }} />
                    </label>
                </div>
                <div>
                    <label>
                        Contraseña:
                        <input type="password" required style={{ margin: '10px', padding: '5px' }} />
                    </label>
                </div>
                <button type="submit" style={{ backgroundColor: '#61dafb', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}

export default Login; 