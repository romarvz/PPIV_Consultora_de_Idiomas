// /client/src/components/TestMock.jsx
// Componente temporal para verificar que el mock funciona

import React, { useState, useEffect } from 'react'
import apiAdapter from '../services/apiAdapter'

const TestMock = () => {
  const [testResults, setTestResults] = useState({
    imports: 'Verificando...',
    classes: 'Verificando...',
    payments: 'Verificando...',
    reports: 'Verificando...',
    create: 'Verificando...',
    storage: 'Verificando...'
  })
  const [details, setDetails] = useState({})

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const results = {}
    const detailsData = {}

    // ===== TEST 1: Verificar Imports =====
    try {
      if (apiAdapter && apiAdapter.classes && apiAdapter.payments) {
        results.imports = 'Imports correctos'
        detailsData.imports = 'apiAdapter cargado exitosamente'
      } else {
        results.imports = 'Imports fallaron'
        detailsData.imports = 'apiAdapter no tiene la estructura esperada'
      }
    } catch (error) {
      results.imports = 'Error: ' + error.message
      detailsData.imports = error.toString()
    }

    // ===== TEST 2: Obtener Clases =====
    try {
      const response = await apiAdapter.classes.getAll({ limit: 3 })
      
      if (response.data.success && response.data.data.classes) {
        results.classes = `✅ ${response.data.data.classes.length} clases obtenidas`
        detailsData.classes = response.data.data.classes
      } else {
        results.classes = '❌ Respuesta inválida'
        detailsData.classes = response
      }
    } catch (error) {
      results.classes = '❌ Error: ' + error.message
      detailsData.classes = error.toString()
    }

    // ===== TEST 3: Obtener Pagos =====
    try {
      const response = await apiAdapter.payments.getAll({ limit: 3 })
      
      if (response.data.success && response.data.data.payments) {
        results.payments = `✅ ${response.data.data.payments.length} pagos obtenidos`
        detailsData.payments = response.data.data.payments
      } else {
        results.payments = '❌ Respuesta inválida'
        detailsData.payments = response
      }
    } catch (error) {
      results.payments = '❌ Error: ' + error.message
      detailsData.payments = error.toString()
    }

    // ===== TEST 4: Obtener Reporte Académico =====
    try {
      const response = await apiAdapter.reports.academic()
      
      if (response.data.success && response.data.data.students) {
        results.reports = `Reporte con ${response.data.data.students.length} estudiantes`
        detailsData.reports = response.data.data
      } else {
        results.reports = 'Respuesta inválida'
        detailsData.reports = response
      }
    } catch (error) {
      results.reports = '❌ Error: ' + error.message
      detailsData.reports = error.toString()
    }

    // ===== TEST 5: Crear Nueva Clase =====
    try {
      const response = await apiAdapter.classes.create({
        studentId: 'mock-student-1',
        teacherId: 'mock-teacher-1',
        subject: 'Inglés TEST',
        date: '2025-10-30',
        time: '10:00',
        duration: 60
      })
      
      if (response.data.success && response.data.data._id) {
        results.create = '✅ Clase creada exitosamente'
        detailsData.create = response.data.data
      } else {
        results.create = '❌ Creación falló'
        detailsData.create = response
      }
    } catch (error) {
      results.create = '❌ Error: ' + error.message
      detailsData.create = error.toString()
    }

    // ===== TEST 6: Verificar Storage =====
    try {
      const state = apiAdapter.utils.getStorageState()
      
      if (state && state.classesCount > 0) {
        results.storage = `Storage: ${state.classesCount} clases, ${state.paymentsCount} pagos`
        detailsData.storage = state
      } else {
        results.storage = 'Storage vacío o inválido'
        detailsData.storage = state
      }
    } catch (error) {
      results.storage = '❌ Error: ' + error.message
      detailsData.storage = error.toString()
    }

    setTestResults(results)
    setDetails(detailsData)
  }

  const resetMock = () => {
    try {
      const result = apiAdapter.utils.resetMockData()
      alert(result.message || 'Datos reseteados')
      runTests() // Volver a correr tests
    } catch (error) {
      alert('Error al resetear: ' + error.message)
    }
  }

  const allTestsPassed = Object.values(testResults).every(r => r.startsWith('✅'))

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '1rem',
        color: allTestsPassed ? '#27ae60' : '#e74c3c'
      }}>
        Test del Mock API
      </h1>

      <div style={{ 
        background: allTestsPassed ? '#d4edda' : '#f8d7da',
        border: `2px solid ${allTestsPassed ? '#c3e6cb' : '#f5c6cb'}`,
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        {allTestsPassed ? 'TODOS LOS TESTS PASARON' : 'ALGUNOS TESTS FALLARON'}
      </div>

      {/* Resultados de Tests */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Resultados:</h2>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} style={{ 
              padding: '0.5rem 0',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <strong>{key}:</strong>
              <span>{result}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detalles */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Detalles (consola del navegador):</h2>
        <button
          onClick={() => {
            console.log('=== DETALLES DE LOS TESTS ===')
            console.log('Results:', testResults)
            console.log('Details:', details)
            console.log('============================')
            alert('Revisa la consola del navegador (F12)')
          }}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Ver Detalles en Consola
        </button>
      </div>

      {/* Acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginTop: '2rem',
        borderTop: '2px solid #dee2e6',
        paddingTop: '1rem'
      }}>
        <button
          onClick={runTests}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            flex: 1
          }}
        >
          Volver a Ejecutar Tests
        </button>

        <button
          onClick={resetMock}
          style={{
            background: '#ffc107',
            color: '#212529',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            flex: 1
          }}
        >
          Resetear Datos Mock
        </button>
      </div>

      {/* Modo Mock */}
      <div style={{ 
        marginTop: '2rem',
        background: '#fff3cd',
        border: '1px solid #ffeeba',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <strong>Modo Mock:</strong> {apiAdapter.utils.isUsingMock() ? 'ACTIVO' : 'DESACTIVADO'}
        <br />
        <small>Para cambiar, edita USE_MOCK en /services/apiAdapter.js</small>
      </div>
    </div>
  )
}

export default TestMock