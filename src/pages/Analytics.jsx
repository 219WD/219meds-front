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
import useLoadingStore from "../store/loadingStore"; // Importar el store del loader
import withGlobalLoader from "../utils/withGlobalLoader";
import API_URL from "../common/constants";
import NavDashboard from "../components/NavDashboard";
import GlobalLoader from "../components/GlobalLoader"; // Importar el loader
import "./css/analytics.css";

// Registrar componentes de Chart.js
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

const Analytics = () => {
  const [pedidos, setPedidos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'today', 'week', 'month', 'year'
  const [isVisible, setIsVisible] = useState(false);
  const token = useAuthStore((state) => state.token);
  const containerRef = useRef(null);

  // Store para controlar el loader global
  const { setLoading: setGlobalLoading, setLoadingText } = useLoadingStore();

  // Fetch data
  const fetchAllData = async () => {
    try {
      setGlobalLoading(true);
      setLoadingText("Cargando datos para análisis...");
      
      const [pedidosRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/cart/getAllCarts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/users/getUsers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!pedidosRes.ok) throw new Error("Error al obtener pedidos");
      if (!usersRes.ok) throw new Error("Error al obtener usuarios");

      const pedidosData = await pedidosRes.json();
      const usersData = await usersRes.json();

      setPedidos(pedidosData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Animación de entrada simple con CSS
  useEffect(() => {
    if (!loading) {
      setIsVisible(true);
    }
  }, [loading]);

  // 🎯 FUNCIONES DE FILTRADO POR TIEMPO
  const filterDataByTimeRange = (data, dateField = 'createdAt') => {
    const now = new Date();
    const filteredData = data.filter(item => {
      const itemDate = new Date(item[dateField]);
      
      switch (timeRange) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return itemDate >= today && itemDate < tomorrow;
          
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return itemDate >= weekAgo;
          
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return itemDate >= monthAgo;
          
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return itemDate >= yearAgo;
          
        default:
          return true;
      }
    });
    
    return filteredData;
  };

  // Datos filtrados
  const filteredPedidos = filterDataByTimeRange(pedidos);
  const filteredUsers = filterDataByTimeRange(users, 'createdAt');

  // 🎯 FUNCIONES DE ANÁLISIS CON DATOS FILTRADOS

  // 1. Pedidos por estado
  const getOrdersByStatus = () => {
    const statusCount = {
      pendiente: 0,
      pagado: 0,
      preparacion: 0,
      entregado: 0,
      cancelado: 0
    };

    filteredPedidos.forEach(pedido => {
      if (statusCount.hasOwnProperty(pedido.status)) {
        statusCount[pedido.status]++;
      }
    });

    return statusCount;
  };

  // 2. Ingresos por período
  const getRevenueData = () => {
    let labels = [];
    let revenue = [];

    switch (timeRange) {
      case 'today':
        // Horas del día
        labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        revenue = new Array(24).fill(0);
        filteredPedidos
          .filter(pedido => pedido.status === 'entregado')
          .forEach(pedido => {
            const date = new Date(pedido.createdAt);
            const hour = date.getHours();
            revenue[hour] += pedido.totalAmount || 0;
          });
        break;

      case 'week':
        // Días de la semana
        labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        revenue = new Array(7).fill(0);
        filteredPedidos
          .filter(pedido => pedido.status === 'entregado')
          .forEach(pedido => {
            const date = new Date(pedido.createdAt);
            const day = date.getDay();
            revenue[day] += pedido.totalAmount || 0;
          });
        break;

      case 'month':
        // Últimas 4 semanas
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        revenue = new Array(4).fill(0);
        filteredPedidos
          .filter(pedido => pedido.status === 'entregado')
          .forEach(pedido => {
            const date = new Date(pedido.createdAt);
            const week = Math.floor((date.getDate() - 1) / 7);
            if (week < 4) revenue[week] += pedido.totalAmount || 0;
          });
        break;

      case 'year':
        // Meses del año
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        revenue = new Array(12).fill(0);
        filteredPedidos
          .filter(pedido => pedido.status === 'entregado')
          .forEach(pedido => {
            const date = new Date(pedido.createdAt);
            const month = date.getMonth();
            revenue[month] += pedido.totalAmount || 0;
          });
        break;

      default:
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        revenue = new Array(12).fill(0);
    }

    return { labels, data: revenue };
  };

  // 3. Crecimiento de usuarios
  const getUsersGrowth = () => {
    let labels = [];
    let growth = [];

    switch (timeRange) {
      case 'today':
        labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        growth = new Array(24).fill(0);
        filteredUsers.forEach(user => {
          const date = new Date(user.createdAt || Date.now());
          const hour = date.getHours();
          growth[hour]++;
        });
        break;

      case 'week':
        labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        growth = new Array(7).fill(0);
        filteredUsers.forEach(user => {
          const date = new Date(user.createdAt || Date.now());
          const day = date.getDay();
          growth[day]++;
        });
        break;

      case 'month':
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        growth = new Array(4).fill(0);
        filteredUsers.forEach(user => {
          const date = new Date(user.createdAt || Date.now());
          const week = Math.floor((date.getDate() - 1) / 7);
          if (week < 4) growth[week]++;
        });
        break;

      case 'year':
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        growth = new Array(12).fill(0);
        filteredUsers.forEach(user => {
          const date = new Date(user.createdAt || Date.now());
          const month = date.getMonth();
          growth[month]++;
        });
        break;

      default:
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        growth = new Array(12).fill(0);
    }

    // Convertir a acumulativo
    for (let i = 1; i < growth.length; i++) {
      growth[i] += growth[i - 1];
    }

    return { labels, data: growth };
  };

  // 4. Métodos de pago
  const getPaymentMethods = () => {
    const methods = {};
    
    filteredPedidos.forEach(pedido => {
      const method = pedido.paymentMethod || 'efectivo';
      methods[method] = (methods[method] || 0) + 1;
    });

    return methods;
  };

  // 5. Productos más vendidos
  const getTopProducts = () => {
    const productSales = {};
    
    filteredPedidos.forEach(pedido => {
      pedido.items.forEach(item => {
        const productName = item.productId?.title || 'Producto sin nombre';
        const quantity = item.quantity || 1;
        
        productSales[productName] = (productSales[productName] || 0) + quantity;
      });
    });

    const sortedProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedProducts.map(([name]) => name),
      data: sortedProducts.map(([,count]) => count)
    };
  };

  // 6. Volumen de Pedidos
  const getOrdersVolume = () => {
    let labels = [];
    let ordersCount = [];

    switch (timeRange) {
      case 'today':
        labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        ordersCount = new Array(24).fill(0);
        filteredPedidos.forEach(pedido => {
          const date = new Date(pedido.createdAt);
          const hour = date.getHours();
          ordersCount[hour]++;
        });
        break;

      case 'week':
        labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        ordersCount = new Array(7).fill(0);
        filteredPedidos.forEach(pedido => {
          const date = new Date(pedido.createdAt);
          const day = date.getDay();
          ordersCount[day]++;
        });
        break;

      case 'month':
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        ordersCount = new Array(4).fill(0);
        filteredPedidos.forEach(pedido => {
          const date = new Date(pedido.createdAt);
          const week = Math.floor((date.getDate() - 1) / 7);
          if (week < 4) ordersCount[week]++;
        });
        break;

      case 'year':
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        ordersCount = new Array(12).fill(0);
        filteredPedidos.forEach(pedido => {
          const date = new Date(pedido.createdAt);
          const month = date.getMonth();
          ordersCount[month]++;
        });
        break;

      default:
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        ordersCount = new Array(12).fill(0);
    }

    return { labels, data: ordersCount };
  };

  // 🎨 CONFIGURACIÓN DE GRÁFICOS

  const statusChartData = {
    labels: Object.keys(getOrdersByStatus()),
    datasets: [
      {
        label: 'Cantidad de Pedidos',
        data: Object.values(getOrdersByStatus()),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  const revenueChartData = {
    labels: getRevenueData().labels,
    datasets: [
      {
        label: 'Ingresos ($)',
        data: getRevenueData().data,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        fill: true
      },
    ],
  };

  const usersChartData = {
    labels: getUsersGrowth().labels,
    datasets: [
      {
        label: 'Total de Usuarios',
        data: getUsersGrowth().data,
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      },
    ],
  };

  const paymentMethodsData = {
    labels: Object.keys(getPaymentMethods()),
    datasets: [
      {
        data: Object.values(getPaymentMethods()),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  const topProductsData = {
    labels: getTopProducts().labels,
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: getTopProducts().data,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2
      },
    ],
  };

  const ordersVolumeData = {
    labels: getOrdersVolume().labels,
    datasets: [
      {
        label: 'Número de Pedidos',
        data: getOrdersVolume().data,
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // 📊 CÁLCULO DE MÉTRICAS PARA STATS
  const getPendingPartners = () => {
    return users.filter((user) => {
      const hasPendingPartner = user.partnerData && !user.isPartner;
      const isExplicitlyPending = user.partnerStatus === "pending";
      return hasPendingPartner || isExplicitlyPending;
    });
  };

  const getDeliveredOrders = () => {
    return pedidos.filter((pedido) => pedido.status === "entregado");
  };

  // Métricas con datos filtrados para las stats cards
  const getFilteredStats = () => {
    const deliveredInPeriod = filteredPedidos.filter(pedido => pedido.status === 'entregado');
    const totalRevenue = deliveredInPeriod.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const deliveryRate = filteredPedidos.length > 0 
      ? (deliveredInPeriod.length / filteredPedidos.length) * 100 
      : 0;

    return {
      totalUsers: filteredUsers.length,
      totalOrders: filteredPedidos.length,
      totalRevenue,
      deliveryRate
    };
  };

  const stats = getFilteredStats();

  // Función para navegar a facturación
  const navigateToFacturacion = () => {
    window.location.href = '/facturacion';
  };

  return (
    <div className="dashboard futurista">
      {/* Loader global - se mostrará automáticamente cuando isLoading sea true */}
      <GlobalLoader />

      {/* ✅ NavDashboard agregado */}
      <NavDashboard />
      
      <div className="main-content">
        <div 
          className={`analytics-container ${isVisible ? 'visible' : ''}`} 
          ref={containerRef}
        >
          <div className="analytics-content">
            <div className="analytics-header">
              <h1>Panel de Análisis Completo</h1>
              <p>6 gráficos con métricas detalladas de tu negocio</p>
              
              {/* Botón de Facturación */}
              <div className="header-actions">
                <button 
                  className="facturacion-btn"
                  onClick={navigateToFacturacion}
                >
                  📄 Ir a Facturación
                </button>
              </div>
              
              {/* Filtros de Tiempo */}
              <div className="time-filter">
                <button 
                  className={timeRange === 'today' ? 'active' : ''}
                  onClick={() => setTimeRange('today')}
                >
                  📅 Hoy
                </button>
                <button 
                  className={timeRange === 'week' ? 'active' : ''}
                  onClick={() => setTimeRange('week')}
                >
                  📊 Semana
                </button>
                <button 
                  className={timeRange === 'month' ? 'active' : ''}
                  onClick={() => setTimeRange('month')}
                >
                  📈 Mes
                </button>
                <button 
                  className={timeRange === 'year' ? 'active' : ''}
                  onClick={() => setTimeRange('year')}
                >
                  🗓️ Año
                </button>
              </div>
            </div>

            {/* Estadísticas principales con datos filtrados */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Usuarios {timeRange !== 'month' && `(${timeRange})`}</h3>
                <p className="stat-number">{stats.totalUsers}</p>
                <div className="stat-subtitle">
                  {getPendingPartners().length} pendientes
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Pedidos {timeRange !== 'month' && `(${timeRange})`}</h3>
                <p className="stat-number">{stats.totalOrders}</p>
                <div className="stat-subtitle">
                  {getDeliveredOrders().length} entregados
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Ingresos {timeRange !== 'month' && `(${timeRange})`}</h3>
                <p className="stat-number">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
                <div className="stat-subtitle">
                  Pedidos entregados
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Tasa de Entrega</h3>
                <p className="stat-number">
                  {stats.deliveryRate.toFixed(1)}%
                </p>
                <div className="stat-subtitle">
                  Eficiencia
                </div>
              </div>
            </div>

            {/* Grid de 6 Gráficos */}
            <div className="chart-grid">
              <div className="chart-card">
                <h3>📈 Ingresos {timeRange !== 'month' && `(${timeRange})`}</h3>
                <div className="chart-container">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card">
                <h3>📊 Estado de Pedidos</h3>
                <div className="chart-container">
                  <Bar data={statusChartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card">
                <h3>👥 Crecimiento de Usuarios</h3>
                <div className="chart-container">
                  <Line data={usersChartData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3>💳 Métodos de Pago</h3>
                <div className="chart-container">
                  <Doughnut data={paymentMethodsData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3>🏆 Productos Más Vendidos</h3>
                <div className="chart-container">
                  <Bar data={topProductsData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3>📦 Volumen de Pedidos {timeRange !== 'month' && `(${timeRange})`}</h3>
                <div className="chart-container">
                  <Line data={ordersVolumeData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;