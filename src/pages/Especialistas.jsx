import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import NavDashboard from "../components/NavDashboard";
import useNotify from "../hooks/useToast";
import EspecialistasHeader from "../components/Especialistas/EspecialistasHeader";
import EspecialistasTable from "../components/Especialistas/EspecialistasTable";
import EditarEspecialistaModal from "../components/Especialistas/EditarEspecialistaModal";
import "./css/AdminPanel.css";
import API_URL from "../common/constants";

const Especialistas = () => {
  const token = useAuthStore((state) => state.token);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [formEspecialista, setFormEspecialista] = useState({
    especialidad: "",
    matricula: "",
  });

  const notify = useNotify();

  const fetchEspecialistas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/especialistas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Error al obtener especialistas", "error");
        throw new Error(data.error || "Error al obtener especialistas");
      }
      setEspecialistas(data.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEspecialista = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/especialistas/${selectedEspecialista._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formEspecialista),
        }
      );
      const data = await res.json();
      if (!data.success) {
        notify(data.error || "Error al actualizar especialista", "error");
        throw new Error(data.error);
      }

      notify("Especialista actualizado correctamente", "success");
      fetchEspecialistas();
      setSelectedEspecialista(null);
      setFormEspecialista({
        especialidad: "",
        matricula: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterEspecialistas = () => {
    return especialistas.filter((e) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        e.userId?.name?.toLowerCase().includes(query) ||
        e.especialidad.toLowerCase().includes(query);
      return matchesSearch;
    });
  };

  useEffect(() => {
    fetchEspecialistas();
  }, []);

  return (
    <div className="admin">
      <NavDashboard />
      <div className="admin-container">
        <EspecialistasHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <EspecialistasTable
          especialistas={filterEspecialistas()}
          setSelectedEspecialista={setSelectedEspecialista}
          setFormEspecialista={setFormEspecialista}
        />
      </div>
      {selectedEspecialista && (
        <EditarEspecialistaModal
          especialista={selectedEspecialista}
          form={formEspecialista}
          setForm={setFormEspecialista}
          onClose={() => {
            setSelectedEspecialista(null);
            setFormEspecialista({
              especialidad: "",
              matricula: "",
            });
          }}
          onSave={handleUpdateEspecialista}
        />
      )}
    </div>
  );
};

export default Especialistas;