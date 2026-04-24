// Augment the Express Request interface so req.user is fully typed
// across the entire application without casting.

export {};

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
      };
    }
  }
}
