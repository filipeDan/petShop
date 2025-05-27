const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email é obrigatório"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Por favor, use um email válido."],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Senha é obrigatória"],
    minlength: [6, "Senha deve ter pelo menos 6 caracteres"],
    select: false, // Não retorna a senha por padrão nas queries
  },
  role: {
    type: String,
    enum: ["user", "staff", "admin"], // Define roles permitidas
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para criptografar a senha antes de salvar
UserSchema.pre("save", async function (next) {
  // Só criptografa a senha se ela foi modificada (ou é nova)
  if (!this.isModified("password")) {
    return next();
  }
  // Gera o salt e criptografa a senha
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar a senha fornecida com a senha no banco de dados
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

