import { Router } from "express";
import multer from "multer";

import { uploadRecipientsCsv } from "../controllers/csv.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      callback(
        new Error("Only CSV files are allowed")
      );
      return;
    }

    callback(null, true);
  },
});

router.post(
  "/:campaignId/upload",
  upload.single("file"),
  uploadRecipientsCsv
);

export default router;
