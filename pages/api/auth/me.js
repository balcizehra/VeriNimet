import { getSession } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(200).json({ session: null });
  res.status(200).json({ session });
}
