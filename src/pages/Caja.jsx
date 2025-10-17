import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import "./css/ConsultorioPanel.css";
import NavDashboard from "../components/NavDashboard";
import ProductosModal from "../components/Consultorio/ProductosModal";
import FiltrosCaja from "../components/Caja/FiltrosCaja.jsx";
import TablaTurnos from "../components/Caja/TablaTurnos.jsx";
import ModalConsulta from "../components/Caja/ModalConsulta.jsx";
import EstadisticasCaja from "../components/Caja/EstadisticasCaja.jsx";
import useProductStore from "../store/productStore";
import API_URL from "../common/constants";

const Caja = () => {
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredTurnos, setFilteredTurnos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [dateOrder, setDateOrder] = useState("desc");
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [turnosPerPage] = useState(10);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [formaPago, setFormaPago] = useState("efectivo");
  const modalRef = useRef(null);

  const {
    products,
    fetchProducts,
    loading: productsLoading,
  } = useProductStore();

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/turnos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      const turnosData = data.data || [];
      setTurnos(turnosData);
      setError(null);
    } catch (err) {
      setError(err.message);
      notify("Error al obtener turnos: " + err.message, "error");
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      // 🔹 USAR EL STORE EN LUGAR DE FETCH DIRECTAMENTE
      await useProductStore.getState().fetchProducts();
      const productos = useProductStore.getState().getActiveProducts();
      setProductosDisponibles(productos);
    } catch (err) {
      console.error("Error al obtener productos:", err);
      notify("Error al obtener productos: " + err.message, "error");
    }
  };

// 📝 EN components/Caja/Caja.jsx - MEJORAR updatePagoStatus
const updatePagoStatus = async (turnoId, currentPagado, comprobanteData = null) => {
  const newPagado = !currentPagado;
  try {
    setLoading(true);
    
    const payload = {
      pagado: newPagado
    };
    
    if (comprobanteData) {
      payload.comprobanteUrl = comprobanteData.url;
      payload.nombreComprobante = comprobanteData.nombre;
    }

    const res = await fetch(
      `${API_URL}/turnos/${turnoId}/marcar-pagado`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await res.json();

    if (!res.ok) {
      // ✅ MEJOR MANEJO DE ERRORES
      if (responseData.error && responseData.error.includes("no tiene productos")) {
        // Intentar marcar como pagado de todas formas si hay precio de consulta
        const turno = turnos.find(t => t._id === turnoId);
        if (turno?.consulta?.precioConsulta > 0) {
          // Forzar el pago actualizando localmente
          setTurnos((prev) =>
            prev.map((t) =>
              t._id === turnoId
                ? { 
                    ...t, 
                    consulta: { 
                      ...t.consulta, 
                      pagado: newPagado,
                      comprobantePago: comprobanteData ? {
                        url: comprobanteData.url,
                        nombreArchivo: comprobanteData.nombre,
                        fechaSubida: new Date()
                      } : t.consulta?.comprobantePago
                    } 
                  }
                : t
            )
          );
          
          setSelectedTurno((prev) =>
            prev && prev._id === turnoId
              ? { 
                  ...prev, 
                  consulta: { 
                    ...prev.consulta, 
                    pagado: newPagado,
                    comprobantePago: comprobanteData ? {
                      url: comprobanteData.url,
                      nombreArchivo: comprobanteData.nombre,
                      fechaSubida: new Date()
                    } : prev.consulta?.comprobantePago
                  } 
                }
              : prev
          );
          
          notify(`Pago ${newPagado ? "marcado como pagado" : "desmarcado"} (solo consulta)`, "success");
          return { success: true };
        }
      }
      
      const text = await res.text();
      throw new Error(responseData.error || `Error ${res.status}: ${text}`);
    }

    // ✅ Éxito normal
    setTurnos((prev) =>
      prev.map((t) =>
        t._id === turnoId
          ? { 
              ...t, 
              consulta: { 
                ...t.consulta, 
                pagado: newPagado,
                comprobantePago: comprobanteData ? {
                  url: comprobanteData.url,
                  nombreArchivo: comprobanteData.nombre,
                  fechaSubida: new Date()
                } : t.consulta?.comprobantePago
              } 
            }
          : t
      )
    );
    
    setSelectedTurno((prev) =>
      prev && prev._id === turnoId
        ? { 
            ...prev, 
            consulta: { 
              ...prev.consulta, 
              pagado: newPagado,
              comprobantePago: comprobanteData ? {
                url: comprobanteData.url,
                nombreArchivo: comprobanteData.nombre,
                fechaSubida: new Date()
              } : prev.consulta?.comprobantePago
            } 
          }
        : prev
    );
    
    notify(
      `Pago ${newPagado ? "marcado como pagado" : "desmarcado"}${comprobanteData ? " con comprobante" : ""}`,
      "success"
    );
    
    return responseData;
  } catch (err) {
    console.error("Error updating payment status:", err);
    notify("Error al actualizar pago: " + err.message, "error");
    throw err;
  } finally {
    setLoading(false);
  }
};

// Caja.jsx
const handleProductSelect = (producto) => {
  const productoCantidad = producto.cantidad || 1;

  console.log(`📥 Recibiendo producto ${producto.title} con cantidad ${productoCantidad}`);

  // Verificar si el producto ya está en selectedProducts
  setSelectedProducts((prev) => {
    const existingProductIndex = prev.findIndex(
      (p) => p.productoId === producto._id
    );

    if (existingProductIndex !== -1) {
      // Producto ya seleccionado, sumar la cantidad
      const updatedProducts = [...prev];
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        cantidad: updatedProducts[existingProductIndex].cantidad + productoCantidad,
      };
      console.log("📋 Actualizando producto existente en selectedProducts:", updatedProducts);
      return updatedProducts;
    } else {
      // Producto nuevo, agregarlo
      const newProduct = {
        productoId: producto._id,
        cantidad: productoCantidad,
        dosis: producto.dosis || "",
        precioUnitario: producto.price,
        nombreProducto: producto.title,
      };
      console.log("📋 Agregando nuevo producto a selectedProducts:", newProduct);
      return [...prev, newProduct];
    }
  });

  // NO actualizar stock localmente aquí, lo haremos después de la confirmación del backend
  notify(`✅ ${producto.title} (x${productoCantidad}) agregado al carrito`, "success");
};

  const aplicarDescuento = (montoDescuento) => {
    const descuentoNumero = Number(montoDescuento);
    setDescuento(descuentoNumero);
  };

  const handleDescuentoBlur = (e) => {
    const descuentoNumero = Number(e.target.value);
    if (
      !isNaN(descuentoNumero) &&
      descuentoNumero >= 0 &&
      descuentoNumero > 0
    ) {
      notify(`Descuento de $${descuentoNumero.toFixed(2)} aplicado`, "success");
    } else if (e.target.value !== "" && e.target.value !== "0") {
      notify("Por favor ingrese un monto de descuento válido", "error");
      setDescuento(0);
    }
  };

  const handleDescuentoKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const descuentoNumero = Number(e.target.value);
      if (
        !isNaN(descuentoNumero) &&
        descuentoNumero >= 0 &&
        descuentoNumero > 0
    ) {
        notify(
          `Descuento de $${descuentoNumero.toFixed(2)} aplicado`,
          "success"
        );
      }
      e.target.blur();
    }
  };

