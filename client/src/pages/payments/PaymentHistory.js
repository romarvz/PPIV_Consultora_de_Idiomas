import React, { useState, useEffect } from 'react';
import { consultarPagosEstudiante, consultarCobrosAdministrador } from '../../services/financial/financialServices';

// ==============================================================================
// MOCK DE AUTENTICACIÓN (REEMPLAZAR CON useAuth.jsx)
// Para simular la funcionalidad:
// - Para probar como Estudiante (CU-COB-02):
// const mockAuth = { userRole: 'Estudiante', estudianteId: 'est001' }; 
// - Para probar como Administrador (CU-COB-03):
const mockAuth = { userRole: 'Administrador', estudianteId: null }; 
// ==============================================================================

const PaymentHistory = () => {
    // Aquí es donde en una app real usarías const { userRole, userId } = useAuth();
    const { userRole, estudianteId } = mockAuth; 

    const [historial, setHistorial] = useState([]);
    const [mensaje, setMensaje] = useState('Cargando historial...');
    
    // Define qué función usar y qué datos mostrar basándose en el rol
    const titulo = userRole === 'Estudiante' ? 'Mi Historial de Pagos (CU-COB-02)' : 'Historial de Cobros de Estudiantes (CU-COB-03)';
    const funcionConsulta = userRole === 'Estudiante' ? consultarPagosEstudiante : consultarCobrosAdministrador;
    const idConsulta = userRole === 'Estudiante' ? estudianteId : null;

    useEffect(() => {
        // Lógica de carga de datos al iniciar el componente
        const resultado = funcionConsulta(idConsulta);
        setHistorial(resultado.data);
        setMensaje(resultado.mensaje);
    }, [userRole, idConsulta, funcionConsulta]); 

    const headers = userRole === 'Estudiante' 
        ? ['Fecha', 'Concepto', 'Monto', 'Estado'] 
        : ['Fecha', 'Estudiante', 'Concepto', 'Monto', 'Estado', 'Vencimiento']; 

    return (
        <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>{titulo}</h2>

            {/* Muestra mensaje si no hay registros (Flujo Alternativo A1) */}
            {historial.length === 0 && <p style={{ color: 'gray', fontWeight: 'bold', padding: '10px', background: '#fff3cd', border: '1px solid #ffeeba' }}>{mensaje}</p>}

            {historial.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '0.9em' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e9ecef' }}>
                            {headers.map(h => <th key={h} style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'left' }}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {historial.map((item) => (
                            <tr key={item.id}>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.fecha}</td>
                                {/* Columna Estudiante solo visible para el Administrador */}
                                {userRole === 'Administrador' && (
                                    <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>{item.nombreEstudiante}</td>
                                )}
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.concepto}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>${item.monto.toLocaleString('es-AR')}</td>
                                {/* Columna Estado con color dinámico */}
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold', color: item.estado === 'Pagado' ? '#28a745' : (item.estado === 'Vencido' ? '#dc3545' : '#ffc107') }}>
                                    {item.estado}
                                </td>
                                {/* Columna Vencimiento solo visible para el Administrador */}
                                {userRole === 'Administrador' && (
                                     <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.vencimiento || 'N/A'}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <p style={{ marginTop: '20px', fontSize: '0.8em', color: '#6c757d' }}>*La columna de Vencimiento es solo visible para el Administrador.</p>
        </div>
    );
};

export default PaymentHistory;