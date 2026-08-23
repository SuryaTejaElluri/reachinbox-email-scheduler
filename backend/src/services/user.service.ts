import { prisma } from "../config/prisma";

export interface CreateUserData {
  name: string;
  email: string;
  googleId?: string;
  avatarUrl?: string;
}

export const createUserService = async (data: CreateUserData) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const user = await prisma.user.create({
  data: {
    name: data.name,
    email: data.email,
    ...(data.googleId !== undefined && {
      googleId: data.googleId,
    }),
    ...(data.avatarUrl !== undefined && {
      avatarUrl: data.avatarUrl,
    }),
  },
});

  return user;
};

export const getUserByIdService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export const getUserByEmailService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export const getAllUsersService = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateUserService = async (
  id: string,
  data: {
    name?: string;
    avatarUrl?: string;
  }
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteUserService = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.user.delete({
    where: {
      id,
    },
  });
};