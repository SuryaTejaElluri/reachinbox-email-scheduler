export const isValidEmail = (email: string): boolean => {
  const value = email.trim().toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
