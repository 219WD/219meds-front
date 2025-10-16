import React, { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import "../../pages/css/AdminPanel.css";
import API_URL from "../../common/constants";

const ModalDetallesUsuario = ({
  user,
  partnerDetails,
  loading,
  onClose,
  onTogglePartner,
  onToggleSecretaria, // Nueva prop agregada
}) => {
  const [especialistaData, setEspecialistaData] = useState(null);
  const [loadingEspecialista, setLoadingEspecialista] = useState(false);
  const [errorEspecialista, setErrorEspecialista] = useState(null);
  const { token, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    if (user?.isMedico) {
      fetchEspecialistaData();
    } else {
      setEspecialistaData(null);
      setErrorEspecialista(null);
    }
  }, [user]);

  const fetchEspecialistaData = async () => {
    try {
      setLoadingEspecialista(true);
      setErrorEspecialista(null);

      const res = await fetch(`${API_URL}/especialistas/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}...`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al obtener datos del médico");
      }

      setEspecialistaData(data.data);
    } catch (err) {
      setErrorEspecialista(
        err.message || "Error al obtener datos de especialista"
      );
      setEspecialistaData(null);
    } finally {
      setLoadingEspecialista(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal-content">
        <button className="dashboard-modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h3 className="dashboard-modal-title">Detalles del Usuario</h3>
        <div className="modal-body">
          <div className="user-details">
            <p>
              <strong>Nombre:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Estado Socio:</strong>{" "}
              {user.isPartner ? "✅ Aprobado" : "❌ Pendiente"}
            </p>
            <p>
              <strong>Formulario:</strong>{" "}
              {user.isPending ? "🟠 Pendiente" : "🟢 Completado"}
            </p>
            <p>
              <strong>Admin:</strong> {user.isAdmin ? "✅ Sí" : "❌ No"}
            </p>
            <p>
              <strong>Médico:</strong> {user.isMedico ? "✅ Sí" : "❌ No"}
            </p>
            <p>
              <strong>Secretaria:</strong> {user.isSecretaria ? "✅ Sí" : "❌ No"} {/* Nuevo campo */}
            </p>

            {loading ? (
              <p>Cargando detalles...</p>
            ) : (
              <>
                {partnerDetails && (
                  <div className="user-details">
                    <h3 className="dashboard-modal-title">
                      Información de Socio:
                    </h3>
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {partnerDetails.adress || "No especificada"}
                    </p>
                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {partnerDetails.phone || "No especificado"}
                    </p>
                    <p>
                      <strong>DNI:</strong>{" "}
                      {partnerDetails.dni || "No especificado"}
                    </p>
                  </div>
                )}

                {user.isMedico && (
                  <div className="user-details">
                    <h3 className="dashboard-modal-title">
                      Información Médica:
                    </h3>
                    {loadingEspecialista ? (
                      <p>Cargando información médica...</p>
                    ) : errorEspecialista ? (
                      <p className="error-message">
                        Error: {errorEspecialista}
                      </p>
                    ) : especialistaData ? (
                      <>
                        <p>
                          <strong>Especialidad:</strong>{" "}
                          {especialistaData.especialidad}
                        </p>
                        <p>
                          <strong>Matrícula:</strong>{" "}
                          {especialistaData.matricula}
                        </p>
                        <p>
                          <strong>Estado Reprocann:</strong>{" "}
                          {especialistaData.reprocann?.status || "No definido"}
                        </p>
                        {especialistaData.reprocann?.fechaAprobacion && (
                          <p>
                            <strong>Fecha de Aprobación:</strong>{" "}
                            {new Date(
                              especialistaData.reprocann.fechaAprobacion
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {especialistaData.reprocann?.fechaVencimiento && (
                          <p>
                            <strong>Fecha de Vencimiento:</strong>{" "}
                            {new Date(
                              especialistaData.reprocann.fechaVencimiento
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>No se encontró información médica registrada.</p>
                    )}
                  </div>
                )}

                {!partnerDetails && !user.isMedico && user.isPending && (
                  <p>El usuario tiene un formulario pendiente de completar.</p>
                )}
                {!partnerDetails && !user.isMedico && !user.isPending && (
                  <p>
                    El usuario ha completado el formulario de socio, pero aún no
                    ha sido aprobado.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="dashboard-modal-actions">
          <select
            className="dashboard-status-select"
            value={user.isPartner ? "partner" : "no-partner"}
            onChange={() => onTogglePartner(user._id)}
            disabled={loading}
          >
            <option value="no-partner">No Socio</option>
            <option value="partner">Socio</option>
          </select>
          <button
            onClick={() => onTogglePartner(user._id)}
            className={
              user.isPartner ? "dashboard-revoke-btn" : "dashboard-approve-btn"
            }
            disabled={loading}
          >
            {user.isPartner ? "Revocar Socio" : "Aprobar Socio"}
          </button>
          
          {/* Nuevo botón para secretaria - solo visible para admins */}
          {isAdmin && onToggleSecretaria && (
            <button
              onClick={() => onToggleSecretaria(user._id)}
              className={
                user.isSecretaria ? "dashboard-revoke-btn" : "dashboard-approve-btn"
              }
              disabled={loading}
            >
            </button>
          )}
          
          <button
            onClick={onClose}
            className="dashboard-close-btn"
            disabled={loading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesUsuario;