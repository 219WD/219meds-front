import React from "react";
import useAuthStore from "../../store/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faUserCheck,
  faUserTimes,
  faUserShield,
  faUserMd,
  faUserPlus,
  faUserSecret // Nuevo ícono para secretaria
} from "@fortawesome/free-solid-svg-icons";

const TablaUsuarios = ({
  users,
  onDetails,
  onTogglePartner,
  onToggleAdmin,
  onToggleSecretaria, // Nueva prop
  onConvertToEspecialista,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin;

  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Secretaria</th> {/* Reemplazado Email por Secretaria */}
          <th>Socio</th>
          <th>Admin</th>
          <th>Médico</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id} className="user-row">
            <td data-label="Nombre">{user.name}</td>
            <td data-label="Secretaria">{user.isSecretaria ? "✅" : "❌"}</td> {/* Nuevo campo */}
            <td data-label="Socio">{user.isPartner ? "✅" : "❌"}</td>
            <td data-label="Admin">{user.isAdmin ? "✅" : "❌"}</td>
            <td data-label="Médico">{user.isMedico ? "✅" : "❌"}</td>
            <td data-label="Acciones" className="actions">
              <button
                onClick={() => onDetails(user._id)}
                className="action-btn view-btn"
                title="Ver información"
              >
                <FontAwesomeIcon icon={faEye} className="icon" />
                <span>Ver</span>
              </button>
              <button
                onClick={() => onTogglePartner(user._id)}
                className={`action-btn ${
                  user.isPartner ? "revoke-btn" : "approve-btn"
                }`}
                title={user.isPartner ? "Revocar Socio" : "Aprobar Socio"}
              >
                <FontAwesomeIcon
                  icon={user.isPartner ? faUserTimes : faUserCheck}
                  className="icon"
                />
                <span>{user.isPartner ? "Revocar" : "Socio"}</span>
              </button>
              {isAdmin && onToggleAdmin && (
                <button
                  onClick={() => onToggleAdmin(user._id)}
                  className={`action-btn ${
                    user.isAdmin ? "revoke-btn" : "approve-btn"
                  }`}
                  title={user.isAdmin ? "Quitar Admin" : "Hacer Admin"}
                >
                  <FontAwesomeIcon icon={faUserShield} className="icon" />
                  <span>{user.isAdmin ? "Quitar" : "Admin"}</span>
                </button>
              )}
              {isAdmin && onToggleSecretaria && ( // Nuevo botón para secretaria
                <button
                  onClick={() => onToggleSecretaria(user._id)}
                  className={`action-btn ${
                    user.isSecretaria ? "revoke-btn" : "approve-btn"
                  }`}
                  title={user.isSecretaria ? "Quitar Secretaria" : "Hacer Secretaria"}
                >
                  <FontAwesomeIcon icon={faUserSecret} className="icon" />
                  <span>{user.isSecretaria ? "Quitar" : "Secretaria"}</span>
                </button>
              )}
              {isAdmin && onConvertToEspecialista && !user.isMedico && (
                <button
                  onClick={() => onConvertToEspecialista(user)}
                  className="action-btn approve-btn"
                  title="Crear Médico"
                >
                  <FontAwesomeIcon icon={faUserMd} className="icon" />
                  <span>Médico</span>
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TablaUsuarios;