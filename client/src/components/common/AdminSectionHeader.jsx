import React from 'react';

const AdminSectionHeader = ({ title }) => {
  return (
    <div className="admin-section-header">
      <h1 className="admin-section-title">{title}</h1>
    </div>
  );
};

export default AdminSectionHeader;