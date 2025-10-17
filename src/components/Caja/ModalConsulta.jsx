import React, { useState } from "react";
import Cloudinary from "../Cloudinary";
import useNotify from "../../hooks/useToast";
import "./css/ModalConsulta.css";

const ModalConsulta = ({
  selectedTurno,
  setSelectedTurno,
  modalRef,
  getProductosFromTurno,
  getProductDisplayName,
  itemSubtotal,
  selectedProducts,
  descuento,
  aplicarDescuento,
  handleDescuentoBlur,
  handleDescuentoKeyPress,
  formaPago,
  setFormaPago,
  calcularTotalConDescuento,
  setShowProductosModal,
  addProduct,
  updatePagoStatus,
}) => {
  const [showConfirmarCambios, setShowConfirmarCambios] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    nombre: "",
    tipo: "comprobante",
  });
  const notify = useNotify();

  const handleComprobanteUploadComplete = (url) => {
    if (url) {
      const nombreComprobante =
        nuevoDocumento.nombre ||
        `Comprobante_${new Date().toLocaleDateString()}`;

      setComprobante({
        url: url,
        nombre: nombreComprobante,
      });

      setNuevoDocumento({
        nombre: "",
        tipo: "comprobante",
      });

      notify("✅ Comprobante subido correctamente", "success");
    } else {
      notify("Error al subir el comprobante", "error");
    }
  };

  const handleMarcarPago = () => {
    if (
      selectedProducts.length > 0 ||
      descuento > 0 ||
      formaPago !== "efectivo"
    ) {
      setShowConfirmarCambios(true);
    } else {
      updatePagoStatus(
        selectedTurno._id,
        selectedTurno.consulta?.pagado || false
      );
    }
  };

