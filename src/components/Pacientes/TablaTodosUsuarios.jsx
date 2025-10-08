import React from "react";

const TablaTodosUsuarios = ({ users, onCreatePaciente }) => (
  <table className="users-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Socio</th>
        <th>Admin</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user._id} className="user-row">
          <td data-label="Nombre">{user.name}</td>
          <td data-label="Email">{user.email}</td>
          <td data-label="Socio">{user.isPartner ? "✅" : "❌"}</td>
          <td data-label="Admin">{user.isAdmin ? "✅" : "❌"}</td>
          <td data-label="Acciones" className="actions">
            <button 
              onClick={() => onCreatePaciente(user)} 
              className="approve-btn"
              disabled={user.isPaciente} // Deshabilitar si ya es paciente
            >
              {user.isPaciente ? "Ya es paciente" : "Crear Paciente"}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TablaTodosUsuarios;