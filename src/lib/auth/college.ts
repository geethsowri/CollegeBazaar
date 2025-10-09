const DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export function isCollegeEmail(email: string) {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase();
  if (DOMAINS.length === 0) return /\.(edu|ac\.in|edu\.in)$/i.test(domain);
  return DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}