// ModalConsulta.jsx
const confirmarYMarcarPago = async (comprobanteData = null) => {
  try {
    // Solo agregar productos si hay nuevos productos seleccionados Y el turno no está pagado
    // Y no hay productos ya registrados en el turno (o se desea reemplazar explícitamente)
    if (
      selectedProducts.length > 0 &&
      !selectedTurno.consulta?.pagado &&
      (!selectedTurno.consulta?.productos || selectedTurno.consulta.productos.length === 0)
    ) {
      console.log("📦 Agregando nuevos productos al turno...");
      await addProduct(selectedTurno._id);
    } else if (selectedProducts.length > 0 && !selectedTurno.consulta?.pagado) {
      console.log("⚠️ Ya existen productos en el turno, omitiendo agregar nuevos productos.");
      notify("El turno ya tiene productos asociados. No se agregaron nuevos productos.", "warning");
    }

    // Marcar como pagado (o desmarcar) si es necesario
    await updatePagoStatus(
      selectedTurno._id,
      selectedTurno.consulta?.pagado || false,
      comprobanteData
    );

    setShowConfirmarCambios(false);
    setComprobante(null);
  } catch (error) {
    console.error("Error al confirmar cambios:", error);
    notify("Error al procesar los cambios: " + error.message, "error");
  }
};

  // Función para formatear la fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => setSelectedTurno(null)}
      ref={modalRef}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={() => setSelectedTurno(null)}>
          &times;
        </button>

        <div className="modal-header">
          <h3>Detalles de la Consulta</h3>
        </div>

        <div className="modal-content-productos">
          <div className="modal-section">
            <div className="turno-info-detailed">
              <p>
                <strong>Paciente:</strong>{" "}
                {selectedTurno.pacienteId?.fullName || "Sin Paciente"}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(selectedTurno.fecha).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })}
              </p>
              <p>
                <strong>Consulta:</strong> $
                {(selectedTurno.consulta?.precioConsulta || 0).toFixed(2)}
              </p>

              <div className="productos-section">
                <p>
                  <strong>Productos:</strong>
                </p>
                {getProductosFromTurno(selectedTurno).length > 0 ? (
                  <ul className="productos-list">
                    {getProductosFromTurno(selectedTurno).map(
                      (producto, index) => (
                        <li key={index}>
                          {getProductDisplayName(producto)} (x
                          {producto.cantidad || 0}) - $
                          {itemSubtotal(producto).toFixed(2)}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>Ninguno</p>
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="selected-products">
                  <p>
                    <strong>Productos Caja:</strong>
                  </p>
                  <ul className="productos-list">
                    {selectedProducts.map((producto, index) => (
                      <li key={index}>
                        {producto.nombreProducto} (x{producto.cantidad}) - $
                        {(producto.cantidad * producto.precioUnitario).toFixed(
                          2
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="price-section">
                <div className="descuento-linea">
                  <strong>Descuento:</strong>
                  <div className="descuento-input-group">
                    <input
                      type="number"
                      value={descuento}
                      onChange={(e) => aplicarDescuento(e.target.value)}
                      onBlur={handleDescuentoBlur}
                      onKeyPress={handleDescuentoKeyPress}
                      min="0"
                      placeholder="0.00"
                      step="0.01"
                      className="discount-input"
                    />
                    <button
                      className="btn-aplicar-descuento"
                      onClick={() => aplicarDescuento(descuento)}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <p>
                  <strong>Subtotal Productos:</strong> $
                  {selectedProducts
                    .reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0)
                    .toFixed(2)}
                </p>

                <p>
                  <strong>Total con Descuento:</strong> $
                  {calcularTotalConDescuento().toFixed(2)}
                </p>

                <div className="payment-section">
                  <p>
                    <strong>Forma de Pago:</strong>
                    <select
                      value={formaPago}
                      onChange={(e) => setFormaPago(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="mercadoPago">Mercado Pago</option>
                      <option value="otro">Otro</option>
                    </select>
                  </p>
                </div>

                <div className="comprobante-section">
                  <strong>Comprobante:</strong>

                  {/* ✅ MOSTRAR CLOUDINARY SOLO SI NO ESTÁ PAGADO Y NO ES EFECTIVO */}
                  {!selectedTurno.consulta?.pagado &&
                  formaPago !== "efectivo" ? (
                    <div className="comprobante-form">
                      <input
                        type="text"
                        placeholder="Nombre del comprobante (opcional)"
                        value={nuevoDocumento.nombre}
                        onChange={(e) =>
                          setNuevoDocumento({
                            ...nuevoDocumento,
                            nombre: e.target.value,
                          })
                        }
                        className="comprobante-input"
                      />

                      <Cloudinary
                        onUploadComplete={handleComprobanteUploadComplete}
                        showPreview={false}
                        buttonText="Adjuntar comprobante"
                        className="cloudinary-comprobante"
                      />

                      {/* Mostrar comprobante subido (pero aún no confirmado) */}
                      {comprobante && !selectedTurno.consulta?.pagado && (
                        <div className="comprobante-pendiente">
                          <p>
                            ✅ <strong>{comprobante.nombre}</strong> - Listo
                            para confirmar
                          </p>
                          <a
                            href={comprobante.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="comprobante-link"
                          >
                            Ver comprobante
                          </a>
                        </div>
                      )}
                    </div>
                  ) : selectedTurno.consulta?.pagado ? (
                    // ✅ MOSTRAR INFO DEL COMPROBANTE SI ESTÁ PAGADO
                    <div className="comprobante-info">
                      {selectedTurno.consulta?.comprobantePago ? (
                        <>
                          <div className="comprobante-details">
                            <p>
                              <strong>Archivo:</strong>{" "}
                              {selectedTurno.consulta.comprobantePago
                                .nombreArchivo || "Comprobante"}
                            </p>
                            <p>
                              <strong>Subido:</strong>{" "}
                              {formatFecha(
                                selectedTurno.consulta.comprobantePago
                                  .fechaSubida
                              )}
                            </p>
                          </div>
                          <a
                            href={selectedTurno.consulta.comprobantePago.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ver-comprobante"
                          >
                            📄 Ver Comprobante
                          </a>
                        </>
                      ) : formaPago === "efectivo" ? (
                        <p className="sin-comprobante">
                          Pago en efectivo - Sin comprobante
                        </p>
                      ) : (
                        <p className="sin-comprobante">
                          No hay comprobante asociado
                        </p>
                      )}
                    </div>
                  ) : formaPago === "efectivo" ? (
                    // ✅ MENSAJE PARA EFECTIVO (NO PAGADO TODAVÍA)
                    <p className="info-comprobante">
                      💵 Pago en efectivo - No se requiere comprobante
                    </p>
                  ) : null}
                </div>

                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`turno-estado ${
                      selectedTurno.consulta?.pagado
                        ? "completado"
                        : "pendiente"
                    }`}
                  >
                    {selectedTurno.consulta?.pagado ? "Pagado" : "Pendiente"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions compact-buttons">
          <button
            className="btn-add small-btn"
            onClick={() => setShowProductosModal(true)}
            disabled={selectedTurno.consulta?.pagado}
          >
            Agregar Productos
          </button>

          <button
            className="btn-submit small-btn"
            onClick={handleMarcarPago}
            disabled={
              selectedTurno.consulta?.pagado &&
              !selectedTurno.consulta?.comprobantePago
            }
          >
            {selectedTurno.consulta?.pagado ? "Desmarcar Pago" : "Marcar Pago"}
          </button>

          <button
            className="btn-cancel small-btn"
            onClick={() => setSelectedTurno(null)}
          >
            Cerrar
          </button>
        </div>

        {/* Modal de confirmación */}
        {showConfirmarCambios && (
          <div className="confirmation-overlay">
            <div className="confirmation-modal">
              <h3>Confirmar Cambios</h3>

              {showConfirmarCambios && (
                <div className="confirmation-overlay">
                  <div className="confirmation-modal">

                    {formaPago === "efectivo" ? (
                      <>
                        <p>
                          💵 <strong>Pago en efectivo seleccionado</strong>
                        </p>
                        <p>¿Desea aplicar los cambios y marcar como pagado?</p>
                        <p className="info-text">
                          No se requiere comprobante para pagos en efectivo
                        </p>
                      </>
                    ) : comprobante ? (
                      <>
                        <p>
                          ✅ Comprobante subido:{" "}
                          <strong>{comprobante.nombre}</strong>
                        </p>
                        <p>
                          ¿Desea aplicar los cambios y marcar como pagado con
                          comprobante?
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          ¿Desea aplicar los cambios (productos, descuento,
                          forma de pago) y marcar como pagado?
                        </p>
                        <p className="warning-text">
                          ⚠️ No se ha subido ningún comprobante
                        </p>
                      </>
                    )}

                    <div className="confirmation-actions">
                      {formaPago !== "efectivo" && comprobante && (
                        <button
                          className="btn-confirm"
                          onClick={() => confirmarYMarcarPago(comprobante)}
                        >
                          Sí, aplicar y marcar como pagado con comprobante
                        </button>
                      )}

                      <button
                        className="btn-confirm"
                        onClick={() => confirmarYMarcarPago()}
                      >
                        {formaPago === "efectivo"
                          ? "Sí, marcar como pagado (efectivo)"
                          : "Sí, pero sin comprobante"}
                      </button>

                      <button
                        className="btn-cancel"
                        onClick={() => setShowConfirmarCambios(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalConsulta;
