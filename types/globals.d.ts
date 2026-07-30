export {};

export type Roles =
  | "ADMIN"
  | "NURSE"
  | "DOCTOR"
  | "LAB_TECHNICIAN"
  | "PATIENT"
  | "CASHIER";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

