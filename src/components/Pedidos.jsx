import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faBox,
  faMoneyBillWave,
  faTruck,
  faReceipt,
  faDownload,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./css/pedidos.css";
import NavDashboard from "./NavDashboard";
import withGlobalLoader from "../utils/withGlobalLoader";
import API_URL from "../common/constants";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [deliveryFilter, setDeliveryFilter] = useState("todos");
  const [dateOrder, setDateOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showToday, setShowToday] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const notify = useNotify();
  const navigate = useNavigate();
  const hasAnimated = useRef(false);
  const fetchCalled = useRef(false);
  const pedidosContainerRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const filtrosRef = useRef(null);
  const tableRef = useRef(null);
  const statsRef = useRef(null);
  const verMasRef = useRef(null);

  const fetchPedidos = async () => {
    await withGlobalLoader(async () => {
      const response = await fetch(`${API_URL}/cart/getAllCarts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los pedidos");
      }
      const data = await response.json();
      setPedidos(data);
    })
      .catch((err) => {
        setError(err.message);
        notify(err.message, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!fetchCalled.current && token) {
    fetchCalled.current = true;
    fetchPedidos();
  }

  // GSAP Animation for main content
  useEffect(() => {
    if (hasAnimated.current || loading) return;
    hasAnimated.current = true;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(
      pedidosContainerRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );
    tl.fromTo(
      titleRef.current.querySelectorAll("h1"),
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.3"
    );
    tl.fromTo(
      searchRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.2"
    );
    tl.fromTo(
      filtrosRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
      "-=0.2"
    );
    tl.fromTo(
      tableRef.current.querySelectorAll(".pedidos-table"),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.2"
    );
    tl.fromTo(
      statsRef.current.children,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1 },
      "-=0.3"
    );
    tl.fromTo(
      verMasRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.2"
    );
    return () => {
      tl.kill();
    };
  }, [loading]);

  // GSAP Animation for modal
  useEffect(() => {
    if (!isModalOpen) return;
    gsap.fromTo(
      ".dashboard-modal-overlay",
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(
      ".dashboard-modal-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [isModalOpen]);

  // Filtrar y ordenar pedidos
  const sortedPedidos = pedidos
    .filter((pedido) => {
      const userId = pedido.userId?._id || "";
      const userName = pedido.userId?.name || "";
      const productTitles = pedido.items
        .map((item) => item.productId?.title || "")
        .join(" ");
      const matchesSearch =
        pedido._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productTitles.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "todos" || pedido.status === statusFilter;
      const matchesPayment =
        paymentFilter === "todos" || pedido.paymentMethod === paymentFilter;
      const matchesDelivery =
        deliveryFilter === "todos" || pedido.deliveryMethod === deliveryFilter;
      const createdAt = new Date(pedido.createdAt);
      const today = new Date("2025-09-03");
      const matchesToday =
        !showToday ||
        (createdAt.getFullYear() === today.getFullYear() &&
          createdAt.getMonth() === today.getMonth() &&
          createdAt.getDate() === today.getDate());
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;
      const matchesDate =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate);
      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesDelivery &&
        matchesDate &&
        matchesToday
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const filteredPedidos = sortedPedidos.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(9);
  }, [
    searchTerm,
    statusFilter,
    paymentFilter,
    deliveryFilter,
    dateFrom,
    dateTo,
    dateOrder,
    showToday,
  ]);

  const getStatusClass = (status) => {
    const statusClasses = {
      inicializado: "status-inicializado",
      pendiente: "status-pendiente",
      pagado: "status-pagado",
      confirmado: "status-confirmado",
      preparacion: "status-preparacion",
      cancelado: "status-cancelado",
      entregado: "status-entregado",
    };
    return statusClasses[status] || "";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      inicializado: "Inicializado",
      pendiente: "Pendiente",
      pagado: "Pagado",
      confirmado: "Confirmado",
      preparacion: "En preparación",
      cancelado: "Cancelado",
      entregado: "Entregado",
    };
    return statusTexts[status] || status;
  };

  const getPaymentIcon = (method) => {
    return <FontAwesomeIcon icon={faMoneyBillWave} />;
  };

  const getDeliveryIcon = (method) => {
    return method === "envio" ? (
      <FontAwesomeIcon icon={faTruck} />
    ) : (
      <FontAwesomeIcon icon={faBox} />
    );
  };

  const handleUpdateStatus = async (pedidoId, newStatus) => {
    await withGlobalLoader(async () => {
      const response = await fetch(`${API_URL}/cart/status/${pedidoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }
      const updatedPedido = await response.json();
      setPedidos((prev) =>
        prev.map((pedido) => (pedido._id === pedidoId ? updatedPedido : pedido))
      );
      if (pedidoSeleccionado && pedidoSeleccionado._id === pedidoId) {
        setPedidoSeleccionado(updatedPedido);
      }
      notify(`Estado actualizado a ${newStatus}`, "success");
    }).catch((err) => {
      notify(err.message, "error");
    });
  };

  const handleViewPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setIsModalOpen(true);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  const handleDownloadReceipt = (receiptUrl) => {
    if (receiptUrl) {
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `comprobante-pedido-${pedidoSeleccionado._id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewReceipt = (receiptUrl) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  if (loading && pedidos.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard pedidos">
      <NavDashboard />
      <div className="pedidos-wrapper" ref={pedidosContainerRef}>
        <div className="pedidos-container">
          <div className="title-admin" ref={titleRef}>
            <h1>Gestión de Pedidos</h1>
            <div className="form-search" ref={searchRef}>
              <input
                className="input-search"
                type="text"
                placeholder="Buscar por ID, usuario o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="reset" onClick={handleResetSearch}>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM7.70711 7.70711C7.31658 7.31658 6.68342 7.31658 6.29289 7.70711C5.90237 8.09763 5.90237 8.7308 6.29289 9.12132L8.17157 11L6.29289 12.8787C5.90237 13.2692 5.90237 13.9024 6.29289 14.2929C6.68342 14.6834 7.31658 14.6834 7.70711 14.2929L9.58579 12.4142L11.4142 14.2929C11.8047 14.6834 12.4379 14.6834 12.8284 14.2929C13.2189 13.9024 13.2189 13.2692 12.8284 12.8787L10.9497 11L12.8284 9.12132C13.2189 8.7308 13.2189 8.09763 12.8284 7.70711C12.4379 7.31658 11.8047 7.31658 11.4142 7.70711L9.58579 9.58579L7.70711 7.70711Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 9.29583 13.5892 10.4957 12.8907 11.4763L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L11.4763 12.8907C10.4957 13.5892 9.29583 14 8 14C4.68629 14 2 11.3137 2 8Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Filtros */}
          <div className="filtros-adicionales" ref={filtrosRef}>
            <div className="filter-group">
              <label>Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="inicializado">Inicializado</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="confirmado">Confirmado</option>
                <option value="preparacion">En preparación</option>
                <option value="cancelado">Cancelado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Pago:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercadopago">MercadoPago</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Entrega:</label>
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="envio">Envío</option>
                <option value="retiro">Retiro</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Orden:</label>
              <select
                value={dateOrder}
                onChange={(e) => setDateOrder(e.target.value)}
              >
                <option value="desc">Más recientes</option>
                <option value="asc">Más antiguos</option>
              </select>
            </div>
            <div className="filter-group">
              <button
                className={showToday ? "today-btn active" : "today-btn"}
                onClick={() => {
                  setShowToday(!showToday);
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Hoy
              </button>
            </div>
            <div className="date-filters">
              <div className="filter-group">
                <label>Desde:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={showToday}
                />
              </div>
              <div className="filter-group">
                <label>Hasta:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={showToday}
                />
              </div>
            </div>
          </div>
          {/* Tabla de pedidos */}
          <div className="table-container" ref={tableRef}>
            <table className="pedidos-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Entrega</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.length > 0 ? (
                  filteredPedidos.map((pedido) => (
                    <tr key={pedido._id}>
                      <td data-label="Usuario">
                        <div className="user-email">
                          {pedido.userId?.name || "Usuario eliminado"}
                        </div>
                      </td>
                      <td data-label="Productos">
                        {pedido.items.map((item, index) => (
                          <span key={index}>
                            {item.productId?.title || "Producto eliminado"}
                            {index < pedido.items.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                      <td data-label="Total" className="total-cell">
                        ${pedido.totalAmount.toFixed(2)}
                      </td>
                      <td data-label="Pago">
                        <div className="payment-method">
                          {getPaymentIcon(pedido.paymentMethod)}
                          <span>{pedido.paymentMethod}</span>
                        </div>
                      </td>
                      <td data-label="Entrega">
                        <div className="delivery-method">
                          {getDeliveryIcon(pedido.deliveryMethod)}
                          <span>{pedido.deliveryMethod}</span>
                        </div>
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`status-badge ${getStatusClass(
                            pedido.status
                          )}`}
                        >
                          {getStatusText(pedido.status)}
                        </span>
                      </td>
                      <td data-label="Fecha">
                        {new Date(pedido.createdAt).toLocaleDateString()}
                      </td>
                      <td data-label="Acciones">
                        <div className="actions-cell">
                          <button
                            onClick={() => handleViewPedido(pedido)}
                            className="view-btn"
                            title="Ver detalle"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <select
                            value={pedido.status}
                            onChange={(e) =>
                              handleUpdateStatus(pedido._id, e.target.value)
                            }
                            className="status-select"
                          >
                            <option value="inicializado">Inicializado</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="pagado">Pagado</option>
                            <option value="preparacion">En preparación</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="entregado">Entregado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">
                      No se encontraron pedidos que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {visibleCount < sortedPedidos.length && (
              <div className="ver-mas-container" ref={verMasRef}>
                <button
                  className="ver-mas-btn"
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                >
                  Ver más pedidos
                </button>
              </div>
            )}
          </div>
          {/* Resumen estadístico */}
          <div className="stats-container" ref={statsRef}>
            <div className="stat-card">
              <h3>Total pedidos</h3>
              <p>{pedidos.length}</p>
            </div>
            <div className="stat-card">
              <h3>Pendientes</h3>
              <p className="pendiente">
                {pedidos.filter((p) => p.status === "pendiente").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Pagados</h3>
              <p className="pagado">
                {pedidos.filter((p) => p.status === "pagado").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>En preparación</h3>
              <p className="preparacion">
                {pedidos.filter((p) => p.status === "preparacion").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Entregados</h3>
              <p className="entregado">
                {pedidos.filter((p) => p.status === "entregado").length}
              </p>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && pedidoSeleccionado && (
        <div
          className="dashboard-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="dashboard-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dashboard-modal-close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="dashboard-modal-title">Detalle del Pedido</h2>
            <div className="dashboard-modal-body">
              <p>
                <strong>ID del Pedido:</strong> {pedidoSeleccionado._id}
              </p>
              <p>
                <strong>Usuario:</strong>{" "}
                {pedidoSeleccionado.userId?.name || "No disponible"}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(pedidoSeleccionado.createdAt).toLocaleDateString()} -{" "}
                {new Date(pedidoSeleccionado.createdAt).toLocaleTimeString()}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {getStatusText(pedidoSeleccionado.status)}
              </p>
              <p>
                <strong>Método de pago:</strong>{" "}
                {pedidoSeleccionado.paymentMethod}
              </p>
              <p>
                <strong>Método de entrega:</strong>{" "}
                {pedidoSeleccionado.deliveryMethod}
              </p>
              
              {/* Sección del Comprobante */}
              {pedidoSeleccionado.receiptUrl && (
                <>
                  <h3 className="dashboard-modal-title">
                    <FontAwesomeIcon icon={faReceipt} /> Comprobante
                  </h3>
                  <div className="receipt-section">
                    <div className="receipt-info">
                      <p>
                        <strong>Comprobante disponible:</strong> Sí
                      </p>
                      <div className="receipt-actions">
                        <button
                          onClick={() => handleViewReceipt(pedidoSeleccionado.receiptUrl)}
                          className="receipt-btn view-receipt-btn"
                          title="Ver comprobante"
                        >
                          <FontAwesomeIcon icon={faExternalLinkAlt} />
                          Ver Comprobante
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(pedidoSeleccionado.receiptUrl)}
                          className="receipt-btn download-receipt-btn"
                          title="Descargar comprobante"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {pedidoSeleccionado.shippingAddress && (
                <>
                  <h3 className="dashboard-modal-title">Dirección de Envío:</h3>
                  <div className="address-section">
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {pedidoSeleccionado.shippingAddress.name}
                    </p>
                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {pedidoSeleccionado.shippingAddress.phone}
                    </p>
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {pedidoSeleccionado.shippingAddress.address}
                    </p>
                    {pedidoSeleccionado.shippingAddress.city && (
                      <p>
                        <strong>Ciudad:</strong>{" "}
                        {pedidoSeleccionado.shippingAddress.city}
                      </p>
                    )}
                    {pedidoSeleccionado.shippingAddress.state && (
                      <p>
                        <strong>Provincia:</strong>{" "}
                        {pedidoSeleccionado.shippingAddress.state}
                      </p>
                    )}
                    {pedidoSeleccionado.shippingAddress.zipCode && (
                      <p>
                        <strong>Código Postal:</strong>{" "}
                        {pedidoSeleccionado.shippingAddress.zipCode}
                      </p>
                    )}
                  </div>
                </>
              )}
              
              <h3 className="dashboard-modal-title">Productos:</h3>
              <div className="products-section">
                <ul>
                  {pedidoSeleccionado.items.map((item, i) => (
                    <li key={i}>
                      <strong>{item.productId?.title || "Producto no disponible"}</strong>
                      <br />
                      Cantidad: {item.quantity} 
                      {item.productId?.price && (
                        <> - Precio unitario: ${item.productId.price.toFixed(2)}</>
                      )}
                      {item.productId?.price && (
                        <div className="item-subtotal">
                          Subtotal: ${(item.quantity * item.productId.price).toFixed(2)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              <h3 className="dashboard-modal-title">Resumen del Pedido:</h3>
              <div className="order-summary">
                <p>
                  <strong>Subtotal:</strong> ${pedidoSeleccionado.totalAmount?.toFixed(2)}
                </p>
                {pedidoSeleccionado.shippingCost && pedidoSeleccionado.shippingCost > 0 && (
                  <p>
                    <strong>Costo de envío:</strong> ${pedidoSeleccionado.shippingCost.toFixed(2)}
                  </p>
                )}
                <p className="total-amount">
                  <strong>Total:</strong> ${pedidoSeleccionado.totalAmount?.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="dashboard-modal-actions">
              <select
                value={pedidoSeleccionado.status}
                onChange={(e) =>
                  handleUpdateStatus(pedidoSeleccionado._id, e.target.value)
                }
                className="dashboard-status-select"
              >
                <option value="inicializado">Inicializado</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="preparacion">En preparación</option>
                <option value="cancelado">Cancelado</option>
                <option value="entregado">Entregado</option>
              </select>
              <button
                onClick={() => setIsModalOpen(false)}
                className="dashboard-close-btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;