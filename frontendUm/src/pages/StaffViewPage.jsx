import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { LogoutLink } from '../App'; // Import LogoutLink

function StaffViewPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast({ title: "Erro de Autenticação", description: "Faça login novamente.", variant: "destructive" });
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch appointments from the backend API
        const { data } = await axios.get('/api/appointments', config);
        setAppointments(data);

      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        const errorMessage = err.response && err.response.status === 403
          ? "Você não tem permissão para ver esta página."
          : "Não foi possível carregar os agendamentos. Tente novamente mais tarde.";
        setError(errorMessage);
        toast({ title: "Erro ao Carregar Dados", description: errorMessage, variant: "destructive" });
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            // Optional: Clear token and redirect if unauthorized/forbidden
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userInfo');
            // navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, toast]);

  // Function to format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header similar to AppointmentPage */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <img src="/images/puppy.png" alt="Pet Shop Logo" className="h-12 w-auto" />
        <h1 className="text-xl font-semibold text-gray-700">Painel do Funcionário</h1>
        <nav>
          <LogoutLink /> {/* Use LogoutLink component */}
        </nav>
      </header>

      {/* Appointments List */}
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Consultas Agendadas</h2>

        {isLoading && <p className="text-center text-gray-600">Carregando agendamentos...</p>}
        {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

        {!isLoading && !error && (
          <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
            {appointments.length === 0 ? (
              <p className="text-center text-gray-600">Nenhuma consulta agendada no momento.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dono</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                    {/* Optional: Add column for actions like 'Confirmar', 'Cancelar' */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appt) => (
                    <tr key={appt._id}> {/* Use _id from MongoDB */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appt.petName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.ownerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(appt.appointmentDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.appointmentTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.serviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{appt.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-gray-500 text-xs p-4 mt-8">
        &copy;2025 PetShop Luxo. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default StaffViewPage;

