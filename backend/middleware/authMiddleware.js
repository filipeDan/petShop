const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware para proteger rotas que exigem autenticação
const protect = async (req, res, next) => {
  let token;

  // Verifica se o token está no header Authorization e começa com Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extrai o token do header (Bearer tokenstring)
      token = req.headers.authorization.split(" ")[1];

      // Verifica e decodifica o token usando o segredo JWT
      const decoded = jwt.verify(token, process.env.DB_PASS);

      // Encontra o usuário pelo ID contido no token e anexa ao request
      // Exclui o campo password da busca
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
          return res.status(401).json({ message: "Usuário não encontrado, token falhou" });
      }

      next(); // Prossegue para a próxima função de middleware ou rota
    } catch (error) {
      console.error("Erro na autenticação do token:", error);
      res.status(401).json({ message: "Não autorizado, token falhou" });
    }
  }

  // Se não houver token no header
  if (!token) {
    res.status(401).json({ message: "Não autorizado, nenhum token fornecido" });
  }
};

// Middleware para verificar se o usuário tem uma role específica (ex: staff, admin)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Não autorizado para acessar esta rota" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Usuário com role '${req.user.role}' não tem permissão para acessar esta rota` });
    }
    next();
  };
};

module.exports = { protect, authorize };

