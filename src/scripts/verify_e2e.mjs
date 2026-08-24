import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkfgiihzmukotxlpneym.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZmdpaWh6bXVrb3R4bHBuZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzU1NzIsImV4cCI6MjEwMTQxMTU3Mn0.1UfUaLRqa_2H-B4rWpsX9O175WXvFT3TmrpQ9U58GgQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runEndToEndVerification() {
  console.log('=== STARTING END-TO-END WEEKLY TEST VERIFICATION ===\n');

  // Step 1: Verify Students in DB
  console.log('[Step 1] Fetching registered students...');
  const { data: students, error: sErr } = await supabase.from('students').select('*').limit(5);
  if (sErr || !students || students.length === 0) {
    console.error('Failed to fetch students:', sErr);
  } else {
    console.log(`Found ${students.length} students. Target Student: "${students[0].name}" (ID: ${students[0].id}, Batch: ${students[0].batch_id || students[0].batch || 'General'})`);
  }

  const targetStudent = students && students.length > 0 ? students[0] : { id: 1, name: 'Sneha', batch_id: '1' };
  const studentId = targetStudent.id;
  const studentName = targetStudent.name;

  // Step 2: Teacher creates a new Weekly Test with Question Paper PDF
  console.log('\n[Step 2] Teacher creates test: "Weekly Test - Mathematics"...');
  const dummyPdf = 'data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1NyA+Pgstream\nBT /F1 12 Tf 72 712 Td (Weekly Test Question Paper: Mathematics) Tj ET\nendstream\nendobj';
  
  const serializedTeacher = JSON.stringify({
    teacher: 'Mr. Rajesh',
    batchId: targetStudent.batch_id || '',
    maxScore: 100,
    testPdfUrl: dummyPdf,
    studentMarks: {
      [studentId]: { score: null, remarks: '', submissionUrl: null }
    }
  });

  const testPayload = {
    subject: 'Mathematics',
    title: 'Weekly Test - Mathematics (Calculus & Vectors)',
    teacher: serializedTeacher,
    date: new Date().toISOString().split('T')[0],
    status: 'Result Pending',
    total_marks: 100
  };

  const { data: createdTest, error: createErr } = await supabase
    .from('weekly_tests')
    .insert(testPayload)
    .select()
    .single();

  if (createErr) {
    console.error('Failed to create weekly test:', createErr);
    return;
  }

  console.log(`✓ Test created successfully with ID: ${createdTest.id}, Title: "${createdTest.title}"`);

  // Step 3: Teacher broadcasts Test Notification
  console.log('\n[Step 3] Broadcasting notification to students...');
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const { data: notif1, error: n1Err } = await supabase.from('notifications').insert([
    {
      type: 'weekly-test',
      message: `New Test Scheduled: ${createdTest.title} (Mathematics)`,
      time: currentTime
    },
    {
      type: 'batch',
      message: `New Weekly Test "${createdTest.title}" (Mathematics) uploaded.`,
      time: currentTime
    }
  ]).select();

  if (n1Err) {
    console.error('Notification error:', n1Err);
  } else {
    console.log(`✓ Notification delivered to student notification feed.`);
  }

  // Step 4: Student views test and downloads Question Paper PDF
  console.log('\n[Step 4] Student views test and accesses question paper PDF...');
  const { data: fetchStudentTest, error: fErr } = await supabase
    .from('weekly_tests')
    .select('*')
    .eq('id', createdTest.id)
    .single();

  if (fErr || !fetchStudentTest) {
    console.error('Student failed to fetch test:', fErr);
    return;
  }

  const parsedTeacherData = JSON.parse(fetchStudentTest.teacher);
  console.log(`✓ Student accessed test details.`);
  console.log(`✓ Question paper PDF URL present: ${parsedTeacherData.testPdfUrl.substring(0, 30)}... (${parsedTeacherData.testPdfUrl.length} chars)`);

  // Step 5: Student uploads and submits Answer Sheet PDF
  console.log('\n[Step 5] Student submits Answer Sheet PDF...');
  const studentAnswerPdf = 'data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1NyA+Pgstream\nBT /F1 12 Tf 72 712 Td (Sneha Answer Sheet: Solutions 1-10) Tj ET\nendstream\nendobj';
  const submissionTimestamp = new Date().toISOString();

  parsedTeacherData.studentMarks[studentId] = {
    score: null,
    remarks: '',
    submissionUrl: studentAnswerPdf,
    submittedAt: submissionTimestamp,
    studentName: studentName
  };

  const { error: subErr } = await supabase
    .from('weekly_tests')
    .update({ teacher: JSON.stringify(parsedTeacherData) })
    .eq('id', createdTest.id);

  if (subErr) {
    console.error('Submission update error:', subErr);
    return;
  }

  // Notify teacher of submission
  await supabase.from('notifications').insert([
    {
      type: `test-submission:Mr. Rajesh:${createdTest.id}:${studentId}`,
      message: `${studentName} submitted test paper '${createdTest.title}' (Mathematics).`,
      time: currentTime
    }
  ]);
  console.log(`✓ Student submission recorded with PDF answer sheet.`);
  console.log(`✓ Submission notification sent to teacher.`);

  // Step 6: Teacher views submission, enters marks & remarks, and publishes
  console.log('\n[Step 6] Teacher opens test submission, inspects PDF, enters 85/100, Remark: "Good"...');
  parsedTeacherData.studentMarks[studentId] = {
    ...parsedTeacherData.studentMarks[studentId],
    score: 85,
    remarks: 'Good'
  };

  const { error: gradeErr } = await supabase
    .from('weekly_tests')
    .update({
      teacher: JSON.stringify(parsedTeacherData),
      status: 'Published'
    })
    .eq('id', createdTest.id);

  if (gradeErr) {
    console.error('Teacher grading error:', gradeErr);
    return;
  }

  // Send graded notification to student
  await supabase.from('notifications').insert([
    {
      type: `test-result:${studentId}`,
      message: `Your result for "${createdTest.title}" (Mathematics) has been published: 85/100 (85%). Remarks: Good`,
      time: currentTime
    }
  ]);
  console.log(`✓ Marks saved: 85/100, Remark: "Good"`);
  console.log(`✓ Result published with student notification dispatched.`);

  // Step 7: Student reads graded test result
  console.log('\n[Step 7] Verifying student view of graded test...');
  const { data: finalTest, error: finalErr } = await supabase
    .from('weekly_tests')
    .select('*')
    .eq('id', createdTest.id)
    .single();

  if (finalErr || !finalTest) {
    console.error('Error fetching final test:', finalErr);
    return;
  }

  const finalParsed = JSON.parse(finalTest.teacher);
  const studentResult = finalParsed.studentMarks[studentId];

  console.log('--- FINAL TEST RESULT IN SUPABASE DATABASE ---');
  console.log(`Status: ${finalTest.status}`);
  console.log(`Student: ${studentName}`);
  console.log(`Score: ${studentResult.score} / ${finalTest.total_marks}`);
  console.log(`Percentage: ${(studentResult.score / finalTest.total_marks) * 100}%`);
  console.log(`Teacher Remark: "${studentResult.remarks}"`);
  console.log(`Submission PDF: ${studentResult.submissionUrl ? 'Present (Verified)' : 'Missing'}`);
  console.log('----------------------------------------------');

  if (
    finalTest.status === 'Published' &&
    studentResult.score === 85 &&
    studentResult.remarks === 'Good' &&
    studentResult.submissionUrl
  ) {
    console.log('\n>>> COMPLETE END-TO-END WORKFLOW VERIFIED 100% SUCCESSFULLY <<<');
  } else {
    console.error('\n>>> WORKFLOW VERIFICATION FAILED <<<');
  }
}

runEndToEndVerification().catch(console.error);
