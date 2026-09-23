import express from "express";
import servicesRouter from "./routes/services.router.js";
import bookingsRouter from "./routes/bookings.router.js";

const app = express();

// Middlewares para interpretar el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API del Sistema Backend de Turnos y Reservas",
    resources: ["/api/services", "/api/bookings"],
  });
});

// Routers de los recursos
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);

// Rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ status: "error", error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

// Manejador global de errores
app.use((error, req, res, next) => {
  // JSON mal formado en el body
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ status: "error", error: "El body no es un JSON válido" });
  }
  // Errores de dominio (ValidationError -> 400, NotFoundError -> 404)
  if (error.statusCode) {
    const body = { status: "error", error: error.message };
    if (error.details?.length) body.details = error.details;
    return res.status(error.statusCode).json(body);
  }
  console.error(error);
  return res.status(500).json({ status: "error", error: "Error interno del servidor" });
});

export default app;
