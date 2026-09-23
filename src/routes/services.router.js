import { Router } from "express";
import ServiceManager from "../managers/ServiceManager.js";
import envConfig from "../config/env.config.js";

const router = Router();
const serviceManager = new ServiceManager(envConfig.SERVICES_FILE);

// GET /api/services -> devuelve todos los servicios
// Filtros opcionales por query params: ?category=salud  ?available=true
router.get("/", async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const filters = {};

    if (category !== undefined) {
      if (typeof category !== "string" || category.trim() === "") {
        return res.status(400).json({ status: "error", error: "El filtro category debe ser un texto no vacío" });
      }
      filters.category = category;
    }
    if (available !== undefined) {
      if (available !== "true" && available !== "false") {
        return res.status(400).json({ status: "error", error: "El filtro available solo acepta true o false" });
      }
      filters.available = available === "true";
    }

    const services = await serviceManager.getServices(filters);
    return res.status(200).json({ status: "success", count: services.length, payload: services });
  } catch (error) {
    return next(error);
  }
});

// GET /api/services/:sid -> devuelve un servicio por id
router.get("/:sid", async (req, res, next) => {
  try {
    const { sid } = req.params;
    const service = await serviceManager.getServiceById(sid);
    if (!service) {
      return res.status(404).json({ status: "error", error: `No existe un servicio con id ${sid}` });
    }
    return res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    return next(error);
  }
});

// POST /api/services -> crea un servicio (el id se genera internamente)
router.post("/", async (req, res, next) => {
  try {
    const newService = await serviceManager.addService(req.body);
    return res.status(201).json({ status: "success", message: "Servicio creado", payload: newService });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/services/:sid -> actualiza un servicio (el id no se puede modificar)
router.put("/:sid", async (req, res, next) => {
  try {
    const { sid } = req.params;
    const updated = await serviceManager.updateService(sid, req.body);
    if (!updated) {
      return res.status(404).json({ status: "error", error: `No existe un servicio con id ${sid}` });
    }
    return res.status(200).json({ status: "success", message: "Servicio actualizado", payload: updated });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/services/:sid -> elimina un servicio
router.delete("/:sid", async (req, res, next) => {
  try {
    const { sid } = req.params;
    const deleted = await serviceManager.deleteService(sid);
    if (!deleted) {
      return res.status(404).json({ status: "error", error: `No existe un servicio con id ${sid}` });
    }
    return res.status(200).json({ status: "success", message: "Servicio eliminado", payload: deleted });
  } catch (error) {
    return next(error);
  }
});

export default router;
