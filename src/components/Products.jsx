import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import withGlobalLoader from "../utils/withGlobalLoader";
import NavDashboard from "./NavDashboard";
import ProductTable from "./Productos/ProductTable";
import NuevoProductoModal from "./Productos/NuevoProductoModal.jsx";
import EditarProductoModal from "./Productos/EditarProductoModal.jsx";
import "./css/productos.css";
import API_URL from "../common/constants";
import VerProductoModal from "./Productos/VerProductoModal.jsx";
import ReseñasModal from "./Productos/ReseñasModal.jsx";

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [vencimientoFilter, setVencimientoFilter] = useState("todos"); // 🔥 NUEVO
  const [showNuevoProductoModal, setShowNuevoProductoModal] = useState(false);
  const [showEditarProductoModal, setShowEditarProductoModal] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [showVerProductoModal, setShowVerProductoModal] = useState(false);
  const [productoAVer, setProductoAVer] = useState(null);
  const [showReseñasModal, setShowReseñasModal] = useState(false);
  const [productoReseñas, setProductoReseñas] = useState(null);

  const productosContainerRef = useRef(null);
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();

  const fetchProductos = useCallback(
    () =>
      withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/products/getProducts`);
        const data = await res.json();
        setProductos(data);
        setLoading(false);
      }).catch((err) => {
        console.error("Error al obtener productos", err.message);
        notify(err.message, "error");
        setLoading(false);
      }),
    []
  );

  const handleSubmit = async (formValues, isEditing) => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_URL}/products/updateProduct/${formValues._id}`
      : `${API_URL}/products/createProduct`;

    if (!token) {
      notify("Token no encontrado. Inicia sesión.", "error");
      return;
    }

    try {
      await withGlobalLoader(async () => {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formValues),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al guardar producto");

        await fetchProductos();
        notify(
          isEditing ? "Producto actualizado" : "Producto creado",
          "success"
        );

        setShowNuevoProductoModal(false);
        setShowEditarProductoModal(false);
      });
    } catch (error) {
      console.error("Error:", error.message);
      notify(error.message || "Error al guardar producto", "error");
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/products/toggle-status/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Error al cambiar el estado");

        setProductos((prev) =>
          prev.map((prod) =>
            prod._id === id ? { ...prod, isActive: !prod.isActive } : prod
          )
        );
        notify(
          `Producto ${data.product.isActive ? "activado" : "desactivado"}`,
          "success"
        );
      });
    } catch (err) {
      console.error(err.message);
      notify(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/products/deleteProduct/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al eliminar producto");

        await fetchProductos();
        notify("Producto eliminado", "success");
      });
    } catch (error) {
      console.error(error.message);
      notify("Error al eliminar producto", "error");
    }
  };

  const handleEdit = (producto) => {
    setProductoAEditar(producto);
    setShowEditarProductoModal(true);
  };

  const handleView = (producto) => {
    setProductoAVer(producto);
    setShowVerProductoModal(true);
  };

  // 🔥 NUEVO: Función para obtener reportes de vencimiento
  const obtenerProductosProximosAVencer = async () => {
    try {
      const res = await fetch(`${API_URL}/products/proximos-a-vencer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProductos(data.productos);
      notify(`Mostrando ${data.count} productos próximos a vencer`, "info");
    } catch (error) {
      notify("Error al obtener productos próximos a vencer", "error");
    }
  };

  const obtenerProductosVencidos = async () => {
    try {
      const res = await fetch(`${API_URL}/products/vencidos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProductos(data.productos);
      notify(`Mostrando ${data.count} productos vencidos`, "warning");
    } catch (error) {
      notify("Error al obtener productos vencidos", "error");
    }
  };

  const filterProductos = () => {
    return productos.filter((producto) => {
      if (!producto) return false;

      const query = searchQuery.toLowerCase();
      const title = producto.title?.toLowerCase() || "";
      const description = producto.description?.toLowerCase() || "";
      const category = producto.category?.toLowerCase() || "";
      const lote = producto.lote?.toLowerCase() || ""; // 🔥 NUEVO

      const matchesSearch =
        title.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        lote.includes(query); // 🔥 NUEVO

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && producto.isActive) ||
        (statusFilter === "inactivos" && !producto.isActive);

      const matchesCategory =
        categoryFilter === "todos" || producto.category === categoryFilter;

      // 🔥 NUEVO: Filtro por estado de vencimiento
      const matchesVencimiento =
        vencimientoFilter === "todos" ||
        (vencimientoFilter === "vencido" &&
          producto.estadoVencimiento === "vencido") ||
        (vencimientoFilter === "proximo" &&
          producto.estadoVencimiento === "proximo-a-vencer") ||
        (vencimientoFilter === "vigente" &&
          producto.estadoVencimiento === "vigente") ||
        (vencimientoFilter === "sin-vencimiento" &&
          producto.estadoVencimiento === "sin-vencimiento");

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesVencimiento
      );
    });
  };

  const handleViewReseñas = (producto) => {
    setProductoReseñas(producto);
    setShowReseñasModal(true);
  };

  // GSAP Animation
  useEffect(() => {
    if (loading || productos.length === 0) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Animate productos-container
    tl.fromTo(
      productosContainerRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );

    // 2. Animate h1
    tl.fromTo(
      ".title-admin h1",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.3"
    );

    // 3. Animate search container
    tl.fromTo(
      ".search-container",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.2"
    );

    // 4. Animate filters
    tl.fromTo(
      ".filtros-adicionales",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.2"
    );

    // 5. Animate table
    tl.fromTo(
      ".productos-table",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [loading, productos]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const categoriasUnicas = [
    ...new Set(productos.map((prod) => prod.category).filter(Boolean)),
  ];

  if (loading && productos.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard products">
      <NavDashboard />
      <div className="productos-wrapper">
        <div className="productos-container" ref={productosContainerRef}>
          <div className="title-admin">
            <h1>Gestión de Productos</h1>
            <div className="search-container">
              <button type="button">
                <svg
                  width="17"
                  height="16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                    stroke="currentColor"
                    strokeWidth="1.333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <input
                className="input-search"
                placeholder="Buscar por nombre, descripción, categoría o lote..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="reset"
                type="reset"
                onClick={() => setSearchQuery("")}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4l8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <button
              className="btn-nuevo-producto"
              onClick={() => setShowNuevoProductoModal(true)}
            >
              Nuevo Producto
            </button>
          </div>

          {/* 🔥 NUEVO: Botones de reportes de vencimiento */}
          <div className="reportes-vencimiento">
            <button
              className="btn-reporte proximo"
              onClick={obtenerProductosProximosAVencer}
            >
              Próximos a Vencer
            </button>
            <button
              className="btn-reporte vencido"
              onClick={obtenerProductosVencidos}
            >
              Productos Vencidos
            </button>
            <button className="btn-reporte todos" onClick={fetchProductos}>
              Ver Todos
            </button>
          </div>

          <div className="filtros-adicionales">
            <div className="filter-group">
              <label>Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Categoría:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="todos">Todas</option>
                {categoriasUnicas.map((categoria, index) => (
                  <option key={index} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            {/* 🔥 NUEVO: Filtro por estado de vencimiento */}
            <div className="filter-group">
              <label>Vencimiento:</label>
              <select
                value={vencimientoFilter}
                onChange={(e) => setVencimientoFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="vigente">Vigente</option>
                <option value="proximo">Próximo a Vencer</option>
                <option value="vencido">Vencido</option>
                <option value="sin-vencimiento">Sin Vencimiento</option>
              </select>
            </div>
          </div>

          <ProductTable
            productos={filterProductos()}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleEstado={handleToggleEstado}
            onView={handleView}
          />
        </div>
      </div>

      {showVerProductoModal && productoAVer && (
        <VerProductoModal
          producto={productoAVer}
          onClose={() => setShowVerProductoModal(false)}
          onViewReseñas={handleViewReseñas}
        />
      )}

      {showNuevoProductoModal && (
        <NuevoProductoModal
          onClose={() => setShowNuevoProductoModal(false)}
          onSubmit={(formValues) => handleSubmit(formValues, false)}
        />
      )}

      {showEditarProductoModal && productoAEditar && (
        <EditarProductoModal
          producto={productoAEditar}
          onClose={() => setShowEditarProductoModal(false)}
          onSubmit={(formValues) => handleSubmit(formValues, true)}
        />
      )}

      {showReseñasModal && productoReseñas && (
        <ReseñasModal
          producto={productoReseñas}
          onClose={() => setShowReseñasModal(false)}
        />
      )}
    </div>
  );
};

export default Products;
