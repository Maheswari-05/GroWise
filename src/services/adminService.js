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

export async function fetchWeeklyTests() {
  try {
    let localTests = [];
    try {
      const raw = localStorage.getItem("gw_weeklytests_v4");
      if (raw) localTests = JSON.parse(raw);
    } catch (e) {}

    let dbTests = [];
    try {
      const { data, error } = await supabase.from('weekly_tests').select('*');
      if (!error && data) {
        dbTests = data.map(row => {
          const camel = toCamelCase(row);
          let teacherName = row.teacher || "";
          let batchId = row.batch_id || row.batchId || row.batch || "";
          let maxScore = row.total_marks || row.max_score || row.maxScore || 20;
          let testPdfUrl = row.test_pdf_url || row.testPdfUrl || "";
          let studentMarks = row.student_marks || row.studentMarks || {};

          try {
            if (row.teacher && typeof row.teacher === "string" && row.teacher.startsWith("{")) {
              const parsed = JSON.parse(row.teacher);
              if (parsed.teacher) teacherName = parsed.teacher;
              if (parsed.batchId) batchId = parsed.batchId;
              if (parsed.maxScore) maxScore = parsed.maxScore;
              if (parsed.testPdfUrl) testPdfUrl = parsed.testPdfUrl;
              if (parsed.studentMarks) studentMarks = { ...parsed.studentMarks, ...studentMarks };
            }
          } catch(e) {}

          return {
            ...camel,
            teacher: teacherName,
            batchId,
            maxScore,
            testPdfUrl,
            studentMarks,
            student_marks: studentMarks
          };
        });
      }
    } catch(e) {}

    const map = new Map();
    [...localTests, ...dbTests].forEach((t) => {
      if (t && t.id) {
        const idStr = String(t.id);
        const existing = map.get(idStr);
        if (existing) {
          const mergedMarks = { ...(existing.studentMarks || {}), ...(t.studentMarks || {}) };
          map.set(idStr, { ...existing, ...t, studentMarks: mergedMarks, student_marks: mergedMarks });
        } else {
          map.set(idStr, t);
        }
      }
    });

    return Array.from(map.values());
  } catch (e) {
    console.error('fetchWeeklyTests exception:', e);
    return [];
  }
}

/**
 * Uploads a file (PDF/DOC) to Supabase Storage bucket 'weekly-tests'.
 * @param {File} file - The file object to upload
 * @param {string} path - Storage path, e.g. 'papers/test123.pdf' or 'submissions/s01_t1.pdf'
 * @returns {string|null} Public URL of the uploaded file, or null on failure
 */
export async function uploadTestFile(file, path) {
  try {
    const { error: uploadError } = await supabase.storage
      .from('weekly-tests')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      console.error('uploadTestFile error:', uploadError);
      return null;
    }
    const { data } = supabase.storage.from('weekly-tests').getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    console.error('uploadTestFile exception:', e);
    return null;
  }
}

/**
 * Updates a weekly test record by ID (e.g. student_marks, status, test_pdf_url).
 * @param {string} id - Test ID
 * @param {object} updates - Partial camelCase object to merge
 */
export async function updateWeeklyTest(id, updates) {
  try {
    const idStr = String(id);

    // Update localStorage
    try {
      const raw = localStorage.getItem("gw_weeklytests_v4");
      const local = raw ? JSON.parse(raw) : [];
      const updatedLocal = local.map(t => {
        if (String(t.id) === idStr) {
          const currentMarks = t.studentMarks || t.student_marks || {};
          const nextMarks = updates.studentMarks ? { ...currentMarks, ...updates.studentMarks } : currentMarks;
          return { ...t, ...updates, studentMarks: nextMarks, student_marks: nextMarks };
        }
        return t;
      });
      localStorage.setItem("gw_weeklytests_v4", JSON.stringify(updatedLocal));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    // Update Supabase
    const { data: existing } = await supabase.from('weekly_tests').select('*').eq('id', id).maybeSingle();
    let parsed = {};
    if (existing?.teacher && typeof existing.teacher === "string" && existing.teacher.startsWith("{")) {
      try { parsed = JSON.parse(existing.teacher); } catch (e) {}
    }

    if (updates.teacher !== undefined) parsed.teacher = updates.teacher;
    if (updates.batchId !== undefined) parsed.batchId = updates.batchId;
    if (updates.maxScore !== undefined) parsed.maxScore = updates.maxScore;
    if (updates.testPdfUrl !== undefined) parsed.testPdfUrl = updates.testPdfUrl;
    if (updates.studentMarks !== undefined) {
      parsed.studentMarks = { ...(parsed.studentMarks || {}), ...updates.studentMarks };
    }

    const row = {
      teacher: JSON.stringify(parsed)
    };
    if (updates.subject !== undefined) row.subject = updates.subject;
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.date !== undefined) row.date = updates.date;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.maxScore !== undefined) row.total_marks = updates.maxScore;

    await supabase.from('weekly_tests').update(row).eq('id', id);
  } catch (e) {
    console.error('updateWeeklyTest exception:', e);
  }
}

/**
 * Inserts a new weekly test record.
 * @param {object} test - camelCase test object
 * @returns {object|null} Inserted row
 */
export async function addWeeklyTest(test) {
  try {
    const serializedTeacher = JSON.stringify({
      teacher: test.teacher || "Mr. Rajesh",
      batchId: test.batchId || "",
      maxScore: test.maxScore || 20,
      testPdfUrl: test.testPdfUrl || "",
      studentMarks: test.studentMarks || {}
    });

    const row = {
      subject: test.subject,
      title: test.title,
      teacher: serializedTeacher,
      date: test.date,
      status: test.status || "Result Pending",
      total_marks: test.maxScore || 20
    };

    let inserted = null;
    try {
      const { data, error } = await supabase.from('weekly_tests').insert(row).select().single();
      if (!error && data) {
        inserted = toCamelCase(data);
      }
    } catch(dbErr) {
      console.warn("Supabase insert warning:", dbErr);
    }

    const testId = inserted?.id || test.id || "t" + Date.now();
    const resultObj = {
      ...(inserted || {}),
      id: testId,
      title: test.title,
      subject: test.subject,
      date: test.date,
      status: test.status || "Result Pending",
      totalMarks: test.maxScore || 20,
      teacher: test.teacher || "Mr. Rajesh",
      batchId: test.batchId || "",
      maxScore: test.maxScore || 20,
      testPdfUrl: test.testPdfUrl || "",
      studentMarks: test.studentMarks || {}
    };

    // Keep localStorage in sync
    try {
      const raw = localStorage.getItem("gw_weeklytests_v4");
      const local = raw ? JSON.parse(raw) : [];
      const updated = [resultObj, ...local.filter(t => String(t.id) !== String(testId))];
      localStorage.setItem("gw_weeklytests_v4", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch(e) {}

    return resultObj;
  } catch (e) {
    console.error('addWeeklyTest exception:', e);
    return null;
  }
}

export async function deleteWeeklyTest(id) {
  try {
    const { error } = await supabase.from('weekly_tests').delete().eq('id', id);
    if (error) { console.error('deleteWeeklyTest error:', error); }
    try {
      const raw = localStorage.getItem("gw_weeklytests_v4");
      const local = raw ? JSON.parse(raw) : [];
      const updated = local.filter(t => String(t.id) !== String(id));
      localStorage.setItem("gw_weeklytests_v4", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch(e) {}
  } catch (e) {
    console.error('deleteWeeklyTest exception:', e);
  }
}

// ============================================================
// ASSIGNMENTS FUNCTIONS
// ============================================================

export async function fetchAssignments() {
  try {
    let data = [];
    try {
      const { data: dbData, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && dbData) {
        data = dbData.map(toCamelCase);
      }
    } catch (e) {
      console.warn('fetchAssignments Supabase warning:', e);
    }

    // Merge with LocalStorage
    try {
      const raw = localStorage.getItem('gw_assignments_v2');
      const localAsgns = raw ? JSON.parse(raw) : [];
      const mergedMap = new Map();
      data.forEach((a) => mergedMap.set(String(a.id), a));
      localAsgns.forEach((a) => {
        if (!mergedMap.has(String(a.id))) {
          mergedMap.set(String(a.id), a);
        }
      });
      return Array.from(mergedMap.values());
    } catch (e) {
      return data;
    }
  } catch (e) {
    console.error('fetchAssignments exception:', e);
    return [];
  }
}

export async function addAssignment(assignment) {
  try {
    const row = {
      title: assignment.title,
      subject: assignment.subject,
      batch_id: assignment.batchId || assignment.batch || 'b1',
      due_date: assignment.dueDate,
      total_marks: Number(assignment.maxMarks || assignment.totalMarks || 20),
      status: assignment.status || 'Active',
      student: assignment.student || 'ALL',
      description: typeof assignment.description === 'string' && assignment.description.startsWith('{')
        ? assignment.description
        : JSON.stringify({
            description: assignment.description || '',
            attachmentName: assignment.attachmentName || '',
            attachmentUrl: assignment.attachmentUrl || '',
            submissions: assignment.submissions || []
          })
    };

    let created = null;
    try {
      const { data, error } = await supabase.from('assignments').insert(row).select().single();
      if (!error && data) {
        created = toCamelCase(data);
      }
    } catch (dbErr) {
      console.warn('Supabase addAssignment warning:', dbErr);
    }

    const finalAsgn = created || {
      ...assignment,
      id: assignment.id || 'asgn_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    // Update LocalStorage
    try {
      const raw = localStorage.getItem('gw_assignments_v2');
      const asgns = raw ? JSON.parse(raw) : [];
      const updated = [finalAsgn, ...asgns.filter((a) => String(a.id) !== String(finalAsgn.id))];
      localStorage.setItem('gw_assignments_v2', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return finalAsgn;
  } catch (e) {
    console.error('addAssignment exception:', e);
    return null;
  }
}

export async function updateAssignment(id, updates) {
  try {
    const idStr = String(id);
    const row = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.subject !== undefined) row.subject = updates.subject;
    if (updates.batchId !== undefined) row.batch_id = updates.batchId;
    if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
    if (updates.maxMarks !== undefined) row.total_marks = Number(updates.maxMarks);
    if (updates.totalMarks !== undefined) row.total_marks = Number(updates.totalMarks);
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.description !== undefined) {
      row.description = typeof updates.description === 'string'
        ? updates.description
        : JSON.stringify(updates.description);
    }

    // Update Supabase
    try {
      await supabase.from('assignments').update(row).eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase updateAssignment warning:', dbErr);
    }

    // Update LocalStorage
    try {
      const raw = localStorage.getItem('gw_assignments_v2');
      const asgns = raw ? JSON.parse(raw) : [];
      const updated = asgns.map((a) => (String(a.id) === idStr ? { ...a, ...updates } : a));
      localStorage.setItem('gw_assignments_v2', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  } catch (e) {
    console.error('updateAssignment exception:', e);
  }
}

export async function deleteAssignment(id) {
  try {
    const idStr = String(id);

    // Delete from Supabase
    try {
      await supabase.from('assignments').delete().eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase deleteAssignment warning:', dbErr);
    }

    // Delete from LocalStorage
    try {
      const raw = localStorage.getItem('gw_assignments_v2');
      const asgns = raw ? JSON.parse(raw) : [];
      const updated = asgns.filter((a) => String(a.id) !== idStr);
      localStorage.setItem('gw_assignments_v2', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  } catch (e) {
    console.error('deleteAssignment exception:', e);
  }
}


export async function fetchOnlineClasses() {
  try {
    let data = [];
    try {
      const { data: dbData, error } = await supabase
        .from('online_classes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && dbData) {
        data = dbData.map(c => {
          let batchId = c.student;
          let teacherId = null;
          try {
            if (c.description && c.description.startsWith('{')) {
              const meta = JSON.parse(c.description);
              if (meta.batchId) batchId = meta.batchId;
              if (meta.teacherId) teacherId = meta.teacherId;
            }
          } catch (e) {}
          return {
            id: c.id,
            title: c.title,
            subject: c.subject,
            teacher: c.teacher,
            teacherId,
            student: c.student,
            batchId,
            date: c.date,
            time: c.time,
            status: c.status || 'upcoming',
            description: c.description
          };
        });
      }
    } catch (e) {
      console.warn('fetchOnlineClasses Supabase warning:', e);
    }

    // Merge with LocalStorage
    try {
      const raw = localStorage.getItem('gw_classes_v3');
      const localClasses = raw ? JSON.parse(raw) : [];
      const mergedMap = new Map();
      data.forEach((c) => mergedMap.set(String(c.id), c));
      localClasses.forEach((c) => {
        if (!mergedMap.has(String(c.id))) {
          mergedMap.set(String(c.id), c);
        }
      });
      return Array.from(mergedMap.values());
    } catch (e) {
      return data;
    }
  } catch (e) {
    console.error('fetchOnlineClasses exception:', e);
    return [];
  }
}

export async function addOnlineClass(onlineClass) {
  try {
    const batchId = onlineClass.batchId || onlineClass.batch_id || 'b1';
    const teacherId = onlineClass.teacherId || onlineClass.teacher_id || null;
    const batchName = onlineClass.student || onlineClass.batchName || 'Assigned Batch';

    const row = {
      title: onlineClass.title,
      subject: onlineClass.subject,
      teacher: onlineClass.teacher,
      student: batchName,
      date: onlineClass.date,
      time: onlineClass.time,
      status: onlineClass.status || 'upcoming',
      description: JSON.stringify({ batchId, teacherId, note: onlineClass.description || '' })
    };

    let created = null;
    try {
      const { data, error } = await supabase.from('online_classes').insert(row).select().single();
      if (!error && data) {
        created = {
          ...onlineClass,
          id: data.id,
          batchId,
          student: data.student,
          createdAt: data.created_at
        };
      } else if (error) {
        console.warn('addOnlineClass Supabase error:', error);
      }
    } catch (dbErr) {
      console.warn('Supabase addOnlineClass warning:', dbErr);
    }

    const finalClass = created || {
      ...onlineClass,
      id: 'c_' + Date.now(),
      batchId,
      student: batchName,
      createdAt: new Date().toISOString(),
    };

    // Update LocalStorage
    try {
      const raw = localStorage.getItem('gw_classes_v3');
      const classes = raw ? JSON.parse(raw) : [];
      const updated = [finalClass, ...classes.filter((c) => String(c.id) !== String(finalClass.id))];
      localStorage.setItem('gw_classes_v3', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return finalClass;
  } catch (e) {
    console.error('addOnlineClass exception:', e);
    return null;
  }
}

export async function updateOnlineClass(id, updates) {
  try {
    const idStr = String(id);
    const row = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.subject !== undefined) row.subject = updates.subject;
    if (updates.teacher !== undefined) row.teacher = updates.teacher;
    if (updates.student !== undefined) row.student = updates.student;
    if (updates.date !== undefined) row.date = updates.date;
    if (updates.time !== undefined) row.time = updates.time;
    if (updates.status !== undefined) row.status = updates.status;

    // Update Supabase
    try {
      await supabase.from('online_classes').update(row).eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase updateOnlineClass warning:', dbErr);
    }

    // Update LocalStorage
    try {
      const raw = localStorage.getItem('gw_classes_v3');
      const classes = raw ? JSON.parse(raw) : [];
      const updated = classes.map((c) => (String(c.id) === idStr ? { ...c, ...updates } : c));
      localStorage.setItem('gw_classes_v3', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  } catch (e) {
    console.error('updateOnlineClass exception:', e);
  }
}

export async function deleteOnlineClass(id) {
  try {
    const idStr = String(id);

    // Delete from Supabase
    try {
      await supabase.from('online_classes').delete().eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase deleteOnlineClass warning:', dbErr);
    }

    // Delete from LocalStorage
    try {
      const raw = localStorage.getItem('gw_classes_v3');
      const classes = raw ? JSON.parse(raw) : [];
      const updated = classes.filter((c) => String(c.id) !== idStr);
      localStorage.setItem('gw_classes_v3', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  } catch (e) {
    console.error('deleteOnlineClass exception:', e);
  }
}

export async function addAttendanceLog(log) {
  try {
    const row = toSnakeCase(log);
    delete row.id;
    delete row.created_at;
    const { error } = await supabase.from('attendance_logs').insert(row);
    if (error) { console.error('addAttendanceLog error:', error); }
  } catch (e) {
    console.error('addAttendanceLog exception:', e);
  }
}

export async function addBatchAttendance(logs) {
  try {
    if (!Array.isArray(logs) || logs.length === 0) return;
    const rows = logs.map(l => {
      const r = toSnakeCase(l);
      delete r.id;
      delete r.created_at;
      return r;
    });
    const { error } = await supabase.from('attendance_logs').insert(rows);
    if (error) { console.error('addBatchAttendance error:', error); }
  } catch (e) {
    console.error('addBatchAttendance exception:', e);
  }
}

export async function fetchNotifications() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('fetchNotifications error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchNotifications exception:', e);
    return [];
  }
}

export async function fetchAuditLogs() {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('fetchAuditLogs error:', error); return []; }
    return (data || []).map(toCamelCase);
  } catch (e) {
    console.error('fetchAuditLogs exception:', e);
    return [];
  }
}

export async function fetchInquiries() {
  let localData = [];
  try {
    localData = JSON.parse(localStorage.getItem('growise_inquiries') || '[]');
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchInquiries Supabase note (falling back to local data if needed):', error.message);
      return localData;
    }

    const camelData = (data || []).map(toCamelCase);
    const mergedMap = new Map();
    camelData.forEach(item => mergedMap.set(item.id, item));
    localData.forEach(item => {
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    const result = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    try {
      localStorage.setItem('growise_inquiries', JSON.stringify(result));
    } catch (e) {}

    return result;
  } catch (e) {
    console.warn('fetchInquiries exception, falling back to local storage:', e);
    return localData;
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

  if (student.teacherId || student.teacher_id) {
    row.teacher_id = student.teacherId || student.teacher_id;
  }

  if (row.email) {
    row.email = String(row.email).trim().toLowerCase();
  }

  let { error } = await supabase.from('students').insert(row);
  if (error && (error.message?.includes('teacher_id') || error.code === 'PGRST204')) {
    delete row.teacher_id;
    const retry = await supabase.from('students').insert(row);
    error = retry.error;
  }
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

export async function addInquiry(inquiry) {
  const row = toSnakeCase(inquiry);
  if (!row.id) {
    row.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
  if (!row.created_at) {
    row.created_at = new Date().toISOString();
  }
  if (!row.status) {
    row.status = 'New';
  }

  const camelObj = toCamelCase(row);

  // 1. Immediately cache in localStorage for instant UI updates & offline/RLS resilience
  try {
    const local = JSON.parse(localStorage.getItem('growise_inquiries') || '[]');
    const updated = [camelObj, ...local.filter(i => i.id !== camelObj.id)];
    localStorage.setItem('growise_inquiries', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiries-updated'));
  } catch (e) {
    console.warn('Could not cache inquiry to localStorage:', e);
  }

  // 2. Persist to Supabase
  try {
    const { data, error } = await supabase.from('contact_inquiries').insert(row).select();
    if (error) {
      console.warn('Supabase contact_inquiries note:', error.message);
    }
    return data && data[0] ? toCamelCase(data[0]) : camelObj;
  } catch (err) {
    console.warn('Supabase insert exception:', err);
    return camelObj;
  }
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

  if (student.teacherId !== undefined || student.teacher_id !== undefined) {
    row.teacher_id = student.teacherId || student.teacher_id || null;
  }

  let { error } = await supabase.from('students').update(row).eq('id', id);
  if (error && (error.message?.includes('teacher_id') || error.code === 'PGRST204')) {
    delete row.teacher_id;
    const retry = await supabase.from('students').update(row).eq('id', id);
    error = retry.error;
  }
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

export async function updateInquiryStatus(id, status) {
  // 1. Update local storage cache immediately
  try {
    const local = JSON.parse(localStorage.getItem('growise_inquiries') || '[]');
    const updated = local.map(i => i.id === id ? { ...i, status } : i);
    localStorage.setItem('growise_inquiries', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiries-updated'));
  } catch (e) {}

  // 2. Update Supabase
  try {
    const { error } = await supabase.from('contact_inquiries').update({ status }).eq('id', id);
    if (error) console.warn('updateInquiryStatus Supabase note:', error.message);
  } catch (e) {
    console.warn('updateInquiryStatus exception:', e);
  }
}

export async function deleteInquiry(id) {
  // 1. Delete from local storage cache immediately
  try {
    const local = JSON.parse(localStorage.getItem('growise_inquiries') || '[]');
    const updated = local.filter(i => i.id !== id);
    localStorage.setItem('growise_inquiries', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiries-updated'));
  } catch (e) {}

  // 2. Delete from Supabase
  try {
    const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
    if (error) console.warn('deleteInquiry Supabase note:', error.message);
  } catch (e) {
    console.warn('deleteInquiry exception:', e);
  }
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

  // Save current admin session if logged in
  const { data: { session: adminSession } } = await supabase.auth.getSession();

  try {
    const baseUrl = window.location.origin + window.location.pathname;
    const redirectUrl = role === 'teacher'
      ? `${baseUrl}?role=teacher`
      : `${baseUrl}?role=student`;

    console.log("📧 Sending password setup link to:", trimmedEmail, "Role:", role);
    console.log("🔗 Redirect URL:", redirectUrl);

    // 1. Try sending reset password email directly first
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: redirectUrl,
    });

    if (!resetError) {
      console.log("✅ Reset password email sent directly to:", trimmedEmail);
      return { success: true };
    }

    console.log("User may not exist yet in Supabase Auth, creating account...", resetError.message);

    // 2. If resetPasswordForEmail failed (e.g. user does not exist in Supabase Auth), create account
    const tempPass = 'SetupPass@' + Math.floor(100000 + Math.random() * 900000);
    const { error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: tempPass,
      options: { 
        data: { role, name },
        emailRedirectTo: redirectUrl
      }
    });

    if (signUpError && !signUpError.message?.toLowerCase().includes('already registered')) {
      throw new Error(`Failed to create auth account: ${signUpError.message}`);
    }

    // Restore admin session after signUp
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    // Small delay to ensure Supabase Auth syncs user before reset request
    await new Promise((r) => setTimeout(r, 600));

    const { error: secondResetErr } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: redirectUrl,
    });

    // Restore admin session again
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    if (secondResetErr) {
      console.warn("Second reset attempt warning:", secondResetErr.message);
    }

    console.log("✅ Password setup email processed for:", trimmedEmail);
    return { success: true };

  } catch (error) {
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

// ============================================================
// ATTENDANCE TRACKING - Enhanced Functions
// ============================================================

export async function recordStudentJoinClass(classId, studentId, studentName) {
  try {
    const joinTime = new Date().toISOString();
    const dateToday = new Date().toISOString().split('T')[0];
    
    // Update or create attendance log in Supabase
    try {
      const { data: existing } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('class_id', classId)
        .or(`student_id.eq.${studentId},student.eq.${studentName}`)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('attendance_logs')
          .update({
            status: 'Present',
            joined_at: joinTime
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('attendance_logs')
          .insert({
            class_id: classId,
            student_id: studentId,
            student: studentName,
            status: 'Present',
            joined_at: joinTime,
            is_online_class: true,
            date: dateToday
          });
      }
    } catch (dbErr) {
      console.warn("Supabase attendance log save warning:", dbErr);
    }

    // Also update LocalStorage gw_attendance_logs_v3
    try {
      const raw = localStorage.getItem('gw_attendance_logs_v3');
      const logs = raw ? JSON.parse(raw) : [];
      const foundIdx = logs.findIndex(
        (l) => l.class_id === classId && (l.student_id === studentId || l.student === studentName)
      );
      if (foundIdx >= 0) {
        logs[foundIdx].status = 'Present';
        logs[foundIdx].joined_at = joinTime;
      } else {
        logs.push({
          id: 'log_' + Date.now(),
          class_id: classId,
          student_id: studentId,
          student: studentName,
          status: 'Present',
          joined_at: joinTime,
          is_online_class: true,
          date: dateToday
        });
      }
      localStorage.setItem('gw_attendance_logs_v3', JSON.stringify(logs));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    // Update online_classes joined_students
    try {
      const { data: classData } = await supabase
        .from('online_classes')
        .select('joined_students')
        .eq('id', classId)
        .single();

      const joinedStudents = classData?.joined_students || [];
      if (!joinedStudents.find(s => s.id === studentId || s.name === studentName)) {
        joinedStudents.push({
          id: studentId,
          name: studentName,
          joinedAt: joinTime
        });

        await supabase
          .from('online_classes')
          .update({ joined_students: joinedStudents })
          .eq('id', classId);
      }
    } catch (e) {}

    return { success: true };
  } catch (e) {
    console.error('recordStudentJoinClass exception:', e);
    return { success: false, error: e.message };
  }
}

export async function getStudentAttendance(studentIdOrName, options = {}) {
  try {
    let data = [];
    try {
      let query = supabase
        .from('attendance_logs')
        .select('*')
        .or(`student_id.eq.${studentIdOrName},student.eq.${studentIdOrName}`)
        .order('created_at', { ascending: false });

      if (options.startDate) query = query.gte('date', options.startDate);
      if (options.endDate) query = query.lte('date', options.endDate);
      if (options.subject) query = query.eq('subject', options.subject);

      const { data: dbData, error } = await query;
      if (!error && dbData) data = dbData;
    } catch (e) {}

    // Merge with local storage
    try {
      const raw = localStorage.getItem('gw_attendance_logs_v3');
      const localLogs = raw ? JSON.parse(raw) : [];
      const studentLogs = localLogs.filter(
        (l) => l.student_id === studentIdOrName || l.student === studentIdOrName
      );
      
      const mergedMap = new Map();
      data.forEach((l) => mergedMap.set(String(l.id), l));
      studentLogs.forEach((l) => {
        if (!mergedMap.has(String(l.id))) {
          mergedMap.set(String(l.id), l);
        }
      });
      data = Array.from(mergedMap.values());
    } catch (e) {}

    const stats = {
      total: data.length,
      present: data.filter(a => a.status === 'Present').length,
      absent: data.filter(a => a.status === 'Absent').length,
      late: data.filter(a => a.status === 'Late').length,
      percentage: data.length > 0 
        ? Math.round((data.filter(a => a.status === 'Present').length / data.length) * 100)
        : 0
    };

    return { data: data.map(toCamelCase), stats };
  } catch (e) {
    console.error('getStudentAttendance exception:', e);
    return { data: [], stats: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 } };
  }
}

export async function getBatchAttendanceStats(batchId) {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('batch_id', batchId);

    if (error) throw error;

    // Group by student
    const studentMap = {};
    data.forEach(record => {
      if (!studentMap[record.student_id]) {
        studentMap[record.student_id] = {
          studentId: record.student_id,
          studentName: record.student,
          total: 0,
          present: 0,
          absent: 0
        };
      }
      studentMap[record.student_id].total++;
      if (record.status === 'Present') studentMap[record.student_id].present++;
      if (record.status === 'Absent') studentMap[record.student_id].absent++;
    });

    const students = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    return students.map(toCamelCase);
  } catch (e) {
    console.error('getBatchAttendanceStats exception:', e);
    return [];
  }
}


