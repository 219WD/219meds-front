import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const toLocalDateTimeString = (date) => {
  if (!date) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  const local = new Date(date);

  // ✅ CORREGIDO: Usar métodos UTC para coincidir con lo almacenado en la DB
  const year = local.getUTCFullYear();
  const month = pad(local.getUTCMonth() + 1);
  const day = pad(local.getUTCDate());
  const hours = pad(local.getUTCHours()); // ← Ahora usa UTC
  const minutes = pad(local.getUTCMinutes()); // ← Ahora usa UTC

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditarTurnoModal = ({
  turno,
  especialistas,
  onClose,
  onSave,
  currentUserId,
  canEditEspecialista,
}) => {
  const [form, setForm] = useState({
    fecha: turno.fecha ? toLocalDateTimeString(new Date(turno.fecha)) : "",
    motivo: turno.motivo || "",
    notas: turno.notas || "",
    reprocannRelacionado: turno.reprocannRelacionado || false,
    estado: turno.estado || "pendiente",
    especialistaId: turno.especialistaId?._id || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fecha || !form.motivo) {
      setError("Fecha y motivo son campos obligatorios");
      return;
    }

    const fechaTurno = new Date(form.fecha);
    if (fechaTurno <= new Date()) {
      setError("La fecha del turno debe ser futura");
      return;
    }

    try {
      setLoading(true);
      const datosActualizados = {
        fecha: form.fecha,
        motivo: form.motivo,
        notas: form.notas,
        reprocannRelacionado: form.reprocannRelacionado,
        estado: form.estado,
        ...(canEditEspecialista && { especialistaId: form.especialistaId }),
      };

      await onSave(turno._id, datosActualizados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button
          onClick={onClose}
          className="modal-close-btn"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="modal-header">
          <h2>Editar Turno</h2>
        </div>
        <div className="modal-body">
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            {canEditEspecialista && (
              <div className="form-group">
                <label>Especialista:</label>
                <select
                  value={form.especialistaId}
                  onChange={(e) =>
                    setForm({ ...form, especialistaId: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="">Seleccionar especialista</option>
                  {especialistas.map((especialista) => (
                    <option key={especialista._id} value={especialista._id}>
                      {especialista.especialidad} - {especialista.userId?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Fecha y Hora:</label>
              <input
                type="datetime-local"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Motivo:</label>
              <input
                type="text"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Notas adicionales:</label>
              <textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                disabled={loading}
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.reprocannRelacionado}
                  onChange={(e) =>
                    setForm({ ...form, reprocannRelacionado: e.target.checked })
                  }
                  disabled={loading}
                />
                Relacionado a Reprocann
              </label>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="modal-btn close"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modal-btn approve"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditarTurnoModal.propTypes = {
  turno: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fecha: PropTypes.string,
    motivo: PropTypes.string,
    notas: PropTypes.string,
    reprocannRelacionado: PropTypes.bool,
    estado: PropTypes.string,
    especialistaId: PropTypes.shape({
      _id: PropTypes.string,
      userId: PropTypes.shape({
        name: PropTypes.string,
      }),
      especialidad: PropTypes.string,
    }),
  }).isRequired,
  especialistas: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      especialidad: PropTypes.string.isRequired,
      userId: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  canEditEspecialista: PropTypes.bool.isRequired,
};

export default EditarTurnoModal;
