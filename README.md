# 🐾 PetShop App

Sistema completo de gerenciamento para pet shop com frontend React e backend Node.js.

## 📋 Descrição

O PetShop App é uma aplicação web completa desenvolvida para gerenciar um pet shop, incluindo agendamento de consultas, autenticação de usuários e interface administrativa para funcionários.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool e bundler
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de UI modernos
- **React Router** - Roteamento da aplicação

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação e autorização
- **bcrypt** - Criptografia de senhas

## 📁 Estrutura do Projeto

```
petshop-app/
├── backend/                 # Servidor Node.js/Express
│   ├── middleware/         # Middlewares de autenticação
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Rotas da API
│   └── server.js          # Arquivo principal do servidor
├── frontendUm/            # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   └── hooks/         # Custom hooks
│   └── public/            # Arquivos estáticos
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- MongoDB instalado e rodando

### Backend

1. Navegue para a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/petshop
JWT_SECRET=sua_chave_secreta_aqui
```

4. Execute o servidor:
```bash
npm start
```

### Frontend

1. Navegue para a pasta do frontend:
```bash
cd frontendUm
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a aplicação em modo de desenvolvimento:
```bash
npm run dev
```

## 📱 Funcionalidades

### Para Clientes
- ✅ Agendamento de consultas
- ✅ Visualização de histórico de agendamentos
- ✅ Interface responsiva e intuitiva

### Para Funcionários
- ✅ Dashboard administrativo
- ✅ Gerenciamento de agendamentos
- ✅ Visualização de todos os clientes
- ✅ Sistema de autenticação seguro

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:
- Tokens são armazenados no localStorage
- Middleware de autenticação protege rotas sensíveis
- Senhas são criptografadas com bcrypt

## 🎨 Interface

A interface foi desenvolvida com foco na experiência do usuário:
- Design moderno e responsivo
- Componentes reutilizáveis
- Navegação intuitiva
- Feedback visual para ações do usuário

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Deletar agendamento

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Daniel Alves** - Desenvolvedor Full Stack

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do email ou abra uma issue no repositório.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!