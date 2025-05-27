const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { protect, authorize } = require("../middleware/authMiddleware");

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (User)
router.post("/", protect, authorize("user", "admin"), async (req, res) => {
  const {
    petName,
    ownerName, // Consider fetching owner name from logged-in user (req.user) if applicable
    appointmentDate,
    appointmentTime,
    serviceType,
    notes,
  } = req.body;

  // Basic validation
  if (!petName || !ownerName || !appointmentDate || !appointmentTime || !serviceType) {
    return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
  }

  try {
    const appointment = new Appointment({
      userId: req.user._id, // Link appointment to the logged-in user
      petName,
      ownerName: ownerName || req.user.email, // Use provided name or user email as fallback
      appointmentDate,
      appointmentTime,
      serviceType,
      notes,
      // Status defaults to "Agendado"
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({ message: "Erro do servidor ao criar agendamento", error: error.message });
  }
});

// @desc    Get all appointments (for staff/admin)
// @route   GET /api/appointments
// @access  Private (Staff, Admin)
router.get("/", protect, authorize("staff", "admin"), async (req, res) => {
  try {
    // Fetch all appointments, potentially populate user info if needed
    // Sort by date, newest first
    const appointments = await Appointment.find({}).populate("userId", "email").sort({ fullAppointmentDateTime: -1 }); // Sort by virtual field if needed
    // const appointments = await Appointment.find({}).populate("userId", "email").sort({ appointmentDate: -1, appointmentTime: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ message: "Erro do servidor ao buscar agendamentos", error: error.message });
  }
});

// @desc    Get appointments for the logged-in user
// @route   GET /api/appointments/myappointments
// @access  Private (User)
router.get("/myappointments", protect, authorize("user", "admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id }).sort({ appointmentDate: -1, appointmentTime: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar meus agendamentos:", error);
    res.status(500).json({ message: "Erro do servidor ao buscar seus agendamentos", error: error.message });
  }
});

// @desc    Update appointment status (for staff/admin)
// @route   PUT /api/appointments/:id/status
// @access  Private (Staff, Admin)
router.put("/:id/status", protect, authorize("staff", "admin"), async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["Agendado", "Confirmado", "Cancelado", "Concluído"];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Status inválido fornecido." });
    }

    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }

        appointment.status = status;
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);

    } catch (error) {
        console.error("Erro ao atualizar status do agendamento:", error);
        // Handle potential CastError if ID format is wrong
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "ID de agendamento inválido." });
        }
        res.status(500).json({ message: "Erro do servidor ao atualizar status do agendamento", error: error.message });
    }
});


// Optional: Add routes for getting a single appointment by ID, updating, or deleting

module.exports = router;

