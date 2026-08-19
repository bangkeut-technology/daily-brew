/**
 * A physical card an employee taps at a kiosk. `publicId` is the identifier
 * signed into the card itself — the card's, not the employee's, so a
 * replacement for a lost card is a distinguishable credential.
 */
export interface EmployeeCard {
  publicId: string;
  label: string;
  employeePublicId: string;
  employeeName: string | null;
  notBefore: string;
  notAfter: string;
  createdAt: string;
  issuedByEmail: string | null;
  revokedAt: string | null;
  revokedByEmail: string | null;
  revokeReason: string | null;
}

export interface EmployeeCardIssueResult {
  card: EmployeeCard;
  /** Returned once, at issue. Never stored server-side — write it to the tag now. */
  pass: {
    base64Url: string;
    bytes: string;
  };
}
