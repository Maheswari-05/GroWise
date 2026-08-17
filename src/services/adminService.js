import supabase from '../lib/supabase';

// ============================================================
// Utility: snake_case ↔ camelCase conversion
// ============================================================

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function toCamelCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [snakeToCamel(key), value])
  );
}

function toSnakeCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [camelToSnake(key), value])
  );
}

function handleError(error, context) {
  if (error) {
    console.error(`Supabase error (${context}):`, error.message, error);
    throw new Error(`${context}: ${error.message}`);
  }
  return false;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

export async function fetchStudents() {
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error) { console.error('fetchStudents error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchStudents exception:', e);
    return [];
  }
}

export async function fetchTeachers() {
  try {
    const { data, error } = await supabase.from('teachers').select('*');
    if (error) { console.error('fetchTeachers error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchTeachers exception:', e);
    return [];
  }
}

export async function fetchSubjects() {
  try {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) { console.error('fetchSubjects error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchSubjects exception:', e);
    return [];
  }
}

export async function fetchBatches() {
  try {
    const { data, error } = await supabase.from('batches').select('*');
    if (error) { console.error('fetchBatches error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchBatches exception:', e);
    return [];
  }
}

export async function fetchMaterials() {
  try {
    const { data, error } = await supabase.from('materials').select('*');
    if (error) { console.error('fetchMaterials error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchMaterials exception:', e);
    return [];
  }
}

export async function fetchAttendanceLogs() {
  try {
    const { data, error } = await supabase.from('attendance_logs').select('*');
    if (error) { console.error('fetchAttendanceLogs error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchAttendanceLogs exception:', e);
    return [];
  }
}

export async function fetchAssignments() {
  try {
    const { data, error } = await supabase.from('assignments').select('*');
    if (error) { console.error('fetchAssignments error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchAssignments exception:', e);
    return [];
  }
}

export async function fetchWeeklyTests() {
  try {
    const { data, error } = await supabase.from('weekly_tests').select('*');
    if (error) { console.error('fetchWeeklyTests error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchWeeklyTests exception:', e);
    return [];
  }
}

export async function fetchOnlineClasses() {
  try {
    const { data, error } = await supabase.from('online_classes').select('*');
    if (error) { console.error('fetchOnlineClasses error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchOnlineClasses exception:', e);
    return [];
  }
}

export async function fetchNotifications() {
  try {
    const { data, error } = await supabase.from('notifications').select('*');
    if (error) { console.error('fetchNotifications error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchNotifications exception:', e);
    return [];
  }
}

export async function fetchAuditLogs() {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*');
    if (error) { console.error('fetchAuditLogs error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchAuditLogs exception:', e);
    return [];
  }
}

export async function fetchSettings() {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error) { console.error('fetchSettings error:', error); return null; }
    return data ? toCamelCase(data) : null;
  } catch (e) {
    console.error('fetchSettings exception:', e);
    return null;
  }
}

export async function fetchAdminProfile(userId) {
  try {
    const { data, error } = await supabase.from('admin_profiles').select('*').eq('id', userId).maybeSingle();
    if (error) { console.error('fetchAdminProfile error:', error); return null; }
    return data ? toCamelCase(data) : null;
  } catch (e) {
    console.error('fetchAdminProfile exception:', e);
    return null;
  }
}

// ============================================================
// ADD (INSERT) FUNCTIONS
// ============================================================

export async function addStudent(student) {
  const row = toSnakeCase(student);
  delete row.created_at;
  delete row.password; // Passwords stored in auth, not table
  delete row.username; // Username not in schema

  if (row.email) {
    row.email = String(row.email).trim().toLowerCase();
  }

  const { error } = await supabase.from('students').insert(row);
  handleError(error, 'addStudent');

  // Note: Auth user will be created when password invite email is sent
}

export async function addTeacher(teacher) {
  const row = toSnakeCase(teacher);
  delete row.created_at;
  delete row.password; // Passwords stored in auth, not table
  delete row.username; // Username not in schema
  const { error } = await supabase.from('teachers').insert(row);
  handleError(error, 'addTeacher');

  // Note: Auth user will be created when password invite email is sent
}

export async function addSubject(subject) {
  const row = toSnakeCase(subject);
  delete row.created_at;
  delete row.teacher_ids; // UI-only field; teacher assignments stored on teachers side
  const { error } = await supabase.from('subjects').insert(row);
  handleError(error, 'addSubject');
}

export async function addBatch(batch) {
  const row = toSnakeCase(batch);
  delete row.created_at;
  const { error } = await supabase.from('batches').insert(row);
  handleError(error, 'addBatch');
}

export async function addNotification(notification) {
  const row = toSnakeCase(notification);
  delete row.created_at;
  delete row.id;
  const { error } = await supabase.from('notifications').insert(row);
  handleError(error, 'addNotification');
}

export async function addAuditLog(log) {
  const row = toSnakeCase(log);
  delete row.created_at;
  delete row.id;
  const { error } = await supabase.from('audit_logs').insert(row);
  handleError(error, 'addAuditLog');
}

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

export async function updateStudent(student) {
  const row = toSnakeCase(student);
  const id = row.id;
  delete row.id;
  delete row.created_at;
  delete row.password; // Not stored in table
  delete row.username; // Not stored in table
  const { error } = await supabase.from('students').update(row).eq('id', id);
  handleError(error, 'updateStudent');
}

export async function updateTeacher(teacher) {
  const row = toSnakeCase(teacher);
  const id = row.id;
  delete row.id;
  delete row.created_at;
  delete row.password; // Passwords stored in auth, not table
  delete row.username; // Username not in schema
  const { error } = await supabase.from('teachers').update(row).eq('id', id);
  handleError(error, 'updateTeacher');
}

export async function updateSubject(subject) {
  const row = toSnakeCase(subject);
  const id = row.id;
  delete row.id;
  delete row.created_at;
  delete row.teacher_ids; // UI-only field; teacher assignments stored on teachers side
  const { error } = await supabase.from('subjects').update(row).eq('id', id);
  handleError(error, 'updateSubject');
}

export async function updateBatch(batch) {
  const row = toSnakeCase(batch);
  const id = row.id;
  delete row.id;
  delete row.created_at;
  const { error } = await supabase.from('batches').update(row).eq('id', id);
  handleError(error, 'updateBatch');
}

export async function updateAttendanceLog(log) {
  const row = toSnakeCase(log);
  const id = row.id;
  delete row.id;
  delete row.created_at;
  const { error } = await supabase.from('attendance_logs').update(row).eq('id', id);
  handleError(error, 'updateAttendanceLog');
}

export async function updateSettings(settingsObj) {
  const row = toSnakeCase(settingsObj);
  delete row.id;
  delete row.created_at;
  const { error } = await supabase.from('settings').update(row).eq('id', 1);
  handleError(error, 'updateSettings');
}

export async function updateAdminProfile(userId, profileData) {
  const row = toSnakeCase(profileData);
  delete row.id;
  delete row.created_at;
  const { error } = await supabase.from('admin_profiles').update(row).eq('id', userId);
  handleError(error, 'updateAdminProfile');
}

// ============================================================
// DELETE FUNCTIONS
// ============================================================

export async function deleteStudent(id) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  handleError(error, 'deleteStudent');
}

export async function deleteTeacher(id) {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  handleError(error, 'deleteTeacher');
}

export async function deleteSubject(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  handleError(error, 'deleteSubject');
}

export async function deleteBatch(id) {
  const { error } = await supabase.from('batches').delete().eq('id', id);
  handleError(error, 'deleteBatch');
}

export async function deleteMaterial(id) {
  const { error } = await supabase.from('materials').delete().eq('id', id);
  handleError(error, 'deleteMaterial');
}

// ============================================================
// SPECIAL OPERATIONS
// ============================================================

export async function flagMaterial(id, flagged) {
  const { error } = await supabase.from('materials').update({ flagged }).eq('id', id);
  handleError(error, 'flagMaterial');
}

export async function toggleUserStatus(table, id, newStatus) {
  const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
  handleError(error, 'toggleUserStatus');
}

// ============================================================
// ADMIN PROFILE — auto-create on first login
// ============================================================

export async function ensureAdminProfile(userId, email) {
  const existing = await fetchAdminProfile(userId);
  if (!existing) {
    const name = email.split('@')[0];
    const { error } = await supabase.from('admin_profiles').insert({
      id: userId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email,
    });
    handleError(error, 'ensureAdminProfile');
  }
}

// ============================================================
// OPTION 2: EMAIL INVITE / PASSWORD SETUP LINK
// ============================================================

export async function sendPasswordInviteEmail(email, role = 'student', name = '') {
  if (!email) throw new Error("Email address is required to send password invitation.");

  const trimmedEmail = email.trim().toLowerCase();

  // 1. Save current admin session
  const { data: { session: adminSession } } = await supabase.auth.getSession();

  try {
    // 2. Try to create auth account (gracefully handles "already registered")
    console.log("📝 Creating/verifying auth user for:", trimmedEmail);
    
    const tempPass = 'TempSetup@' + Math.floor(100000 + Math.random() * 900000);
    
    const { error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: tempPass,
      options: { 
        data: { role, name }
      }
    });

    if (signUpError && !signUpError.message?.toLowerCase().includes('already registered')) {
      throw new Error(`Failed to create auth account: ${signUpError.message}`);
    }

    if (!signUpError) {
      console.log("✅ Auth user created for:", trimmedEmail);
    } else {
      console.log("ℹ️  Auth user already exists for:", trimmedEmail);
    }

    // 3. Restore admin session
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    // 4. Send ONE password reset email with role-based redirect.
    // IMPORTANT: Do NOT use hash (#) in redirectTo — Supabase replaces the entire hash
    // with token params (access_token, refresh_token, type=recovery), losing our route.
    // Instead, pass role as a query param so it survives the redirect.
    const baseUrl = window.location.origin + window.location.pathname;
    const redirectUrl = role === 'teacher'
      ? `${baseUrl}?role=teacher`
      : `${baseUrl}?role=student`;

    console.log("📧 Sending password reset email to:", trimmedEmail);
    console.log("🔗 Role:", role, "→ Redirect URL:", redirectUrl);

    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: redirectUrl,
    });

    console.log("📧 Reset email response:", resetData, resetError);

    // 5. Restore admin session after reset email call
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    if (resetError) {
      console.error("❌ Password reset email error:", resetError);
      throw new Error(`Failed to send password reset email: ${resetError.message}`);
    }

    console.log("✅ Password reset email sent to:", trimmedEmail);
    return { success: true };

  } catch (error) {
    // Restore admin session in case of error
    if (adminSession) {
      try {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      } catch (e) {
        console.warn("Could not restore admin session:", e);
      }
    }
    
    console.error("❌ sendPasswordInviteEmail failed:", error);
    throw error;
  }
}
