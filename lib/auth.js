import jwt from "jsonwebtoken";
import cookie from "cookie";

const SECRET = process.env.SESSION_SECRET || "dev-secret-degistir";
const COOKIE_NAME = "genc_ihh_oturum";

export function createSessionCookie(payload) {
  const token = jwt.sign(payload, SECRET, { expiresIn: "30d" });
  return cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  return cookie.serialize(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// req üzerinden geçerli oturumu okur: { role: "il"|"admin", il?: string, kullaniciAdi?: string }
export function getSession(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// API route'larını korumak için: requireRole(handler, "admin"|"il")
export function requireRole(handler, role) {
  return async (req, res) => {
    const session = getSession(req);
    if (!session || (role && session.role !== role)) {
      return res.status(401).json({ error: "Yetkisiz erişim. Lütfen giriş yapın." });
    }
    req.session = session;
    return handler(req, res);
  };
}

export { COOKIE_NAME };
