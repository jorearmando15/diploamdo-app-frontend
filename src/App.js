import React from 'react';
import AuthProvider from './auth/AuthProvider';
import AppRouter from './routers/AppRouter';
import 'bootstrap/dist/css/bootstrap.min.css'; // Asegúrate de que la ruta es correcta
  

function App() {

  return (
    <AuthProvider >
      <AppRouter/>
    </AuthProvider>
  );
}

export default App;
