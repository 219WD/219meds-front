import React from "react";
import PropTypes from "prop-types";
import useAuthStore from "../../store/authStore";

const TurnosTable = ({
  turnos,
  loading,
  onEstadoChange,
  onReprogramar,
  onVer,
}) => {
  const user = useAuthStore((state) => state.user);

  if (loading) {
    return <p>Cargando turnos...</p>;
  }

  if (turnos.length === 0) {
    return <p className="no-turnos">No hay turnos registrados</p>;
  }

  // Función para determinar si el usuario puede editar este turno
  const canEditTurno = (turno) => {
    if (!turno || !user) return false;
    if (user.isAdmin || user.isSecretaria) return true;
    if (user.isMedico) {
      const especialistaUserId =
        turno.especialistaId?.userId?._id || turno.especialistaId?.userId;
      return especialistaUserId?.toString() === user._id.toString();
    }
    return false;
  };

  // Función mejorada para obtener información del especialista
  const getEspecialistaInfo = (turno) => {
    if (!turno?.especialistaId) {
      return {
        name: "Especialista no especificado",
        especialidad: "Sin especialidad",
      };
    }
    // Caso 1: Cuando el especialista está completamente poblado
    if (turno.especialistaId?.userId?.name) {
      return {
        name: turno.especialistaId.userId.name,
        especialidad: turno.especialistaId.especialidad || "Sin especialidad",
      };
    }
    // Caso 2: Cuando el populate solo trajo el nombre directo
    if (turno.especialistaId?.name) {
      return {
        name: turno.especialistaId.name,
        especialidad: turno.especialistaId.especialidad || "Sin especialidad",
      };
    }
    // Caso 3: Cuando solo tenemos el ID
    return {
      name: "Especialista no especificado",
      especialidad: turno.especialistaId.especialidad || "Sin especialidad",
    };
  };

  return (
    <table className="turnos-table">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Especialista</th>
          <th>Fecha</th>
          <th>Motivo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {turnos.map((turno) => {
          const editable = canEditTurno(turno);
          const especialistaInfo = getEspecialistaInfo(turno);

          return (
            <tr
              key={turno._id}
              className={`turno-row ${turno.estado || "pendiente"}`}
            >
              <td data-label="Paciente">
                {turno.pacienteId?.fullName || "Paciente no especificado"}
              </td>
              <td data-label="Especialista">
                {especialistaInfo.name}
                {especialistaInfo.especialidad &&
                  ` (${especialistaInfo.especialidad})`}
              </td>
              <td data-label="Fecha y Hora">
                {new Date(turno.fecha).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC", // ✅ Forzar mostrar la hora como fue almacenada
                })}
              </td>
              <td data-label="Motivo">{turno.motivo || "Sin motivo especificado"}</td>
              <td data-label="Estado">
                <span className={`status-badge ${turno.estado || "pendiente"}`}>
                  {turno.estado || "Pendiente"}
                </span>
              </td>
              <td data-label="Acciones" className="acciones-turno">
                {editable ? (
                  <>
                    <button
                      className="btn-ver"
                      onClick={() => onVer(turno)}
                      title="Ver detalles del turno"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <select
                      value={turno.estado || "pendiente"}
                      onChange={(e) =>
                        onEstadoChange(turno._id, e.target.value)
                      }
                      className="estado-select"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="completado">Completado</option>
                    </select>
                    <button
                      onClick={() => onReprogramar(turno)}
                      className="btn-reprogramar"
                    >
                      Reprogramar
                    </button>
                  </>
                ) : (
                  <span className="sin-permiso">Solo lectura</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

TurnosTable.propTypes = {
  turnos: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      pacienteId: PropTypes.shape({
        fullName: PropTypes.string,
      }),
      especialistaId: PropTypes.shape({
        userId: PropTypes.oneOfType([
          PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
          }),
          PropTypes.string,
        ]),
        name: PropTypes.string,
        especialidad: PropTypes.string,
      }),
      fecha: PropTypes.string,
      motivo: PropTypes.string,
      estado: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onEstadoChange: PropTypes.func.isRequired,
  onReprogramar: PropTypes.func.isRequired,
};

export default TurnosTable;
