const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // File system module

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/references");
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files to uploads/references directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Por favor, envie apenas arquivos de imagem (jpeg, png, gif, etc)."), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

const sendEmail = require("../services/emailService");

// Mocked Appointment model (in a real app, this would be a Mongoose model)
// For simplicity, we'll store appointments in memory.
// In a real app, use a database and create an Appointment schema.
let appointmentsStore = []; 
let nextAppointmentId = 1;

// @route   GET /api/appointments/slots
// @desc    Get available appointment slots for a given date
// @access  Private (User needs to be logged in)
router.get("/slots", protect, (req, res) => {
  const { date, serviceId } = req.query; // date in YYYY-MM-DD format

  if (!date) {
    return res.status(400).json({ success: false, message: "Por favor, forneça uma data para verificar os horários." });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: "Formato de data inválido. Use YYYY-MM-DD." });
  }

  const openingHour = 9; 
  const closingHour = 18;
  const slotInterval = 30; 
  const availableSlots = [];

  let currentTime = new Date(`${date}T00:00:00.000Z`);
  currentTime.setUTCHours(openingHour, 0, 0, 0);
  
  const closingTime = new Date(`${date}T00:00:00.000Z`);
  closingTime.setUTCHours(closingHour, 0, 0, 0);

  while (currentTime < closingTime) {
    const hours = currentTime.getUTCHours().toString().padStart(2, '0');
    const minutes = currentTime.getUTCMinutes().toString().padStart(2, '0');
    const slotTime = `${hours}:${minutes}`;

    // Check if this slot is already booked for the given date
    const isBooked = appointmentsStore.some(appt => appt.date === date && appt.time === slotTime);
    if (!isBooked) {
        availableSlots.push(slotTime);
    }
    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + slotInterval);
  }

  res.status(200).json({
    success: true,
    message: `Horários disponíveis para ${date}:`,
    data: availableSlots,
  });
});

// @route   POST /api/appointments/book
// @desc    Book a new appointment with optional image upload
// @access  Private
router.post("/book", protect, upload.single("referenceImage"), async (req, res) => {
  const { serviceId, serviceName, date, time } = req.body;
  const userId = req.user.id; // From protect middleware
  const userEmail = req.user.email;

  if (!serviceId || !serviceName || !date || !time) {
    return res.status(400).json({ success: false, message: "Campos obrigatórios ausentes: serviceId, serviceName, date, time." });
  }
  
  // Basic validation for date and time format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: "Formato de data inválido. Use YYYY-MM-DD." });
  }
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return res.status(400).json({ success: false, message: "Formato de hora inválido. Use HH:MM." });
  }

  // Check if slot is already taken (simple check, can be more robust)
  const existingAppointment = appointmentsStore.find(appt => appt.date === date && appt.time === time);
  if (existingAppointment) {
    return res.status(409).json({ success: false, message: "Este horário já está agendado. Por favor, escolha outro." });
  }

  const newAppointment = {
    id: nextAppointmentId++,
    userId,
    userEmail,
    serviceId,
    serviceName,
    date,
    time,
    referenceImage: req.file ? `/uploads/references/${req.file.filename}` : null, // Path to uploaded image
    status: "Agendado",
    createdAt: new Date(),
  };

  appointmentsStore.push(newAppointment);

  // Send confirmation email
  const emailMessage = `
    <h2>Olá ${userEmail},</h2>
    <p>Seu agendamento na Barbearia Top foi confirmado com sucesso!</p>
    <p><strong>Detalhes do Agendamento:</strong></p>
    <ul>
      <li>Serviço: ${newAppointment.serviceName}</li>
      <li>Data: ${new Date(newAppointment.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</li>
      <li>Hora: ${newAppointment.time}</li>
    </ul>
    ${newAppointment.referenceImage ? `<p>Imagem de referência enviada: <a href="${process.env.API_BASE_URL}${newAppointment.referenceImage}">Ver Imagem</a></p>` : ""}
    <p>Caso precise cancelar ou reagendar, entre em contato conosco.</p>
    <br>
    <p>Atenciosamente,</p>
    <p>Equipe Barbearia Top</p>
  `;

  try {
    await sendEmail({
      email: userEmail,
      subject: "Confirmação de Agendamento - Barbearia Top",
      html: emailMessage,
    });
    console.log(`Email de confirmação de agendamento enviado para ${userEmail}`);
  } catch (emailError) {
    console.error("Erro ao enviar email de confirmação de agendamento:", emailError);
    // Log the error, but don't fail the appointment booking itself if email fails
    // The main response will still indicate successful booking.
    // Optionally, add a note to the user that email confirmation might be delayed.
  }

  res.status(201).json({
    success: true,
    message: "Agendamento realizado com sucesso! Um email de confirmação foi enviado.",
    data: newAppointment,
  });
});

// @route   GET /api/appointments/my-appointments
// @desc    Get all appointments for the logged-in user
// @access  Private
router.get("/my-appointments", protect, (req, res) => {
    const userId = req.user.id;
    const userAppointments = appointmentsStore.filter(appt => appt.userId === userId);
    res.status(200).json({
        success: true,
        count: userAppointments.length,
        data: userAppointments
    });
});


module.exports = router;

