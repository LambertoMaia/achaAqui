// services/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Auth service (front-ready)
 * - tenta chamar o backend (fetch)
 * - em dev, tem fallback local usando AsyncStorage (somente para protótipo)
 * - persiste token + user em STORAGE_AUTH_KEY
 *
 * Ajuste BASE_URL para o endpoint real do backend quando estiver disponível.
 */

/* ====== CONFIG ====== */
const BASE_URL = "https://seu-backend.exemplo/api"; // <- troque quando o backend estiver pronto
export const STORAGE_AUTH_KEY = "@my_app_auth_v1"; // persist token + user
export const STORAGE_USER_KEY = "@my_app_user_v1"; // fallback local (dev only)

/* ====== TIPOS ====== */
export type UserPublic = { nome: string; email: string; role?: string };
export type LoginRequest = { email: string; senha: string };
export type LoginResponse = { token: string; user: UserPublic };

export type RegisterRequest = { nome: string; email: string; senha: string; cep?: string };
export type RegisterResponse = LoginResponse;

/* ====== UTIL ====== */
function isNetworkErrorMessage(msg: string) {
  const s = msg?.toLowerCase() ?? "";
  return s.includes("network request failed") || s.includes("failed to fetch") || s.includes("network error");
}

/* ====== BACKEND CALLS ====== */

/**
 * Tenta logar no backend.
 * ESPERADO: POST /auth/login -> 200 { token, user: { nome, email, role? } }
 * lança erro com message para o chamador.
 */
export async function loginBackend(payload: LoginRequest): Promise<LoginResponse> {
  const url = `${BASE_URL.replace(/\/$/, "")}/auth/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: payload.email, senha: payload.senha }),
  });

  if (res.ok) {
    const data = await res.json().catch(() => null);
    if (!data || !data.token || !data.user) throw new Error("Resposta do servidor inválida");
    return { token: String(data.token), user: data.user as UserPublic };
  }

  if (res.status === 401) throw new Error("E-mail ou senha incorretos.");
  if (res.status === 404) throw new Error("Conta não encontrada.");
  const txt = await res.text().catch(() => "");
  throw new Error(txt || `Erro ${res.status} ao fazer login`);
}

/**
 * Tenta registrar no backend.
 * ESPERADO: POST /auth/register -> 201|200 { token, user }
 */
export async function registerBackend(payload: RegisterRequest): Promise<RegisterResponse> {
  const url = `${BASE_URL.replace(/\/$/, "")}/auth/register`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      nome: payload.nome,
      email: payload.email,
      senha: payload.senha,
      cep: payload.cep,
    }),
  });

  if (res.ok) {
    const data = await res.json().catch(() => null);
    if (!data || !data.token || !data.user) throw new Error("Resposta do servidor inválida");
    return { token: String(data.token), user: data.user as UserPublic };
  }

  if (res.status === 409) throw new Error("E-mail já cadastrado.");
  const txt = await res.text().catch(() => "");
  throw new Error(txt || `Erro ${res.status} ao registrar`);
}

/* ====== FALLBACK LOCAL (DEV ONLY) ======
   Essas funções são úteis enquanto o backend não existe.
   Elas leem/gravam na key STORAGE_USER_KEY (único usuário local).
   Em produto real, remova ou desative o fallback.
*/

/**
 * loginLocalFallback: autentica contra STORAGE_USER_KEY.
 * Espera que o formato salvo seja: { nome, email, senha, cep? }
 */
export async function loginLocalFallback(payload: LoginRequest): Promise<LoginResponse> {
  const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
  if (!raw) throw new Error("Nenhum usuário local encontrado (fallback).");

  try {
    const user = JSON.parse(raw);
    const storedEmail = String(user.email ?? "").toLowerCase();
    const storedSenha = String(user.senha ?? "");
    if (payload.email.trim().toLowerCase() === storedEmail && payload.senha === storedSenha) {
      return { token: "local-dev-token", user: { nome: user.nome ?? "", email: storedEmail } };
    }
    throw new Error("E-mail ou senha incorretos (fallback).");
  } catch (err) {
    throw new Error("Erro ao ler usuário local.");
  }
}

/**
 * registerLocalFallback: salva/atualiza STORAGE_USER_KEY com o usuário recebido.
 * Retorna token falso + user.
 */
export async function registerLocalFallback(payload: RegisterRequest): Promise<RegisterResponse> {
  const userObj = {
    nome: payload.nome,
    email: payload.email.trim().toLowerCase(),
    senha: payload.senha,
    cep: payload.cep ?? "",
  };
  await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
  return { token: "local-dev-token", user: { nome: userObj.nome, email: userObj.email } };
}

/* ====== PERSISTÊNCIA AUTH (token + user) ====== */

/**
 * Persiste token+user em STORAGE_AUTH_KEY
 */
export async function persistAuth(token: string, user: UserPublic): Promise<void> {
  await AsyncStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify({ token, user }));
}

/**
 * Recupera auth salvo (ou null)
 */
export async function getPersistedAuth(): Promise<{ token: string; user: UserPublic } | null> {
  const raw = await AsyncStorage.getItem(STORAGE_AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Limpa auth salvo
 */
export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_AUTH_KEY);
}

/* ====== API PÚBLICA: login/register com fallback opcional ====== */

/**
 * login: tenta backend (loginBackend). Em caso de erro de rede e fallbackDev=true, tenta loginLocalFallback.
 * Em sucesso persiste auth via persistAuth.
 */
export async function login(payload: LoginRequest, fallbackDev = true): Promise<LoginResponse> {
  try {
    const resp = await loginBackend(payload);
    await persistAuth(resp.token, resp.user);
    return resp;
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (fallbackDev && isNetworkErrorMessage(msg)) {
      // tentar fallback local
      const resp = await loginLocalFallback(payload);
      await persistAuth(resp.token, resp.user);
      return resp;
    }
    throw err;
  }
}

/**
 * register: tenta backend (registerBackend). Em caso de erro de rede e fallbackDev=true, tenta registerLocalFallback.
 * Em sucesso persiste auth via persistAuth.
 */
export async function register(payload: RegisterRequest, fallbackDev = true): Promise<RegisterResponse> {
  try {
    const resp = await registerBackend(payload);
    await persistAuth(resp.token, resp.user);
    return resp;
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (fallbackDev && isNetworkErrorMessage(msg)) {
      const resp = await registerLocalFallback(payload);
      await persistAuth(resp.token, resp.user);
      return resp;
    }
    throw err;
  }
}

/* ====== EXPORT DEFAULT (opcional) ====== */
// export default { login, register, persistAuth, clearAuth, getPersistedAuth };

