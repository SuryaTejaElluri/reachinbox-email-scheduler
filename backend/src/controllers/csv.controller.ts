import { Request, Response } from "express";

import { importRecipientsFromCsvService } from "../services/csv.service";

export const uploadRecipientsCsv = async (
  req: Request,
  res: Response
) => {
  try {
    const campaignId =
      typeof req.params.campaignId === "string"
        ? req.params.campaignId
        : undefined;

    const userId =
      typeof req.body.userId === "string"
        ? req.body.userId
        : undefined;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const result =
      await importRecipientsFromCsvService({
        campaignId,
        userId,
        buffer: req.file.buffer,
      });

    return res.status(201).json({
      success: true,
      message: "CSV recipients imported successfully",
      campaignId,
      ...result,
    });
  } catch (error) {
    console.error(
      "CSV upload error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to import CSV";

    if (
      message === "Campaign not found"
    ) {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message ===
      "Unauthorized campaign access"
    ) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
};
