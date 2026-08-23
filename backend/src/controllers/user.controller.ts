import { Request, Response } from "express";

import {
  createUserService,
  getUserByIdService,
  getUserByEmailService,
  getAllUsersService,
  updateUserService,
  deleteUserService,
} from "../services/user.service";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, googleId, avatarUrl } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const user = await createUserService({
      name,
      email,
      googleId,
      avatarUrl,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error: any) {
    console.error("Create user error:", error);

    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
   const id = req.params.id;

if (!id || Array.isArray(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID",
  });
}

    const user = await getUserByIdService(id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await getUserByEmailService(email);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Get user by email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

if (!id || Array.isArray(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID",
  });
}

    const { name, avatarUrl } = req.body;

    if (!name && !avatarUrl) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    const user = await updateUserService(id, {
      name,
      avatarUrl,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
   const id = req.params.id;

if (!id || Array.isArray(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID",
  });
}

    await deleteUserService(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};