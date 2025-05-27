import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast is set up

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Make API call to backend login endpoint
      const { data } = await axios.post(
        '/api/auth/login', // Ensure proxy is set up in package.json or use full URL
        { email, password },
        config
      );

      // Store token and user info in localStorage (or context/state management)
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify({ email: data.email, role: data.role, id: data._id }));

      setIsLoading(false);
      toast({ title: "Login bem-sucedido!", description: "Redirecionando..." });

      // Redirect based on role
      if (data.role === 'staff' || data.role === 'admin') {
        navigate('/consultas-funcionario');
      } else {
        navigate('/agendar');
      }

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Erro ao fazer login. Verifique suas credenciais.';
      console.error("Login error:", error.response || error);
      toast({ title: "Erro de Login", description: errorMessage, variant: "destructive" });
      // Clear password field on error
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <img src="/images/puppy.png" alt="Pet Shop Logo" className="w-32 h-32 mb-8" />
      <div className="w-full max-w-xs">
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email User
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy;2025 PetShop Luxo. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

