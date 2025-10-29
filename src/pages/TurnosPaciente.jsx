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

      if (
        !nuevoTurno.fecha ||
        !nuevoTurno.motivo ||
        !nuevoTurno.especialistaId
      ) {
        throw new Error("Todos los campos obligatorios deben completarse");
      }

      // ✅ SOLUCIÓN: Agregar la zona horaria manualmente
      const fechaTurno = new Date(nuevoTurno.fecha);

      if (isNaN(fechaTurno.getTime())) {
        throw new Error("La fecha seleccionada no es válida");
      }

      const ahora = new Date();
      if (fechaTurno <= ahora) {
        throw new Error("La fecha y hora deben ser futuras");
      }

      // ✅ CORRECCIÓN DEFINITIVA: Convertir a UTC manualmente
      const fechaParaBackend = new Date(
        fechaTurno.getTime() - fechaTurno.getTimezoneOffset() * 60000
      ).toISOString();

      console.log("📅 Fecha enviada al backend:", {
        fechaInput: nuevoTurno.fecha,
        fechaEnviada: fechaParaBackend,
        horaLocal: fechaTurno.toLocaleString("es-ES"),
        timezoneOffset: fechaTurno.getTimezoneOffset(),
      });

      const response = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          especialistaId: nuevoTurno.especialistaId,
          fecha: fechaParaBackend, // ← Ahora enviamos en UTC
          motivo: nuevoTurno.motivo,
          reprocannRelacionado: nuevoTurno.reprocannRelacionado || false,
          notas: nuevoTurno.notas || "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result.error &&
          result.error.includes("ya tiene un turno asignado")
        ) {
          throw new Error(
            "El especialista ya tiene un turno en ese horario. Por favor, elige otro horario."
          );
        }
        if (
          result.error &&
          result.error.includes("fecha del turno debe ser futura")
        ) {
          throw new Error("El turno debe ser para una fecha y hora futuras.");
        }
        throw new Error(
          result.error || result.message || "Error al crear turno"
        );
      }

      notify("Turno creado exitosamente", "success");
      setShowNuevoTurnoModal(false);
      await fetchTurnosPaciente();
    } catch (err) {
      console.error("❌ Error al crear turno:", err);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarTurno = async (turnoId, turnoActualizado) => {
    try {
      // ✅ CORRECCIÓN: Convertir la fecha a UTC antes de enviar
      const fechaTurno = new Date(turnoActualizado.fecha);
      const fechaParaBackend = new Date(
        fechaTurno.getTime() - fechaTurno.getTimezoneOffset() * 60000
      ).toISOString();

      const turnoData = {
        ...turnoActualizado,
        fecha: fechaParaBackend, // ← Enviar en formato UTC
      };

      const response = await fetch(`${API_URL}/turnos/paciente/${turnoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(turnoData),
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

      await response.json();
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
    const local = new Date(date);

    // ✅ CORRECCIÓN: Ajustar por la diferencia de zona horaria
    // Sumar el offset para convertir UTC a local
    const timezoneOffset = local.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(local.getTime() + timezoneOffset);

    return adjustedDate.toISOString().slice(0, 16);
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

        {/* Filtros */}
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

        {/* Tabla */}
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
                    <td data-label="Fecha y Hora">
                      {new Date(turno.fecha).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC", // Forzar mostrar la hora como está en la DB
                      })}
                    </td>
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
                        👁
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

      {/* MODAL CREAR */}
      {/* MODAL CREAR */}
      {showNuevoTurnoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowNuevoTurnoModal(false)}
              disabled={loading}
            >
              &times;
            </button>
            <h3>Nuevo Turno</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                // Validación básica frontend
                const fecha = formData.get("fecha");
                const motivo = formData.get("motivo");
                const especialistaId = formData.get("especialistaId");

                if (!fecha || !motivo || !especialistaId) {
                  notify(
                    "Todos los campos obligatorios deben completarse",
                    "error"
                  );
                  return;
                }

                if (new Date(fecha) <= new Date()) {
                  notify("La fecha del turno debe ser futura", "error");
                  return;
                }

                const nuevoTurno = {
                  fecha: fecha,
                  motivo: motivo,
                  reprocannRelacionado:
                    formData.get("reprocannRelacionado") === "on",
                  especialistaId: especialistaId,
                  notas: formData.get("notas") || "",
                };

                handleCrearTurno(nuevoTurno);
              }}
            >
              <div className="form-group">
                <label>Especialista: *</label>
                <select name="especialistaId" required disabled={loading}>
                  <option value="">Seleccionar especialista</option>
                  {especialistas.map((especialista) => (
                    <option key={especialista._id} value={especialista._id}>
                      {especialista.especialidad} - {especialista.userId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha y Hora: *</label>
                <input
                  type="datetime-local"
                  name="fecha"
                  required
                  disabled={loading}
                  min={new Date().toISOString().slice(0, 16)} // No permitir fechas pasadas
                />
              </div>

              <div className="form-group">
                <label>Motivo: *</label>
                <input
                  type="text"
                  name="motivo"
                  required
                  disabled={loading}
                  placeholder="Describe el motivo de la consulta"
                />
              </div>

              <div className="form-group">
                <label>Notas adicionales:</label>
                <textarea
                  name="notas"
                  disabled={loading}
                  placeholder="Información adicional que quieras agregar (opcional)"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="reprocannRelacionado"
                    disabled={loading}
                  />
                  Relacionado a Reprocann
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNuevoTurnoModal(false)}
                  className="close-btn"
                  disabled={loading}
                >
                  {loading ? "Cancelando..." : "Cancelar"}
                </button>
                <button
                  type="submit"
                  className="approve-btn"
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Crear Turno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
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
                const fecha = formData.get("fecha");
                const motivo = formData.get("motivo");

                if (!fecha || !motivo) {
                  notify("Todos los campos son obligatorios", "error");
                  return;
                }

                const fechaSeleccionada = new Date(fecha);
                const ahora = new Date();

                if (fechaSeleccionada <= ahora) {
                  notify("La fecha del turno debe ser futura", "error");
                  return;
                }

                const turnoActualizado = {
                  fecha: fecha,
                  motivo: motivo,
                };

                handleEditarTurno(turnoAEditar._id, turnoActualizado);
              }}
            >
              <div className="form-group">
                <label>Fecha y Hora: *</label>
                <input
                  type="datetime-local"
                  name="fecha"
                  defaultValue={toLocalDateTimeString(turnoAEditar.fecha)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="form-group">
                <label>Motivo: *</label>
                <input
                  type="text"
                  name="motivo"
                  defaultValue={turnoAEditar.motivo}
                  required
                  placeholder="Describe el motivo de la consulta"
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

      {/* MODAL VER */}
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
