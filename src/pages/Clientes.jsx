import React, { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import "./css/AdminPanel.css";
import NavDashboard from "../components/NavDashboard";
import ModalAgregarEspecialista from "../components/Especialistas/ModalAgregarEspecialista";
import ClientesHeader from "../components/Clientes/ClientesHeader";
import TablaPendientes from "../components/Clientes/TablaPendientes";
import TablaUsuarios from "../components/Clientes/TablaUsuarios";
import ModalDetallesUsuario from "../components/Clientes/ModalDetallesUsuario";
import API_URL from "../common/constants";
import withGlobalLoader from "../utils/withGlobalLoader"; // Importar withGlobalLoader

const Clientes = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModalEspecialista, setShowModalEspecialista] = useState(false);
  const [userToConvert, setUserToConvert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [filters, setFilters] = useState({
    isPartner: null,
    isAdmin: null,
    isMedico: null,
    sortBy: "newest",
  });

  const hasAnimated = useRef(false);
  const adminContainerRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  const token = useAuthStore((state) => state.token);

  // Fetch all users - ahora con withGlobalLoader
  const fetchAllUsers = useCallback(async () => {
    try {
      setError(null);
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/users/getUsers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al obtener usuarios");
        setAllUsers(data);
      }, "Cargando usuarios...");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Obtener detalles de usuario + partner - ahora con withGlobalLoader
  const fetchUserDetails = async (userId) => {
    try {
      setError(null);
      await withGlobalLoader(async () => {
        const userRes = await fetch(`${API_URL}/users/getUser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.error || "Error al obtener usuario");

        setSelectedUser(userData);

        const partnerRes = await fetch(
          `${API_URL}/partners/user/getPartnerByUserId/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const partnerData = await partnerRes.json();
        setPartnerDetails(partnerRes.ok ? partnerData : null);
      }, "Cargando detalles del usuario...");
    } catch (err) {
      setError(err.message);
      setSelectedUser(null);
      setPartnerDetails(null);
    }
  };

  // Cambiar estado de usuario (partner o admin) - ahora con withGlobalLoader
  const toggleUserStatus = async (userId, type) => {
    try {
      setError(null);
      
      const endpoints = {
        partner: `${API_URL}/users/togglePartner/${userId}`,
        admin: `${API_URL}/users/isAdmin/${userId}`,
      };

      const actionText = {
        partner: "Actualizando estado de socio...",
        admin: "Actualizando estado de administrador..."
      };

      await withGlobalLoader(async () => {
        const res = await fetch(endpoints[type], {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al actualizar estado");

        await fetchAllUsers();
        setSelectedUser(null);
        setPartnerDetails(null);
      }, actionText[type]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtros
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPartner =
      filters.isPartner === null || user.isPartner === filters.isPartner;
    const matchesAdmin =
      filters.isAdmin === null || user.isAdmin === filters.isAdmin;
    const matchesMedico =
      filters.isMedico === null || user.isMedico === filters.isMedico;

    return matchesSearch && matchesPartner && matchesAdmin && matchesMedico;
  });

  // Orden
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return filters.sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Usuarios pendientes
  const pendingUsers = allUsers.filter((u) => !u.isPartner);

  // GSAP Animation
  useEffect(() => {
    if (hasAnimated.current || loading) return;
    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(adminContainerRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.5 });
    tl.fromTo(titleRef.current.querySelectorAll("h2"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 }, "-=0.3");
    tl.fromTo(searchRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.2");
    tl.fromTo(tableRef.current.querySelectorAll("table.users-table"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }, "-=0.2");

    return () => tl.kill();
  }, [loading]);

  useEffect(() => {
    // Cargar datos iniciales con loader global
    const loadInitialData = async () => {
      try {
        await withGlobalLoader(async () => {
          await fetchAllUsers();
        }, "Cargando datos de clientes...");
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitialData();
  }, [fetchAllUsers]);

  // Eliminar el loader manual ya que usamos el GlobalLoader global
  // El GlobalLoader se mostrará automáticamente a través del store

  return (
    <div className="dashboard clientes">
      <NavDashboard />
      {/* GlobalLoader se mostrará automáticamente cuando withGlobalLoader active el loading state */}
      <div className="clientes-wrapper" ref={adminContainerRef}>
        <div className="clientes-container">
          {error && <div className="error-banner">{error}</div>}

          <div ref={searchRef}>
            <ClientesHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          <div ref={titleRef}>
            <h2>Solicitudes Pendientes de Socio</h2>
          </div>

          <div className="table-container" ref={tableRef}>
            <TablaPendientes
              users={pendingUsers.filter(
                (user) =>
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onDetails={fetchUserDetails}
              onTogglePartner={(id) => toggleUserStatus(id, "partner")}
            />

            <h2>Todos los Usuarios</h2>
            <TablaUsuarios
              users={currentUsers}
              onDetails={fetchUserDetails}
              onTogglePartner={(id) => toggleUserStatus(id, "partner")}
              onToggleAdmin={(id) => toggleUserStatus(id, "admin")}
              onConvertToEspecialista={async (user) => {
                try {
                  if (user.isMedico) {
                    await withGlobalLoader(async () => {
                      const res = await fetch(`${API_URL}/partners/user/getPartnerByUserId/${user._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const partnerData = await res.json();
                      if (res.ok && partnerData) {
                        setPartnerDetails(partnerData);
                        setSelectedUser(user);
                      }
                    }, "Obteniendo información del médico...");
                  } else {
                    setUserToConvert(user);
                    setShowModalEspecialista(true);
                  }
                } catch {
                  setError("Error al obtener info de médico");
                }
              }}
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
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <ModalDetallesUsuario
          user={selectedUser}
          partnerDetails={partnerDetails}
          loading={loading}
          onClose={() => {
            setSelectedUser(null);
            setPartnerDetails(null);
          }}
          onTogglePartner={(id) => toggleUserStatus(id, "partner")}
        />
      )}

      {showModalEspecialista && userToConvert && (
        <ModalAgregarEspecialista
          user={userToConvert}
          onClose={() => {
            setShowModalEspecialista(false);
            setUserToConvert(null);
          }}
          onSuccess={() => {
            fetchAllUsers();
            setShowModalEspecialista(false);
            setUserToConvert(null);
          }}
        />
      )}
    </div>
  );
};

export default Clientes;