// Caja.jsx
const addProduct = async (turnoId) => {
  if (selectedProducts.length === 0) {
    notify("No se han seleccionado productos", "warning");
    return;
  }

  try {
    setLoading(true);

    // Obtener el turno actual
    const turno = turnos.find((t) => t._id === turnoId);
    const productosExistentes = turno.consulta?.productos || [];

    console.log("📋 Productos existentes en el turno:", productosExistentes);
    console.log("📋 Productos seleccionados para agregar:", selectedProducts);

    // Crear una lista de productos para enviar al backend (solo los nuevos)
    const productosParaEnviar = selectedProducts.map((producto) => ({
      productoId: producto.productoId,
      cantidad: producto.cantidad,
      dosis: producto.dosis || "",
      precioUnitario: producto.precioUnitario,
      nombreProducto: producto.nombreProducto,
    }));

    console.log("📤 Enviando productos adicionales al backend:", productosParaEnviar);

    // Validar stock localmente antes de enviar
    for (const producto of productosParaEnviar) {
      const stockDisponible = useProductStore.getState().getProductStock(producto.productoId);
      if (stockDisponible < producto.cantidad) {
        notify(`Stock insuficiente para ${producto.nombreProducto}`, "error");
        throw new Error(`Stock insuficiente para ${producto.nombreProducto}`);
      }
    }

    const res = await fetch(
      `${API_URL}/turnos/${turnoId}/agregar-productos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: productosParaEnviar,
          formaPago,
          descuento: Number(descuento),
          notasConsulta: selectedTurno?.consulta?.notasConsulta || "",
          precioConsulta: selectedTurno?.consulta?.precioConsulta || 0,
          reemplazarProductos: false, // NO reemplazar, solo añadir
        }),
      }
    );

    const responseData = await res.json();

    if (!res.ok) {
      if (responseData.error && responseData.error.includes("Stock insuficiente")) {
        notify(responseData.error, "error");
        return;
      }
      throw new Error(responseData.error || `Error ${res.status}`);
    }

    // Actualizar stock localmente solo después de la confirmación del backend
    productosParaEnviar.forEach((producto) => {
      useProductStore.getState().updateLocalStock(producto.productoId, producto.cantidad);
    });

    // Actualizar estado local
    setTurnos((prev) =>
      prev.map((t) =>
        t._id === turnoId
          ? {
              ...t,
              consulta: responseData.data.consulta,
              estado: responseData.data.estado,
            }
          : t
      )
    );

    setSelectedTurno((prev) =>
      prev && prev._id === turnoId
        ? {
            ...prev,
            consulta: responseData.data.consulta,
            estado: responseData.data.estado,
          }
        : prev
    );

    notify(responseData.message, "success");
    setSelectedProducts([]); // Limpiar productos seleccionados
    setDescuento(0);
    setShowProductosModal(false);
  } catch (err) {
    console.error("Error al agregar productos:", err);
    notify("Error al agregar productos: " + err.message, "error");

    // Restaurar stock local en caso de error
    selectedProducts.forEach((product) => {
      useProductStore.getState().restoreLocalStock(product.productoId, product.cantidad);
    });
  } finally {
    setLoading(false);
  }
};

  const calcularTotalConDescuento = () => {
    const subtotal = selectedProducts.reduce((sum, producto) => {
      const precioUnitario = producto.precioUnitario || 0;
      const cantidad = producto.cantidad || 0;
      return sum + (precioUnitario * cantidad);
    }, 0);

    const consultaPrecio = selectedTurno?.consulta?.precioConsulta || 0;
    const total = subtotal + consultaPrecio;

    return Math.max(0, total - descuento);
  };

  const filterTurnos = () => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const useRange = Boolean(dateFrom || dateTo);
    const rangeStart = dateFrom ? new Date(dateFrom) : new Date("1970-01-01");
    const rangeEnd = dateTo
      ? new Date(dateTo + "T23:59:59")
      : new Date("9999-12-31");

    const filtered = turnos
      .filter((turno) => {
        const turnoDate = new Date(turno.fecha);
        const patientName = turno.pacienteId?.fullName || "";
        const matchesSearch =
          patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (turno._id || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "todos" ||
          (statusFilter === "pagado" && turno.consulta?.pagado) ||
          (statusFilter === "pendiente" && !turno.consulta?.pagado);

        const matchesPayment =
          paymentFilter === "todos" ||
          turno.consulta?.formaPago === paymentFilter;

        let matchesDate = true;

        if (showTodayOnly) {
          matchesDate = turnoDate >= todayStart && turnoDate <= todayEnd;
        } else if (useRange) {
          matchesDate = turnoDate >= rangeStart && turnoDate <= rangeEnd;
        }

        return matchesSearch && matchesStatus && matchesPayment && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
      });

    return filtered;
  };

  const handleTodayClick = () => {
    setShowTodayOnly(!showTodayOnly);
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleDateRangeChange = () => {
    setShowTodayOnly(false);
    setCurrentPage(1);
  };

  const itemSubtotal = (producto) => {
    const unit = producto.precioUnitario ?? producto.productoId?.price ?? 0;
    const qty = producto.cantidad || 0;
    return unit * qty;
  };

  const getProductosFromTurno = (turno) => turno?.consulta?.productos || [];

  const calculateTotals = () => {
    const totals = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      mercadoPago: 0,
      otro: 0,
    };
    filteredTurnos.forEach((turno) => {
      if (turno.consulta?.pagado) {
        const consultaPrecio = turno.consulta?.precioConsulta || 0;
        const productos = getProductosFromTurno(turno);
        const productosTotal = productos.reduce(
          (sum, p) => sum + itemSubtotal(p),
          0
        );
        const descuento = turno.consulta?.descuento || 0;
        const total = consultaPrecio + productosTotal - descuento;
        const key = turno.consulta?.formaPago || "otro";
        totals[key] = (totals[key] || 0) + total;
      }
    });
    return totals;
  };

  const getTotalTurno = (turno) => {
    const consultaPrecio = turno.consulta?.precioConsulta || 0;
    const productos = getProductosFromTurno(turno);
    const productosTotal = productos.reduce(
      (sum, p) => sum + itemSubtotal(p),
      0
    );
    const descuento = turno.consulta?.descuento || 0;
    return consultaPrecio + productosTotal - descuento;
  };

  const getProductDisplayName = (producto) =>
    producto.nombreProducto ||
    producto.productoId?.title ||
    "Producto sin nombre";

  const indexOfLastTurno = currentPage * turnosPerPage;
  const indexOfFirstTurno = indexOfLastTurno - turnosPerPage;
  const currentTurnos = filteredTurnos.slice(
    indexOfFirstTurno,
    indexOfLastTurno
  );
  const totalPages = Math.ceil(filteredTurnos.length / turnosPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchTurnos();
    fetchProductos();
  }, []);

  useEffect(() => {
    if (!showProductosModal) {
      // 🔹 RECARGAR PRODUCTOS CUANDO SE CIERRA EL MODAL
      fetchProductos();
    }
  }, [showProductosModal]);

  useEffect(() => {
    setFilteredTurnos(filterTurnos());
    setCurrentPage(1);
  }, [
    turnos,
    showTodayOnly,
    dateFrom,
    dateTo,
    searchTerm,
    statusFilter,
    paymentFilter,
    dateOrder,
  ]);

  useEffect(() => {
  if (showProductosModal) {
    console.log("🧹 Limpiando selectedProducts al abrir el modal");
    setSelectedProducts([]); // Limpiar selectedProducts al abrir el modal
  }
}, [showProductosModal]);

useEffect(() => {
  if (selectedTurno) {
    console.log("🧹 Limpiando selectedProducts al seleccionar un nuevo turno");
    setSelectedProducts([]); // Limpiar selectedProducts al cambiar de turno
  }
}, [selectedTurno]);

  // GSAP Animation for modal
  useEffect(() => {
    if (!selectedTurno || !modalRef.current) return;

    gsap.fromTo(
      ".modal-overlay",
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    gsap.fromTo(
      ".modal-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [selectedTurno]);

  const totals = calculateTotals();

  return (
    <div className="consultorio-panel">
      <NavDashboard />
      <div className="consultorio-container">
        <div className="title-admin">
          <h2>Caja</h2>
          <p>Gestión de pagos y totales por turno</p>
        </div>
        <div className="caja-panel">
          {error && <div className="error">{error}</div>}

          <FiltrosCaja
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            dateOrder={dateOrder}
            setDateOrder={setDateOrder}
            showTodayOnly={showTodayOnly}
            handleTodayClick={handleTodayClick}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            handleDateRangeChange={handleDateRangeChange}
          />

          {loading ? (
            <p>Cargando...</p>
          ) : filteredTurnos.length === 0 ? (
            <p>No se encontraron turnos. Intenta ajustar los filtros.</p>
          ) : (
            <>
              <TablaTurnos
                currentTurnos={currentTurnos}
                getProductosFromTurno={getProductosFromTurno}
                getTotalTurno={getTotalTurno}
                getProductDisplayName={getProductDisplayName}
                itemSubtotal={itemSubtotal}
                setSelectedTurno={setSelectedTurno}
                setSelectedProducts={setSelectedProducts}
                setDescuento={setDescuento}
                setFormaPago={setFormaPago}
                updatePagoStatus={updatePagoStatus}
              />

              <div className="pagination-controls">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>

              <EstadisticasCaja totals={totals} />
            </>
          )}
        </div>
      </div>

      {selectedTurno && (
        <ModalConsulta
          selectedTurno={selectedTurno}
          setSelectedTurno={setSelectedTurno}
          modalRef={modalRef}
          getProductosFromTurno={getProductosFromTurno}
          getProductDisplayName={getProductDisplayName}
          itemSubtotal={itemSubtotal}
          selectedProducts={selectedProducts}
          descuento={descuento}
          aplicarDescuento={aplicarDescuento}
          handleDescuentoBlur={handleDescuentoBlur}
          handleDescuentoKeyPress={handleDescuentoKeyPress}
          formaPago={formaPago}
          setFormaPago={setFormaPago}
          calcularTotalConDescuento={calcularTotalConDescuento}
          setShowProductosModal={setShowProductosModal}
          addProduct={addProduct}
          updatePagoStatus={updatePagoStatus}
        />
      )}

      <ProductosModal
        showProductosModal={showProductosModal}
        setShowProductosModal={setShowProductosModal}
        productosDisponibles={useProductStore.getState().getActiveProducts()}
        handleProductSelect={handleProductSelect}
        notify={notify}
      />
    </div>
  );
};

export default Caja;