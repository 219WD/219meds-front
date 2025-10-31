import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useLoadingStore from "../store/loadingStore"; // Importar el store del loader
import "./css/PacientesPanel.css";
import NavDashboard from "../components/NavDashboard";
import GlobalLoader from "../components/GlobalLoader"; // Importar el loader
import ModalCrearPaciente from "../components/Pacientes/ModalCrearPaciente.jsx";
import PacientesHeader from "../components/Pacientes/PacientesHeader.jsx";
import TablaPacientes from "../components/Pacientes/TablaPacientes.jsx";
import TablaTodosUsuarios from "../components/Pacientes/TablaTodosUsuarios";
import ModalDetallesPaciente from "../components/Pacientes/ModalDetallesPaciente.jsx";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal.jsx";
import useNotify from "../hooks/useToast.jsx";
import API_URL from "../common/constants";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryUsers, setSearchQueryUsers] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateTurnoModal, setShowCreateTurnoModal] = useState(false);
  const [antecedentesOptions, setAntecedentesOptions] = useState([]);
  const [userToConvert, setUserToConvert] = useState(null);
  const [visiblePacientesCount, setVisiblePacientesCount] = useState(10);
  const [visibleUsersCount, setVisibleUsersCount] = useState(10);
  const [pacienteForTurno, setPacienteForTurno] = useState(null);
  const [turnos, setTurnos] = useState([]);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // Store para controlar el loader global
  const { setLoading: setGlobalLoading, setLoadingText } = useLoadingStore();

  const notify = useNotify();

  const hasAnimated = useRef(false);
  const pacientesContainerRef = useRef(null);
  const headerRef = useRef(null);
  const pacientesTitleRef = useRef(null);
  const usuariosTitleRef = useRef(null);
  const pacientesTableRef = useRef(null);
  const usuariosTableRef = useRef(null);

  // Función para obtener todos los usuarios
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener usuarios");
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchTurnos = async () => {
    try {
      setGlobalLoading(true);
      setLoadingText("Cargando turnos...");
      
      const res = await fetch(`${API_URL}/turnos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Error al obtener turnos", "error");
        throw new Error(data.error || "Error al obtener turnos");
      }
      setTurnos(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  // Función para obtener especialistas
  const fetchEspecialistas = async () => {
    try {
      console.log("🟡 Iniciando fetchEspecialistas...");
      const currentToken = useAuthStore.getState().token;
      console.log(
        "🟡 Token para especialistas:",
        currentToken ? "✅ Existe" : "❌ No existe"
      );

      const res = await fetch(`${API_URL}/especialistas`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      console.log("🟡 Response status:", res.status);

      if (res.status === 401) {
        console.log("🔴 Token expirado en fetchEspecialistas");
        useAuthStore.getState().logout();
        throw new Error("Sesión expirada. Por favor ingresa nuevamente");
      }

      const response = await res.json();
      console.log("🟡 Respuesta de especialistas:", response);

      if (!res.ok)
        throw new Error(response.error || "Error al obtener especialistas");

      setEspecialistas(response.data || []);
      console.log("🟢 Especialistas cargados:", response.data?.length || 0);
    } catch (err) {
      console.error("🔴 ERROR CRÍTICO en fetchEspecialistas:", err.message);
      setError(err.message);
      setEspecialistas([]);
    }
  };

  const fetchPacientes = async () => {
    try {
      setGlobalLoading(true);
      setLoadingText("Cargando pacientes...");
      console.log("🟡 Fetching pacientes...");

      const res = await fetch(`${API_URL}/pacientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🟡 Response status:", res.status);
      const data = await res.json();
      console.log("🟡 Respuesta COMPLETA:", JSON.stringify(data, null, 2));

      if (!res.ok) throw new Error(data.error || "Error al obtener pacientes");

      // DEBUG: Verifica exactamente qué viene
      console.log("🟡 data.data:", data.data);
      console.log("🟡 data.pacientes:", data.pacientes);
      console.log("🟡 data.count:", data.count);
      console.log("🟡 Tipo de data.data:", typeof data.data);
      console.log("🟡 Es array?", Array.isArray(data.data));

      setPacientes(data.data);
    } catch (err) {
      console.error("❌ Error fetching pacientes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const fetchAntecedentes = async () => {
    try {
      setGlobalLoading(true);
      setLoadingText("Cargando antecedentes...");
      
      const res = await fetch(`${API_URL}/antecedentes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al obtener antecedentes");
      setAntecedentesOptions(data.data);
    } catch (err) {
      console.error("Error fetching antecedentes:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Función para crear turno
  const createTurno = async (turnoData) => {
    try {
      setGlobalLoading(true);
      setLoadingText("Creando turno...");
      
      const res = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...turnoData,
          userId: user._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear turno");

      setShowCreateTurnoModal(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const createPaciente = async (pacienteData) => {
    try {
      setGlobalLoading(true);
      setLoadingText("Creando paciente...");

      const {
        fullName,
        fechaDeNacimiento,
        userId,
        partnerId,
        ...antecedentesData
      } = pacienteData;

      const bodyToSend = {
        fullName,
        fechaDeNacimiento,
        userId: userId || null,
        partnerId: partnerId || null,
        ...antecedentesData,
      };

      const res = await fetch(`${API_URL}/antecedentes/completo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear paciente");

      await fetchPacientes();
      setShowCreateModal(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const updatePaciente = async (id, pacienteData) => {
    try {
      setGlobalLoading(true);
      setLoadingText("Actualizando paciente...");
      
      const res = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pacienteData),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al actualizar paciente");
      await fetchPacientes();
      setSelectedPaciente(null);
      await fetchPacientes();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const updateDatosClinicos = async (id, datosClinicos) => {
    try {
      setGlobalLoading(true);
      setLoadingText("Actualizando datos clínicos...");
      
      const res = await fetch(`${API_URL}/pacientes/medico/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosClinicos),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al actualizar datos clínicos");
      await fetchPacientes();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setGlobalLoading(false);
    }
  };

  const filterPacientes = (list) =>
    list.filter(
      (paciente) =>
        paciente.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (paciente.userId?.email &&
          paciente.userId.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

  const filterUsers = (list) =>
    list.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQueryUsers.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQueryUsers.toLowerCase())
    );

  const loadMorePacientes = () => {
    setVisiblePacientesCount((prev) => prev + 10);
  };

  const loadMoreUsers = () => {
    setVisibleUsersCount((prev) => prev + 10);
  };

  const handleCreateTurnoClick = (paciente) => {
    setPacienteForTurno(paciente);
    setShowCreateTurnoModal(true);
  };

  useEffect(() => {
    console.log("🏁 Iniciando carga de datos...");
    
    const loadAllData = async () => {
      setGlobalLoading(true);
      setLoadingText("Cargando datos de pacientes...");
      
      try {
        await Promise.all([
          fetchPacientes(),
          fetchAntecedentes(),
          fetchAllUsers(),
          fetchEspecialistas()
        ]);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setGlobalLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    setVisiblePacientesCount(10);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleUsersCount(10);
  }, [searchQueryUsers]);

  // GSAP Animation - CORREGIDO
  useEffect(() => {
    if (hasAnimated.current || loading || pacientes.length === 0) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animación del contenedor principal
    if (pacientesContainerRef.current) {
      tl.fromTo(
        pacientesContainerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }

    // Animación del header
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.3"
      );
    }

    // Animación de títulos
    if (pacientesTitleRef.current) {
      tl.fromTo(
        pacientesTitleRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.2"
      );
    }

    // Animación de tabla de pacientes
    if (pacientesTableRef.current) {
      tl.fromTo(
        pacientesTableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.2"
      );
    }

    // Animación de título de usuarios
    if (usuariosTitleRef.current) {
      tl.fromTo(
        usuariosTitleRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.1"
      );
    }

    // Animación de tabla de usuarios
    if (usuariosTableRef.current) {
      tl.fromTo(
        usuariosTableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.1"
      );
    }

    // Animación de botones "Ver más"
    const verMasButtons = document.querySelectorAll(".ver-mas-btn");
    if (verMasButtons.length > 0) {
      tl.fromTo(
        verMasButtons,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 },
        "-=0.1"
      );
    }

    return () => {
      tl.kill();
    };
  }, [loading, pacientes.length]);

  const filteredPacientes = filterPacientes(pacientes).slice(
    0,
    visiblePacientesCount
  );
  console.log("📊 Total pacientes:", pacientes.length);
  console.log("🔍 Pacientes filtrados:", filteredPacientes.length);
  console.log("👀 Pacientes visibles:", visiblePacientesCount);

  const filteredUsers = filterUsers(allUsers).slice(0, visibleUsersCount);
  const hasMorePacientes =
    filterPacientes(pacientes).length > visiblePacientesCount;
  const hasMoreUsers = filterUsers(allUsers).length > visibleUsersCount;

  return (
    <div className="pacientes">
      {/* Loader global - se mostrará automáticamente cuando isLoading sea true */}
      <GlobalLoader />

      <NavDashboard />
      <div className="pacientes-container" ref={pacientesContainerRef}>
        <div ref={headerRef}>
          <PacientesHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddPaciente={() => setShowCreateModal(true)}
            canAdd={user.isAdmin || user.isMedico}
          />
        </div>

        <h2 ref={pacientesTitleRef}>Todos los pacientes</h2>

        <div ref={pacientesTableRef}>
          <div className="table-container">
            <TablaPacientes
              pacientes={filteredPacientes}
              onViewDetails={setSelectedPaciente}
              canEdit={user.isAdmin || user.isMedico || user.isPartner}
              refreshData={fetchPacientes}
              onCreateTurno={handleCreateTurnoClick}
            />
            {hasMorePacientes && (
              <div className="ver-mas-container-pacientes">
                <button onClick={loadMorePacientes} className="ver-mas-btn">
                  Ver más pacientes
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 ref={usuariosTitleRef}>Todos los Usuarios</h2>

        <div className="search-container" style={{ marginBottom: "1rem" }}>
          <button className="search-icon-btn">
            <svg
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.167 15.833A6.667 6.667 0 109.167 2.5a6.667 6.667 0 000 13.333zM17.5 17.5l-3.625-3.625"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchQueryUsers}
            onChange={(e) => setSearchQueryUsers(e.target.value)}
            className="input-search"
          />
        </div>

        <div ref={usuariosTableRef}>
          <div className="table-container">
            <TablaTodosUsuarios
              users={filteredUsers}
              onCreatePaciente={(user) => {
                setUserToConvert(user);
                setShowCreateModal(true);
              }}
            />
            {hasMoreUsers && (
              <div className="ver-mas-container-usuarios">
                <button onClick={loadMoreUsers} className="ver-mas-btn">
                  Ver más usuarios
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <ModalCrearPaciente
          antecedentesOptions={antecedentesOptions}
          onClose={() => {
            setShowCreateModal(false);
            setUserToConvert(null);
          }}
          onCreate={createPaciente}
          currentUser={user}
          userToConvert={userToConvert}
        />
      )}

      {selectedPaciente && (
        <ModalDetallesPaciente
          paciente={selectedPaciente}
          antecedentesOptions={antecedentesOptions}
          onClose={() => setSelectedPaciente(null)}
          onUpdate={updatePaciente}
          onUpdateDatosClinicos={updateDatosClinicos}
          isMedico={user.isMedico}
          isAdmin={user.isAdmin}
          isPartner={user.isPartner}
          token={token}
        />
      )}

      {showCreateTurnoModal && pacienteForTurno && (
        <NuevoTurnoModal
          pacienteForTurno={pacienteForTurno}
          especialistas={especialistas}
          onClose={() => setShowCreateTurnoModal(false)}
          onCreate={fetchPacientes}
          token={token}
          currentUser={user}
          isAdminOrMedico={user.isAdmin || user.isMedico}
        />
      )}
    </div>
  );
};

export default Pacientes;