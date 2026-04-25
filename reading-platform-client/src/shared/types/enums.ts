export const Role = {
  ADMIN: "ADMIN",
  AUTHOR: "AUTHOR",
  READER: "READER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
