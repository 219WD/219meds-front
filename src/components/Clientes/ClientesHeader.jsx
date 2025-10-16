import React from "react";

const ClientesHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters 
}) => {
  return (
    <div className="clientes-header-container">
      <div className="title-admin">
        <h1>Administrar Clientes</h1>
        <div className="search">
          <form className="form-search">
            <button type="button">
              <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <input 
              className="input-search" 
              placeholder="Buscar por nombre o email" 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button 
              className="reset" 
              type="reset" 
              onClick={() => setSearchQuery("")}
            >
              ✖
            </button>
          </form>
        </div>
      </div>

      {/* Filtros adicionales */}
      <div className="filtros-adicionales">
        <div className="filter-group">
          <label>Tipo de usuario:</label>
          <select
            value={filters.isPartner ?? ''}
            onChange={(e) => setFilters({
              ...filters, 
              isPartner: e.target.value === '' ? null : e.target.value === 'true'
            })}
          >
            <option value="">Todos</option>
            <option value="true">Socios</option>
            <option value="false">No socios</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Rol:</label>
          <select
            value={filters.isAdmin ?? ''}
            onChange={(e) => setFilters({
              ...filters, 
              isAdmin: e.target.value === '' ? null : e.target.value === 'true'
            })}
          >
            <option value="">Todos</option>
            <option value="true">Administradores</option>
            <option value="false">No administradores</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Médico:</label>
          <select
            value={filters.isMedico ?? ''}
            onChange={(e) => setFilters({
              ...filters, 
              isMedico: e.target.value === '' ? null : e.target.value === 'true'
            })}
          >
            <option value="">Todos</option>
            <option value="true">Médicos</option>
            <option value="false">No médicos</option>
          </select>
        </div>

        {/* Nuevo filtro para secretaria */}
        <div className="filter-group">
          <label>Secretaria:</label>
          <select
            value={filters.isSecretaria ?? ''}
            onChange={(e) => setFilters({
              ...filters, 
              isSecretaria: e.target.value === '' ? null : e.target.value === 'true'
            })}
          >
            <option value="">Todos</option>
            <option value="true">Secretarias</option>
            <option value="false">No secretarias</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({
              ...filters, 
              sortBy: e.target.value
            })}
          >
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguos primero</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ClientesHeader;