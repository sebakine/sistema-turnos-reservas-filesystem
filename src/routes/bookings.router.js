import { Router } from "express";
import ServiceManager from "../managers/ServiceManager.js";
import BookingManager from "../managers/BookingManager.js";
import envConfig from "../config/env.config.js";

const router = Router();
const serviceManager = new ServiceManager(envConfig.SERVICES_FILE);
const bookingManager = new BookingManager(envConfig.BOOKINGS_FILE, serviceManager);

// GET /api/bookings -> devuelve todas las reservas (ruta de apoyo)
router.get("/", async (req, res, next) => {
  try {
    const bookings = await bookingManager.getBookings();
    return res.status(200).json({ status: "success", count: bookings.length, payload: bookings });
  } catch (error) {
    return next(error);
  }
});

// POST /api/bookings -> crea una reserva (services puede iniciar vacío)
router.post("/", async (req, res, next) => {
  try {
    const newBooking = await bookingManager.createBooking(req.body);
    return res.status(201).json({ status: "success", message: "Reserva creada", payload: newBooking });
  } catch (error) {
    return next(error);
  }
});

// GET /api/bookings/:bid -> devuelve una reserva por id
router.get("/:bid", async (req, res, next) => {
  try {
    const { bid } = req.params;
    const booking = await bookingManager.getBookingById(bid);
    if (!booking) {
      return res.status(404).json({ status: "error", error: `No existe una reserva con id ${bid}` });
    }
    return res.status(200).json({ status: "success", payload: booking });
  } catch (error) {
    return next(error);
  }
});

// POST /api/bookings/:bid/services/:sid -> agrega un servicio a una reserva existente
// Valida que la reserva y el servicio existan; si el servicio ya estaba, incrementa quantity.
router.post("/:bid/services/:sid", async (req, res, next) => {
  try {
    const { bid, sid } = req.params;
    const booking = await bookingManager.addServiceToBooking(bid, sid);
    return res.status(200).json({ status: "success", message: "Servicio agregado a la reserva", payload: booking });
  } catch (error) {
    return next(error);
  }
});

export default router;
