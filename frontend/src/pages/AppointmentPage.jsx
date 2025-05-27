import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { LogoutLink } from '../App'; // Import LogoutLink

function AppointmentPage() {
  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState(''); // Could pre-fill from logged-in user
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user info to pre-fill owner name (optional)
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.email) {
      // You might want a dedicated name field in the User model later
      setOwnerName(userInfo.email.split('@')[0]); // Simple prefill based on email
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ title: "Erro de Autenticação", description: "Faça login novamente.", variant: "destructive" });
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const appointmentData = {
        petName,
        ownerName,
        appointmentDate,
        appointmentTime,
        serviceType,
        notes,
      };

      // Make API call to backend endpoint
      await axios.post('/api/appointments', appointmentData, config);

      setIsLoading(false);
      toast({ title: "Sucesso!", description: "Agendamento solicitado com sucesso!" });

      // Clear form fields after submission
      setPetName('');
      // Keep owner name potentially
      setAppointmentDate('');
      setAppointmentTime('');
      setServiceType('');
      setNotes('');

      // Optionally navigate to a confirmation or 'my appointments' page
      // navigate('/minhas-consultas');

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Erro ao solicitar agendamento.';
      console.error("Appointment error:", error.response || error);
      toast({ title: "Erro no Agendamento", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header based on the second image */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <img src="/images/puppy.png" alt="Pet Shop Logo" className="h-12 w-auto" />
        <nav className="space-x-4">
          {/* Link to view user's own appointments (needs implementation) */}
          {/* <Link to="/minhas-consultas" className="text-gray-700 hover:text-blue-600 font-medium">Minhas Consultas</Link> */}
          <span className="text-gray-700 font-medium">Agendar consulta</span> {/* Current page indicator */}
          <LogoutLink /> {/* Use LogoutLink component */}
        </nav>
      </header>

      {/* Appointment Form */}
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Agendar Consulta</h1>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          {/* Form fields remain the same */}
          <div className="mb-4">
            <label htmlFor="petName" className="block text-gray-700 text-sm font-bold mb-2">Nome do Pet</label>
            <input
              type="text"
              id="petName"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="ownerName" className="block text-gray-700 text-sm font-bold mb-2">Nome do Dono</label>
            <input
              type="text"
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-bold mb-2">Data</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="appointmentTime" className="block text-gray-700 text-sm font-bold mb-2">Hora</label>
              <input
                type="time"
                id="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="serviceType" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Serviço</label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isLoading}
            >
              <option value="">Selecione um serviço</option>
              <option value="Consulta Geral">Consulta Geral</option>
              <option value="Vacinação">Vacinação</option>
              <option value="Banho e Tosa">Banho e Tosa</option>
              <option value="Exames">Exames</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">Observações Adicionais</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            ></textarea>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </main>

      <footer className="text-center text-gray-500 text-xs p-4">
        &copy;2025 PetShop Luxo. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default AppointmentPage;

