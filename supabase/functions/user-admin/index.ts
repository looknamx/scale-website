import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const normalizeUsername = (value: unknown) => String(value || "").trim().toLowerCase();

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await request.json();
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    if (body.action === "login") {
      const username = normalizeUsername(body.username);
      const password = String(body.password || "");
      const { data: profile } = await admin.from("user_profiles")
        .select("internal_email,active").eq("username", username).maybeSingle();
      if (!profile?.active) return json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
      const { data, error } = await authClient.auth.signInWithPassword({
        email: profile.internal_email,
        password,
      });
      if (error || !data.session) return json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      return json({ session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token } });
    }

    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "เซสชันไม่ถูกต้อง" }, 401);

    const { data: caller } = await admin.from("user_profiles")
      .select("user_id,role,active").eq("user_id", authData.user.id).maybeSingle();
    if (!caller?.active || caller.role !== "admin") return json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, 403);

    if (body.action === "list") {
      const { data, error } = await admin.from("user_profiles")
        .select("user_id,username,display_name,role,active,created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return json({ users: data });
    }

    if (body.action === "create") {
      const username = normalizeUsername(body.username);
      const displayName = String(body.displayName || "").trim();
      const password = String(body.password || "");
      const role = body.role === "admin" ? "admin" : "staff";
      if (!/^[a-z0-9._-]{3,32}$/.test(username)) return json({ error: "ชื่อผู้ใช้ต้องมี 3-32 ตัว และใช้ a-z, 0-9, จุด, ขีดกลาง หรือขีดล่าง" }, 400);
      if (!displayName || displayName.length > 80) return json({ error: "กรุณาระบุชื่อที่แสดง" }, 400);
      if (password.length < 8) return json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว" }, 400);
      const internalEmail = `${username}@users.scale.internal`;
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
        user_metadata: { username, display_name: displayName },
      });
      if (createError || !created.user) return json({ error: createError?.message || "สร้างบัญชีไม่สำเร็จ" }, 400);
      const { error: profileError } = await admin.from("user_profiles").insert({
        user_id: created.user.id,
        username,
        display_name: displayName,
        internal_email: internalEmail,
        role,
      });
      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: profileError.code === "23505" ? "ชื่อผู้ใช้นี้มีอยู่แล้ว" : profileError.message }, 400);
      }
      return json({ ok: true });
    }

    const userId = String(body.userId || "");
    if (!userId) return json({ error: "ไม่พบผู้ใช้" }, 400);

    if (body.action === "update") {
      if (userId === caller.user_id && (body.active === false || body.role === "staff")) {
        return json({ error: "ไม่สามารถลดสิทธิ์หรือปิดบัญชีของตัวเองได้" }, 400);
      }
      const changes: Record<string, unknown> = {};
      if (typeof body.active === "boolean") changes.active = body.active;
      if (["admin", "staff"].includes(body.role)) changes.role = body.role;
      if (typeof body.displayName === "string" && body.displayName.trim()) changes.display_name = body.displayName.trim();
      if (!Object.keys(changes).length) return json({ error: "ไม่มีข้อมูลที่ต้องแก้ไข" }, 400);
      const { error } = await admin.from("user_profiles").update(changes).eq("user_id", userId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "reset-password") {
      const password = String(body.password || "");
      if (password.length < 8) return json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว" }, 400);
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "ไม่รู้จักคำสั่งนี้" }, 400);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" }, 500);
  }
});
