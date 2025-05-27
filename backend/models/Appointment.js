const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  petName: {
    type: String,
    required: [true, "Nome do pet é obrigatório"],
    trim: true,
  },
  ownerName: { // Redundant if linked to user, but kept for simplicity based on form
    type: String,
    required: [true, "Nome do dono é obrigatório"],
    trim: true,
  },
  appointmentDate: {
    type: Date,
    required: [true, "Data do agendamento é obrigatória"],
  },
  appointmentTime: { // Store time separately or combine with date into a single ISODate
    type: String, // Storing as string HH:MM for simplicity
    required: [true, "Hora do agendamento é obrigatória"],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"],
  },
  serviceType: {
    type: String,
    required: [true, "Tipo de serviço é obrigatório"],
    enum: ["Consulta Geral", "Vacinação", "Banho e Tosa", "Exames", "Outro"], // Match frontend options
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["Agendado", "Confirmado", "Cancelado", "Concluído"],
    default: "Agendado",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Combine date and time before saving for easier sorting/querying if needed
// Or create a virtual property for the full datetime
AppointmentSchema.virtual("fullAppointmentDateTime").get(function() {
  if (this.appointmentDate && this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(":");
    const date = new Date(this.appointmentDate);
    date.setUTCHours(parseInt(hours, 10));
    date.setUTCMinutes(parseInt(minutes, 10));
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
  }
  return null;
});

// Ensure virtual fields are included when converting to JSON/Object
AppointmentSchema.set("toJSON", { virtuals: true });
AppointmentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);

