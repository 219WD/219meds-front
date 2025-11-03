import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import useAuthStore from "../store/authStore";
import useLoadingStore from "../store/loadingStore";
import API_URL from "../common/constants";
import NavDashboard from "../components/NavDashboard";
import GlobalLoader from "../components/GlobalLoader";
import "./css/facturacion.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FacturacionPanel = () => {
  const [turnos, setTurnos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('hoy');
  const [customDate, setCustomDate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [productosFilter, setProductosFilter] = useState('todos');
  const token = useAuthStore((state) => state.token);
  const { setLoading: setGlobalLoading, setLoadingText } = useLoadingStore();
  const containerRef = useRef(null);

  // Fetch datos
  const fetchAllData = async () => {
    try {
      setGlobalLoading(true);
      setLoadingText("Cargando datos de facturación...");
      
      const [turnosRes, pedidosRes] = await Promise.all([
        fetch(`${API_URL}/turnos/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/cart/getAllCarts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!turnosRes.ok) throw new Error("Error al obtener turnos");
      if (!pedidosRes.ok) throw new Error("Error al obtener pedidos");

      const turnosData = await turnosRes.json();
      const pedidosData = await pedidosRes.json();

      setTurnos(turnosData.data || []);
      setPedidos(pedidosData);
    } catch (err) {
      console.error("Error fetching facturacion data:", err);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 🎯 FUNCIONES DE FILTRADO POR FECHA
  const getDateRange = () => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'hoy':
        const hoyInicio = new Date(now);
        hoyInicio.setHours(0, 0, 0, 0);
        const hoyFin = new Date(now);
        hoyFin.setHours(23, 59, 59, 999);
        return { start: hoyInicio, end: hoyFin };
        
      case 'ayer':
        const ayer = new Date(now);
        ayer.setDate(ayer.getDate() - 1);
        const ayerInicio = new Date(ayer);
        ayerInicio.setHours(0, 0, 0, 0);
        const ayerFin = new Date(ayer);
        ayerFin.setHours(23, 59, 59, 999);
        return { start: ayerInicio, end: ayerFin };
        
      case 'mañana':
        const manana = new Date(now);
        manana.setDate(manana.getDate() + 1);
        const mananaInicio = new Date(manana);
        mananaInicio.setHours(0, 0, 0, 0);
        const mananaFin = new Date(manana);
        mananaFin.setHours(23, 59, 59, 999);
        return { start: mananaInicio, end: mananaFin };
        
      case 'personalizado':
        const inicio = dateFrom ? new Date(dateFrom) : new Date('1970-01-01');
        const fin = dateTo ? new Date(dateTo + 'T23:59:59') : new Date();
        return { start: inicio, end: fin };
        
      case 'fecha-especifica':
        const fecha = customDate ? new Date(customDate) : new Date();
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        return { start: fechaInicio, end: fechaFin };
        
      default:
        return { start: new Date('1970-01-01'), end: new Date() };
    }
  };

  const filterByDateRange = (data, dateField = 'fecha') => {
    const { start, end } = getDateRange();
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  // Datos filtrados
  const turnosFiltrados = filterByDateRange(turnos);
  const pedidosFiltrados = filterByDateRange(pedidos, 'createdAt');

  // 🎯 ANÁLISIS DE TURNOS DETALLADO - CON CÁLCULO DE TOTALES REALES
  const getAnalisisTurnos = () => {
    const turnosPagados = turnosFiltrados.filter(t => t.consulta?.pagado);
    const turnosNoPagados = turnosFiltrados.filter(t => !t.consulta?.pagado);
    
    // Nuevos estados de turnos
    const turnosConfirmados = turnosFiltrados.filter(t => t.estado === 'confirmado' || t.confirmado);
    const turnosCompletados = turnosFiltrados.filter(t => t.estado === 'completado' || t.completado);
    
    // CÁLCULO CORREGIDO: Total real de turnos (considerando descuentos)
    const totalIngresosTurnos = turnosPagados.reduce((sum, turno) => {
      const precioConsulta = turno.consulta?.precioConsulta || 0;
      
      // Sumar productos del turno
      const totalProductos = turno.consulta?.productos?.reduce((prodSum, producto) => {
        return prodSum + ((producto.precioUnitario || 0) * (producto.cantidad || 0));
      }, 0) || 0;
      
      // Aplicar descuento si existe
      const descuento = turno.consulta?.descuento || 0;
      const subtotal = precioConsulta + totalProductos;
      const totalTurno = Math.max(0, subtotal - descuento);
      
      return sum + totalTurno;
    }, 0);

    // Ingresos por consultas (sin productos)
    const ingresosConsultas = turnosPagados.reduce((sum, t) => 
      sum + (t.consulta?.precioConsulta || 0), 0);
    
    // Ingresos por productos en turnos
    const ingresosProductosTurnos = turnosPagados.reduce((sum, t) => {
      if (t.consulta?.productos) {
        return sum + t.consulta.productos.reduce((prodSum, p) => 
          prodSum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0);
      }
      return sum;
    }, 0);

    // Productos vendidos en turnos
    const productosTurnos = {};
    turnosPagados.forEach(turno => {
      if (turno.consulta?.productos) {
        turno.consulta.productos.forEach(producto => {
          const nombre = producto.nombreProducto || 'Producto sin nombre';
          const cantidad = producto.cantidad || 0;
          const ingresos = (producto.precioUnitario || 0) * cantidad;
          
          if (!productosTurnos[nombre]) {
            productosTurnos[nombre] = { cantidad: 0, ingresos: 0 };
          }
          productosTurnos[nombre].cantidad += cantidad;
          productosTurnos[nombre].ingresos += ingresos;
        });
      }
    });

    return {
      total: turnosFiltrados.length,
      pagados: turnosPagados.length,
      noPagados: turnosNoPagados.length,
      confirmados: turnosConfirmados.length,
      completados: turnosCompletados.length,
      ingresosConsultas,
      ingresosProductosTurnos,
      ingresosTotalesTurnos: totalIngresosTurnos, // Usamos el cálculo corregido
      productosTurnos
    };
  };

  // 🎯 ANÁLISIS DE PEDIDOS DETALLADO
  const getAnalisisPedidos = () => {
    const pedidosEntregados = pedidosFiltrados.filter(p => p.status === 'entregado');
    const pedidosPendientes = pedidosFiltrados.filter(p => p.status !== 'entregado');
    
    // Ingresos por pedidos (usando totalAmount del carrito)
    const ingresosPedidos = pedidosEntregados.reduce((sum, p) => 
      sum + (p.totalAmount || 0), 0);

    // Productos vendidos en pedidos
    const productosPedidos = {};
    pedidosEntregados.forEach(pedido => {
      pedido.items.forEach(item => {
        const nombre = item.productId?.title || 'Producto sin nombre';
        const cantidad = item.quantity || 0;
        const ingresos = (item.productId?.price || 0) * cantidad;
        
        if (!productosPedidos[nombre]) {
          productosPedidos[nombre] = { cantidad: 0, ingresos: 0 };
        }
        productosPedidos[nombre].cantidad += cantidad;
        productosPedidos[nombre].ingresos += ingresos;
      });
    });

    return {
      total: pedidosFiltrados.length,
      entregados: pedidosEntregados.length,
      pendientes: pedidosPendientes.length,
      ingresosPedidos,
      productosPedidos
    };
  };

  // 🎯 VENTAS COMBINADAS POR CATEGORÍA
  const getVentasPorCategoria = () => {
    const analisisTurnos = getAnalisisTurnos();
    const analisisPedidos = getAnalisisPedidos();

    const ventas = {
      consultas: analisisTurnos.ingresosConsultas,
      productos_turnos: analisisTurnos.ingresosProductosTurnos,
      pedidos: analisisPedidos.ingresosPedidos,
      total: analisisTurnos.ingresosTotalesTurnos + analisisPedidos.ingresosPedidos
    };

    return ventas;
  };

  // 🎯 PRODUCTOS MÁS VENDIDOS (FILTRADOS)
  const getProductosMasVendidos = () => {
    const analisisTurnos = getAnalisisTurnos();
    const analisisPedidos = getAnalisisPedidos();

    let productosCombinados = {};

    // Combinar productos según el filtro
    if (productosFilter === 'todos' || productosFilter === 'turnos') {
      Object.entries(analisisTurnos.productosTurnos).forEach(([nombre, data]) => {
        productosCombinados[nombre] = { ...data };
      });
    }

    if (productosFilter === 'todos' || productosFilter === 'carrito') {
      Object.entries(analisisPedidos.productosPedidos).forEach(([nombre, data]) => {
        if (productosCombinados[nombre]) {
          productosCombinados[nombre].cantidad += data.cantidad;
          productosCombinados[nombre].ingresos += data.ingresos;
        } else {
          productosCombinados[nombre] = { ...data };
        }
      });
    }

    const sorted = Object.entries(productosCombinados)
      .sort(([,a], [,b]) => b.ingresos - a.ingresos)
      .slice(0, 10);

    return {
      labels: sorted.map(([name]) => name),
      cantidades: sorted.map(([,data]) => data.cantidad),
      ingresos: sorted.map(([,data]) => data.ingresos)
    };
  };

  // 🎯 MÉTODOS DE PAGO COMBINADOS
  const getMetodosPagoCombinados = () => {
    const metodos = {};

    // Métodos de pago en turnos
    turnosFiltrados.forEach(turno => {
      if (turno.consulta?.pagado) {
        const metodo = turno.consulta?.formaPago || 'efectivo';
        const precioConsulta = turno.consulta?.precioConsulta || 0;
        const totalProductos = turno.consulta?.productos?.reduce((sum, p) => 
          sum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0) || 0;
        const descuento = turno.consulta?.descuento || 0;
        const totalTurno = Math.max(0, (precioConsulta + totalProductos) - descuento);
        
        metodos[metodo] = (metodos[metodo] || 0) + totalTurno;
      }
    });

    // Métodos de pago en pedidos
    pedidosFiltrados.forEach(pedido => {
      if (pedido.status === 'entregado') {
        const metodo = pedido.paymentMethod || 'efectivo';
        metodos[metodo] = (metodos[metodo] || 0) + (pedido.totalAmount || 0);
      }
    });

    return metodos;
  };

  // 🎯 DATOS PARA GRÁFICOS
  const ventasPorCategoria = getVentasPorCategoria();
  const productosMasVendidos = getProductosMasVendidos();
  const metodosPago = getMetodosPagoCombinados();
  const analisisTurnos = getAnalisisTurnos();
  const analisisPedidos = getAnalisisPedidos();

  // 🎯 NUEVAS MÉTRICAS - TOTAL COMBINADO EN DINERO
  const getTotalCombinado = () => {
    return {
      totalTurnosYPedidos: analisisTurnos.total + analisisPedidos.total,
      totalIngresosCombinados: analisisTurnos.ingresosTotalesTurnos + analisisPedidos.ingresosPedidos
    };
  };

  const totalCombinado = getTotalCombinado();

  const categoriaChartData = {
    labels: ['Consultas', 'Productos en Turnos', 'Pedidos'],
    datasets: [{
      data: [
        ventasPorCategoria.consultas,
        ventasPorCategoria.productos_turnos,
        ventasPorCategoria.pedidos
      ],
      backgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0'],
      borderWidth: 2,
      borderColor: '#fff'
    }],
  };

  const productosChartData = {
    labels: productosMasVendidos.labels,
    datasets: [{
      label: 'Ingresos por Producto ($)',
      data: productosMasVendidos.ingresos,
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 2
    }],
  };

  const metodosPagoData = {
    labels: Object.keys(metodosPago),
    datasets: [{
      data: Object.values(metodosPago),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
      borderWidth: 2,
      borderColor: '#fff'
    }],
  };

  const turnosChartData = {
    labels: ['Turnos Pagados', 'Turnos Pendientes'],
    datasets: [{
      data: [analisisTurnos.pagados, analisisTurnos.noPagados],
      backgroundColor: ['#4CAF50', '#FF9800'],
      borderWidth: 2,
      borderColor: '#fff'
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#b0b0b0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#b0b0b0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // 🎯 GENERAR REPORTE DESCARGABLE
  const generarReporte = () => {
    const { start, end } = getDateRange();
    const reporte = {
      periodo: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      ventasTotales: ventasPorCategoria.total,
      desglose: ventasPorCategoria,
      analisisTurnos,
      analisisPedidos,
      totalCombinado,
      topProductos: productosMasVendidos.labels.map((nombre, index) => ({
        producto: nombre,
        cantidad: productosMasVendidos.cantidades[index],
        ingresos: productosMasVendidos.ingresos[index]
      })),
      metodosPago: metodosPago
    };

    // Crear y descargar JSON
    const dataStr = JSON.stringify(reporte, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${dateFilter}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard futurista">
      <GlobalLoader />
      <NavDashboard />
      
      <div className="main-content">
        <div className="facturacion-container" ref={containerRef}>
          <div className="facturacion-content">
            <div className="facturacion-header">
              <h1>📊 Panel de Facturación</h1>
              <p>Análisis completo de ventas y productos vendidos</p>
              
              {/* Filtros de Fecha */}
              <div className="fecha-filters">
                <div className="filter-group">
                  <label>Período:</label>
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="hoy">Hoy</option>
                    <option value="ayer">Ayer</option>
                    <option value="mañana">Mañana</option>
                    <option value="fecha-especifica">Fecha Específica</option>
                    <option value="personalizado">Rango Personalizado</option>
                  </select>
                </div>

                {dateFilter === 'fecha-especifica' && (
                  <div className="filter-group">
                    <label>Fecha:</label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                    />
                  </div>
                )}

                {dateFilter === 'personalizado' && (
                  <>
                    <div className="filter-group">
                      <label>Desde:</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="filter-group">
                      <label>Hasta:</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="filter-group">
                  <label>Categoría:</label>
                  <select 
                    value={categoriaFilter} 
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="consultas">Solo Consultas</option>
                    <option value="productos">Solo Productos</option>
                    <option value="pedidos">Solo Pedidos</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Productos:</label>
                  <select 
                    value={productosFilter} 
                    onChange={(e) => setProductosFilter(e.target.value)}
                  >
                    <option value="todos">Todos los Productos</option>
                    <option value="carrito">Solo Carrito</option>
                    <option value="turnos">Solo Turnos</option>
                  </select>
                </div>

                <button className="download-btn" onClick={generarReporte}>
                  📥 Descargar Reporte
                </button>
              </div>
            </div>

            {/* Estadísticas Principales - AHORA CON 6 STAT CARDS MEJORADAS */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Ventas Totales</h3>
                <p className="stat-number">${ventasPorCategoria.total.toFixed(2)}</p>
                <div className="stat-subtitle">
                  Período seleccionado
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Total Turnos</h3>
                <p className="stat-number">{analisisTurnos.total}</p>
                <div className="stat-subtitle">
                  {analisisTurnos.pagados} pagados · ${analisisTurnos.ingresosTotalesTurnos.toFixed(2)}
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Total Pedidos</h3>
                <p className="stat-number">{analisisPedidos.total}</p>
                <div className="stat-subtitle">
                  {analisisPedidos.entregados} entregados · ${analisisPedidos.ingresosPedidos.toFixed(2)}
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Productos Vendidos</h3>
                <p className="stat-number">{productosMasVendidos.labels.length}</p>
                <div className="stat-subtitle">
                  {productosFilter === 'todos' ? 'Todos' : productosFilter}
                </div>
              </div>

              {/* NUEVA STAT CARD: Estado de Turnos */}
              <div className="stat-card">
                <h3>Estado de Turnos</h3>
                <p className="stat-number">{analisisTurnos.confirmados + analisisTurnos.completados}</p>
                <div className="stat-subtitle">
                  {analisisTurnos.confirmados} confirmados · {analisisTurnos.completados} completados
                </div>
              </div>

              {/* NUEVA STAT CARD: Total Combinado EN DINERO */}
              <div className="stat-card total-combinado">
                <h3>💰 Total General</h3>
                <p className="stat-number">${totalCombinado.totalIngresosCombinados.toFixed(2)}</p>
                <div className="stat-subtitle">
                  ${analisisTurnos.ingresosTotalesTurnos.toFixed(2)} turnos + ${analisisPedidos.ingresosPedidos.toFixed(2)} pedidos
                </div>
              </div>
            </div>

            {/* Grid de Gráficos */}
            <div className="chart-grid">
              <div className="chart-card">
                <h3>📈 Ventas por Categoría</h3>
                <div className="chart-container">
                  <Doughnut data={categoriaChartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card">
                <h3>🏆 Productos Más Vendidos ({productosFilter})</h3>
                <div className="chart-container">
                  <Bar data={productosChartData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3>💳 Métodos de Pago</h3>
                <div className="chart-container">
                  <Doughnut data={metodosPagoData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3>📋 Estado de Turnos</h3>
                <div className="chart-container">
                  <Doughnut data={turnosChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Tabla Detallada */}
            <div className="detalle-ventas">
              <h3>📋 Detalle de Productos Vendidos ({productosFilter})</h3>
              <div className="table-container">
                <table className="ventas-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad Vendida</th>
                      <th>Ingresos Totales</th>
                      <th>Promedio por Unidad</th>
                      <th>Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosMasVendidos.labels.length > 0 ? (
                      productosMasVendidos.labels.map((producto, index) => {
                        const enTurnos = analisisTurnos.productosTurnos[producto];
                        const enPedidos = analisisPedidos.productosPedidos[producto];
                        let origen = '';
                        
                        if (enTurnos && enPedidos) {
                          origen = 'Ambos';
                        } else if (enTurnos) {
                          origen = 'Turno';
                        } else if (enPedidos) {
                          origen = 'Carrito';
                        }

                        return (
                          <tr key={producto}>
                            <td>{producto}</td>
                            <td>{productosMasVendidos.cantidades[index]}</td>
                            <td>${productosMasVendidos.ingresos[index].toFixed(2)}</td>
                            <td>
                              ${(productosMasVendidos.ingresos[index] / productosMasVendidos.cantidades[index]).toFixed(2)}
                            </td>
                            <td>
                              <span className={`origen-badge origen-${origen.toLowerCase()}`}>
                                {origen}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">
                          No hay productos vendidos en el período seleccionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturacionPanel;