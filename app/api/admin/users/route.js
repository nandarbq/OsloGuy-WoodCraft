import 'server-only';
import { createClient } from '@supabase/supabase-js';

const ROLES = ['admin', 'seller', 'buyer'];

const reply = (body, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function authorizeAdmin(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return { response: reply({ error: 'Konfigurasi server belum lengkap. Tambahkan SUPABASE_SERVICE_ROLE_KEY di .env.local.' }, 503) };
  }

  const authorization = request.headers.get('authorization') || '';
  const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return { response: reply({ error: 'Silakan login kembali.' }, 401) };

  const authClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !user) return { response: reply({ error: 'Sesi login tidak valid.' }, 401) };

  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await adminClient
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profileError) {
    return { response: reply({ error: `Gagal memeriksa role admin: ${profileError.message}` }, 500) };
  }
  if (profile?.role !== 'admin') {
    return { response: reply({ error: 'Hanya admin yang boleh mengelola akun.' }, 403) };
  }

  return { adminClient, user };
}

async function readBody(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { response: reply({ error: 'Format data tidak valid.' }, 400) };
    }
    return { body };
  } catch {
    return { response: reply({ error: 'Format data tidak valid.' }, 400) };
  }
}

async function adminCount(adminClient) {
  return adminClient.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin');
}

export async function GET(request) {
  const context = await authorizeAdmin(request);
  if (context.response) return context.response;

  const { data, error } = await context.adminClient
    .from('profiles').select('id,email,role,created_at').order('created_at', { ascending: true });
  if (error) return reply({ error: `Gagal memuat akun: ${error.message}` }, 500);
  return reply({ users: data });
}

export async function POST(request) {
  const context = await authorizeAdmin(request);
  if (context.response) return context.response;

  const { body, response } = await readBody(request);
  if (response) return response;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply({ error: 'Masukkan email yang valid.' }, 400);
  }
  if (password.length < 8) return reply({ error: 'Password minimal 8 karakter.' }, 400);
  if (!ROLES.includes(role)) return reply({ error: 'Role harus admin, seller, atau buyer.' }, 400);

  const { data, error: createError } = await context.adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) return reply({ error: `Gagal membuat akun: ${createError.message}` }, 400);

  const { error: profileError } = await context.adminClient.from('profiles').upsert({
    id: data.user.id,
    email,
    role,
  });
  if (profileError) {
    const { error: cleanupError } = await context.adminClient.auth.admin.deleteUser(data.user.id);
    const cleanupNote = cleanupError ? ` Akun sementara juga gagal dibersihkan: ${cleanupError.message}` : '';
    return reply({ error: `Akun dibuat tetapi role gagal disimpan: ${profileError.message}.${cleanupNote}` }, 500);
  }

  return reply({ user: { id: data.user.id, email, role } }, 201);
}

export async function PATCH(request) {
  const context = await authorizeAdmin(request);
  if (context.response) return context.response;

  const { body, response } = await readBody(request);
  if (response) return response;
  const { id, role } = body;
  if (typeof id !== 'string' || !ROLES.includes(role)) {
    return reply({ error: 'Pilih akun dan role yang valid.' }, 400);
  }
  if (id === context.user.id) return reply({ error: 'Role akun yang sedang dipakai tidak bisa diubah.' }, 400);

  const { data: target, error: targetError } = await context.adminClient
    .from('profiles').select('id,role').eq('id', id).maybeSingle();
  if (targetError) return reply({ error: `Gagal mencari akun: ${targetError.message}` }, 500);
  if (!target) return reply({ error: 'Akun tidak ditemukan.' }, 404);

  if (target.role === 'admin' && role !== 'admin') {
    const { count, error: countError } = await adminCount(context.adminClient);
    if (countError) return reply({ error: `Gagal memeriksa jumlah admin: ${countError.message}` }, 500);
    if (count <= 1) return reply({ error: 'Minimal harus ada satu akun admin.' }, 409);
  }

  const { error } = await context.adminClient.from('profiles').update({ role }).eq('id', id);
  if (error) return reply({ error: `Gagal mengubah role: ${error.message}` }, 500);
  return reply({ user: { id, role } });
}

export async function DELETE(request) {
  const context = await authorizeAdmin(request);
  if (context.response) return context.response;

  const { body, response } = await readBody(request);
  if (response) return response;
  const { id } = body;
  if (typeof id !== 'string') return reply({ error: 'Pilih akun yang valid.' }, 400);
  if (id === context.user.id) return reply({ error: 'Akun admin yang sedang dipakai tidak bisa dihapus.' }, 400);

  const { data: target, error: targetError } = await context.adminClient
    .from('profiles').select('id,role').eq('id', id).maybeSingle();
  if (targetError) return reply({ error: `Gagal mencari akun: ${targetError.message}` }, 500);
  if (!target) return reply({ error: 'Akun tidak ditemukan.' }, 404);

  if (target.role === 'admin') {
    const { count, error: countError } = await adminCount(context.adminClient);
    if (countError) return reply({ error: `Gagal memeriksa jumlah admin: ${countError.message}` }, 500);
    if (count <= 1) return reply({ error: 'Admin terakhir tidak bisa dihapus.' }, 409);
  }

  const { error } = await context.adminClient.auth.admin.deleteUser(id);
  if (error) return reply({ error: `Gagal menghapus akun: ${error.message}` }, 500);
  return reply({ ok: true });
}
