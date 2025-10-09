import React, { useEffect, useState, useCallback } from "react";
import useAuthStore from "../store/authStore";
import NavDashboard from "../components/NavDashboard";
import useNotify from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import "./css/TurnosPaciente.css";
import API_URL from "../common/constants";
import VerTurnoPacienteModal from "./VerTurnoPacienteModal";

const TurnosPaciente = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const notify = useNotify();

  const [turnos, setTurnos] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNuevoTurnoModal, setShowNuevoTurnoModal] = useState(false);
  const [showEditarTurnoModal, setShowEditarTurnoModal] = useState(false);
  const [turnoAEditar, setTurnoAEditar] = useState(null);
  const [showVerTurnoModal, setShowVerTurnoModal] = useState(false);
  const [turnoAVer, setTurnoAVer] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "todos",
    dateOrder: "desc",
    dateFrom: "",
    dateTo: "",
  });

  const fetchTurnosPaciente = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/turnos/mis-datos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al obtener turnos");
      }

      const result = await response.json();
      const turnosData = result.data || result;

      if (!Array.isArray(turnosData)) {
        throw new Error("Formato de datos inválido recibido del servidor");
      }

      const processedTurnos = turnosData.map((turno) => ({
        ...turno,
        fecha: new Date(turno.fecha),
        especialistaNombre: turno.especialistaId?.userId?.name || "No asignado",
        especialidad: turno.especialistaId?.especialidad || "No especificada",
      }));

      setTurnos(processedTurnos);
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");

      if (
        err.message.includes("Token") ||
        err.message.includes("No autorizado")
      ) {
        useAuthStore.getState().logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [token, notify, navigate]);

  const fetchEspecialistas = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/especialistas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        throw new Error("Token inválido o expirado");
      }

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al obtener especialistas");

      setEspecialistas(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error al obtener especialistas:", err.message);
      if (err.message.includes("Token")) {
        useAuthStore.getState().logout();
        navigate("/login");
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      notify("Debes iniciar sesión para acceder a esta página", "error");
      navigate("/login");
      return;
    }

    if (user && user.isPaciente) {
      const loadData = async () => {
        try {
          await Promise.all([fetchTurnosPaciente(), fetchEspecialistas()]);
        } catch (error) {
          console.error("Error al cargar datos:", error);
          notify("Error al cargar los datos del paciente", "error");
        }
      };

      loadData();
    }
  }, [token, user?.isPaciente]);

  const handleCancelarTurno = async (turnoId) => {
    try {
      const response = await fetch(
        `${API_URL}/turnos/paciente/${turnoId}/cancelar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Error al cancelar turno"
        );
      }

      notify(result.message || "Turno cancelado exitosamente", "success");
      fetchTurnosPaciente();
    } catch (err) {
      console.error("Error al cancelar turno:", err);
      notify(err.message, "error");
    }
  };

  const handleCrearTurno = async (nuevoTurno) => {
    try {
      setLoading(true);

      // Validaciones básicas
      if (
        !nuevoTurno.fecha ||
        !nuevoTurno.motivo ||
        !nuevoTurno.especialistaId
      ) {
        throw new Error("Todos los campos obligatorios deben completarse");
      }

      // Validar que la fecha sea futura
      const fechaTurno = new Date(nuevoTurno.fecha);
      if (fechaTurno <= new Date()) {
        throw new Error("La fecha del turno debe ser futura");
      }

      // Crear el turno directamente (el middleware isPacienteWithProfile ya verifica el perfil)
      const response = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nuevoTurno,
          userId: user._id, // El backend obtendrá el pacienteId del perfil asociado
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Error al crear turno"
        );
      }

      notify("Turno creado exitosamente", "success");
      setShowNuevoTurnoModal(false);
      await fetchTurnosPaciente(); // Actualizar la lista de turnos
    } catch (err) {
      console.error("Error al crear turno:", err);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarTurno = async (turnoId, turnoActualizado) => {
    try {
      const response = await fetch(`${API_URL}/turnos/paciente/${turnoId}`, {
        method: "PUT", // Asegurarse que es PUT
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(turnoActualizado),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Error al editar turno");
        } catch {
          throw new Error(errorText || "Error al editar turno");
        }
      }

      const result = await response.json();
      notify("Turno actualizado exitosamente", "success");
      setShowEditarTurnoModal(false);
      fetchTurnosPaciente();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const filteredTurnos = turnos
    .filter((turno) => {
      const matchesSearch =
        (turno.motivo?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (turno.especialistaId?.userId?.name?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (turno.especialistaId?.especialidad?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        );

      const matchesStatus =
        filters.status === "todos" || turno.estado === filters.status;

      const fechaTurno = new Date(turno.fecha);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo
        ? new Date(filters.dateTo + "T23:59:59")
        : null;

      const matchesDate =
        (!fromDate || fechaTurno >= fromDate) &&
        (!toDate || fechaTurno <= toDate);

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      return filters.dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const getStatusClass = (status) => {
    const statusClasses = {
      pendiente: "status-pending",
      confirmado: "status-approved",
      cancelado: "status-rejected",
      completado: "status-completed",
    };
    return statusClasses[status] || "";
  };

  const toLocalDateTimeString = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");
    const local = new Date(date);
    const year = local.getFullYear();
    const month = pad(local.getMonth() + 1);
    const day = pad(local.getDate());
    const hours = pad(local.getHours());
    const minutes = pad(local.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!user) {
    return (
      <div className="turnos-paciente-panel">
        <NavDashboard />
        <div className="loading-container">
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user.isPaciente) {
    return (
      <div className="turnos-paciente-panel">
        <NavDashboard />
        <div className="turnos-paciente-container">
          <div className="access-denied">
            <h2>Acceso restringido</h2>
            <p>Esta sección es solo para pacientes registrados.</p>
            <p>
              Tu rol actual es:
              {user.isAdmin ? " Administrador" : ""}
              {user.isPartner ? " Partner" : ""}
              {!user.isAdmin && !user.isPartner && !user.isPaciente
                ? " Usuario básico"
                : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="turnos-paciente-panel">
      <NavDashboard />
      <div className="turnos-paciente-container">
        <div className="title-paciente">
          <h1>Mis Turnos</h1>
          <button
            onClick={() => setShowNuevoTurnoModal(true)}
            className="add-btn"
          >
            Nuevo Turno
          </button>
        </div>

        <div className="filtros-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por motivo o especialista..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input-search"
            />
          </div>

          <div className="status-filter">
            <label>Estado:</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmado">Confirmados</option>
              <option value="cancelado">Cancelados</option>
              <option value="completado">Completados</option>
            </select>
          </div>

          <div className="status-filter">
            <label>Orden:</label>
            <select
              value={filters.dateOrder}
              onChange={(e) =>
                setFilters({ ...filters, dateOrder: e.target.value })
              }
            >
              <option value="desc">Más recientes</option>
              <option value="asc">Más antiguos</option>
            </select>
          </div>

          <div className="status-filter">
            <label>Desde:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>

          <div className="status-filter">
            <label>Hasta:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <p>Cargando turnos...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : filteredTurnos.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron turnos que coincidan con los filtros</p>
            </div>
          ) : (
            <table className="turnos-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Especialista</th>
                  <th>Especialidad</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTurnos.map((turno) => (
                  <tr key={turno._id}>
                    <td data-label="Fecha y Hora">{new Date(turno.fecha).toLocaleString()}</td>
                    <td data-label="Especialista">
                      {turno.especialistaId?.userId?.name || "No asignado"}
                    </td>
                    <td data-label="Especialidad">
                      {turno.especialistaId?.especialidad || "No especificada"}
                    </td>
                    <td data-label="Motivo">{turno.motivo}</td>
                    <td data-label="Estado">
                      <span
                        className={`status-badge ${getStatusClass(
                          turno.estado
                        )}`}
                      >
                        {turno.estado}
                      </span>
                    </td>
                    <td data-label="Acciones" className="actions-cell">
                      <button
                        className="btn-ver-paciente"
                        onClick={() => {
                          setTurnoAVer(turno);
                          setShowVerTurnoModal(true);
                        }}
                        title="Ver detalles de la consulta"
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
                      {turno.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => {
                              setTurnoAEditar(turno);
                              setShowEditarTurnoModal(true);
                            }}
                            className="edit-btn"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleCancelarTurno(turno._id)}
                            className="cancel-btn"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showNuevoTurnoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowNuevoTurnoModal(false)}
            >
              &times;
            </button>
            <h3>Nuevo Turno</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const fecha = formData.get("fecha");

                // Validar fecha futura
                if (new Date(fecha) <= new Date()) {
                  notify("La fecha del turno debe ser futura", "error");
                  return;
                }

                const nuevoTurno = {
                  fecha: formData.get("fecha"),
                  motivo: formData.get("motivo"),
                  reprocannRelacionado:
                    formData.get("reprocannRelacionado") === "on",
                  especialistaId: formData.get("especialistaId"),
                };

                handleCrearTurno(nuevoTurno);
              }}
            >
              <div className="form-group">
                <label>Especialista:</label>
                <select name="especialistaId" required>
                  <option value="">Seleccionar especialista</option>
                  {especialistas.map((especialista) => (
                    <option key={especialista._id} value={especialista._id}>
                      {especialista.especialidad} - {especialista.userId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha y Hora:</label>
                <input type="datetime-local" name="fecha" required />
              </div>

              <div className="form-group">
                <label>Motivo:</label>
                <input type="text" name="motivo" required />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="reprocannRelacionado" />
                  Relacionado a Reprocann
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNuevoTurnoModal(false)}
                  className="close-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="approve-btn">
                  Crear Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditarTurnoModal && turnoAEditar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowEditarTurnoModal(false)}
            >
              &times;
            </button>
            <h3>Editar Turno</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const turnoActualizado = {
                  fecha: formData.get("fecha"),
                  motivo: formData.get("motivo"),
                };
                handleEditarTurno(turnoAEditar._id, turnoActualizado);
              }}
            >
              <div className="form-group">
                <label>Especialista:</label>
                <select
                  name="especialistaId"
                  defaultValue={turnoAEditar.especialistaId?._id}
                  required
                  disabled
                >
                  <option value="">Seleccionar especialista</option>
                  {especialistas.map((especialista) => (
                    <option key={especialista._id} value={especialista._id}>
                      {especialista.especialidad} - {especialista.userId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha y Hora:</label>
                <input
                  type="datetime-local"
                  name="fecha"
                  defaultValue={toLocalDateTimeString(turnoAEditar.fecha)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Motivo:</label>
                <input
                  type="text"
                  name="motivo"
                  defaultValue={turnoAEditar.motivo}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditarTurnoModal(false)}
                  className="close-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="approve-btn">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showVerTurnoModal && turnoAVer && (
        <VerTurnoPacienteModal
          turno={turnoAVer}
          onClose={() => setShowVerTurnoModal(false)}
        />
      )}
    </div>
  );
};

export default TurnosPaciente;
