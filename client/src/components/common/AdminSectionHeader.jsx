import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { routes } from '../../utils/routes';

const AdminSectionHeader = ({ title, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-section-header">
      <h1 className="admin-section-title">{title}</h1>
      <button className="cta-btn" onClick={onBack}>
        <FaArrowLeft style={{ marginRight: '0.5rem' }} />
        Volver al Dashboard
      </button>

    </div>
  );
};

export default AdminSectionHeader;
