import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const SystemOverviewCharts = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  // Calm blue-based minimalist color palette
  const colors = {
    primary: '#4A90E2',     // Soft blue
    secondary: '#7B68EE',   // Medium slate blue
    success: '#5DADE2',     // Light blue
    warning: '#85C1E9',     // Pale blue
    danger: '#AED6F1',      // Very light blue
    info: '#3498DB',        // Bright blue
    purple: '#9B59B6',      // Muted purple
    pink: '#BB8FCE'         // Soft lavender
  };

  // Data for Students Chart (Pie Chart)
  const studentsData = [
    { name: 'Activos', value: stats.activeStudents, color: colors.success },
    { name: 'Inactivos', value: stats.totalStudents - stats.activeStudents, color: colors.warning }
  ];

  // Data for Teachers Chart (Bar Chart)
  const teachersData = [
    { name: 'Activos', value: stats.activeTeachers, fill: colors.primary },
    { name: 'Inactivos', value: stats.totalTeachers - stats.activeTeachers, fill: colors.info }
  ];

  // Data for Specialties Chart (Bar Chart)
  const specialtiesData = stats.teacherSpecialties.slice(0, 5).map((specialty, index) => ({
    name: specialty,
    fullName: specialty,
    value: Math.floor(Math.random() * 8) + 2,
    fill: [colors.secondary, colors.purple, colors.info, colors.pink, colors.success][index % 5]
  }));

  // Data for Revenue Chart (Line Chart)
  const revenueData = [
    { month: 'Ene', revenue: 15000, target: 20000 },
    { month: 'Feb', revenue: 18000, target: 20000 },
    { month: 'Mar', revenue: 22000, target: 20000 },
    { month: 'Abr', revenue: 19000, target: 22000 },
    { month: 'May', revenue: 25000, target: 22000 },
    { month: 'Jun', revenue: stats.monthlyRevenue || 28000, target: 25000 }
  ];

  // Custom tooltip components with enhanced information
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / stats.totalStudents) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-dot" style={{ backgroundColor: data.payload.color }}></span>
            <span className="tooltip-label">{data.name}</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-key">Cantidad:</span>
              <span className="tooltip-value">{data.value} estudiantes</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-key">Porcentaje:</span>
              <span className="tooltip-value">{percentage}% del total</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / stats.totalTeachers) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-dot" style={{ backgroundColor: payload[0].fill }}></span>
            <span className="tooltip-label">Profesores {label}</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-key">Cantidad:</span>
              <span className="tooltip-value">{payload[0].value} profesores</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-key">Porcentaje:</span>
              <span className="tooltip-value">{percentage}% del total</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomSpecialtyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalSpecialtyTeachers = specialtiesData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / totalSpecialtyTeachers) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-dot" style={{ backgroundColor: payload[0].fill }}></span>
            <span className="tooltip-label">{label}</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-key">Profesores:</span>
              <span className="tooltip-value">{payload[0].value}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-key">Participación:</span>
              <span className="tooltip-value">{percentage}% del top 5</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const revenue = payload[0]?.value || 0;
      const target = payload[1]?.value || 0;
      const achievement = target > 0 ? ((revenue / target) * 100).toFixed(1) : 0;
      const difference = revenue - target;
      
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-label">{label} 2024</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-dot" style={{ backgroundColor: colors.success }}></span>
              <span className="tooltip-key">Ingresos:</span>
              <span className="tooltip-value">${revenue.toLocaleString()}</span>
            </div>
            {payload[1] && (
              <>
                <div className="tooltip-row">
                  <span className="tooltip-dot" style={{ backgroundColor: colors.warning }}></span>
                  <span className="tooltip-key">Meta:</span>
                  <span className="tooltip-value">${target.toLocaleString()}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-key">Logro:</span>
                  <span className={`tooltip-value ${difference >= 0 ? 'positive' : 'negative'}`}>
                    {achievement}% ({difference >= 0 ? '+' : ''}${difference.toLocaleString()})
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section__title">Overview del Sistema</h3>
      
      <div className="charts-grid">
        {/* Students Distribution Chart */}
        <div className="chart-card">
          <h4 className="chart-title">Estudiantes</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={studentsData}
                cx="50%"
                cy="40%"
                innerRadius={35}
                outerRadius={65}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {studentsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }} allowEscapeViewBox={{ x: false, y: false }} />
              <Legend 
                verticalAlign="bottom" 
                height={24}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <span className="chart-total">{stats.totalStudents}</span>
            <span className="chart-detail">Total Estudiantes</span>
          </div>
        </div>

        {/* Teachers Chart */}
        <div className="chart-card">
          <h4 className="chart-title">Profesores</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teachersData} margin={{ top: 20, right: 10, left: 10  , bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
                tickLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(74, 144, 226, 0.1)' }} wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }} allowEscapeViewBox={{ x: false, y: false }} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                stroke="#fff"
                strokeWidth={1}
                maxBarSize={80}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <span className="chart-total">{stats.totalTeachers}</span>
            <span className="chart-detail">Total Profesores</span>
          </div>
        </div>

        {/* Specialties Chart */}
        <div className="chart-card">
          <h4 className="chart-title">Top Especialidades</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart 
              data={specialtiesData} 
              margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip content={<CustomSpecialtyTooltip />} cursor={{ fill: 'rgba(123, 104, 238, 0.1)' }} wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }} allowEscapeViewBox={{ x: false, y: false }} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                stroke="#fff"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <span className="chart-total">{stats.uniqueSpecialties}</span>
            <span className="chart-detail">Especialidades Activas</span>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="chart-card">
          <h4 className="chart-title">Tendencia de Ingresos</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
                tickFormatter={(value) => `$${(value/1000)}k`}
              />
              <Tooltip content={<CustomLineTooltip />} wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }} allowEscapeViewBox={{ x: false, y: false }} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={colors.success} 
                strokeWidth={3}
                dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.success, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={colors.warning} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <span className="chart-total">${stats.monthlyRevenue.toLocaleString()}</span>
            <span className="chart-detail">Octubre 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverviewCharts;