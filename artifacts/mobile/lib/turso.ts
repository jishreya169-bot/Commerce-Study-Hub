import { createClient } from "@libsql/client/web";

const TURSO_URL = "libsql://webvibezacadmey-webvibez-acadmey.aws-ap-south-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIzNzExNzcsImlkIjoiMDE5ZWZkOTYtMTkwMS03ZjYzLWIxNGMtZGIxMTI4ZWEwYjhmIiwicmlkIjoiMWU2MTVkOGItMDcxNC00ZmFhLThkNWYtZWUwOTdjNzVlOTAwIn0.gJD03aqWFPDY0aFjZ6mWZ1q6D9-1sHwwdgYBadWlxn3GjVSvphL6WlIT-d8qXekPDfU2LRfcpp30371xG8KvDg";

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const initializeTursoDB = async () => {
  try {
    // Timetable
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS timetable (
        id TEXT PRIMARY KEY,
        title TEXT,
        batch TEXT,
        time TEXT,
        color TEXT,
        teacherId TEXT,
        students INTEGER,
        completionRate INTEGER
      )
    `);

    // Doubts
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS doubts (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        studentName TEXT,
        batch TEXT,
        question TEXT,
        status TEXT,
        timestamp TEXT,
        teacherReply TEXT,
        teacherId TEXT,
        resolvedAt TEXT,
        color TEXT
      )
    `);

    // Materials
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        title TEXT,
        batch TEXT,
        subject TEXT,
        type TEXT,
        size TEXT,
        url TEXT,
        uploadedAt TEXT,
        teacherId TEXT
      )
    `);

    // Homework
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS homework (
        id TEXT PRIMARY KEY,
        title TEXT,
        batch TEXT,
        description TEXT,
        dueDate TEXT,
        teacherId TEXT,
        createdAt TEXT
      )
    `);

    // Homework Submissions
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS homework_submissions (
        id TEXT PRIMARY KEY,
        homeworkId TEXT,
        studentId TEXT,
        studentName TEXT,
        fileUrl TEXT,
        status TEXT,
        grade TEXT,
        submittedAt TEXT
      )
    `);

    // Users (Custom Auth)
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        batch TEXT,
        parentId TEXT,
        dob TEXT,
        phone TEXT,
        avatar TEXT,
        pushToken TEXT,
        createdAt TEXT
      )
    `);

    // Classes / Batches
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT,
        subject TEXT,
        createdAt TEXT
      )
    `);

    // Exams
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        title TEXT,
        classId TEXT,
        date TEXT,
        totalMarks INTEGER,
        teacherId TEXT,
        createdAt TEXT
      )
    `);

    // Results
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY,
        examId TEXT,
        studentId TEXT,
        marksObtained INTEGER,
        remarks TEXT,
        createdAt TEXT
      )
    `);

    // Library
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS library (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        type TEXT,
        url TEXT,
        subject TEXT,
        createdAt TEXT
      )
    `);

    // Fees
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS fees (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        totalAmount INTEGER,
        paymentPlan TEXT,
        paidAmount INTEGER,
        nextDueDate TEXT,
        status TEXT,
        createdAt TEXT
      )
    `);

    // Student Attendance
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS student_attendance (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        batch TEXT,
        date TEXT,
        status TEXT,
        markedBy TEXT,
        UNIQUE(studentId, date)
      )
    `);

    // Migrations for Timetable
    try { await turso.execute("ALTER TABLE timetable ADD COLUMN type TEXT DEFAULT 'one-time'"); } catch(e){}
    try { await turso.execute("ALTER TABLE timetable ADD COLUMN date TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE timetable ADD COLUMN dayOfWeek TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE timetable ADD COLUMN startTime TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE timetable ADD COLUMN endTime TEXT"); } catch(e){}

    // Migrations for Homework
    try { await turso.execute("ALTER TABLE homework ADD COLUMN fileUrl TEXT"); } catch(e){}

    // Migrations for Doubts
    try { await turso.execute("ALTER TABLE doubts ADD COLUMN subject TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE doubts ADD COLUMN askedBy TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE doubts ADD COLUMN resolved INTEGER DEFAULT 0"); } catch(e){}
    try { await turso.execute("ALTER TABLE doubts ADD COLUMN createdAt TEXT"); } catch(e){}

    // Migrations for Gamification
    try { await turso.execute("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0"); } catch(e){}
    try { await turso.execute("ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0"); } catch(e){}
    try { await turso.execute("ALTER TABLE users ADD COLUMN lastActiveDate TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE users ADD COLUMN avatar TEXT"); } catch(e){}

    // Migrations for Users (phone, dob, batch, parentId)
    try { await turso.execute("ALTER TABLE users ADD COLUMN batch TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE users ADD COLUMN parentId TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE users ADD COLUMN dob TEXT"); } catch(e){}
    try { await turso.execute("ALTER TABLE users ADD COLUMN phone TEXT"); } catch(e){}

    // Migrations for Student Attendance
    try { await turso.execute("ALTER TABLE student_attendance ADD COLUMN markedBy TEXT"); } catch(e){}

    console.log("Turso Tables Initialized!");
  } catch (error) {
    console.error("Failed to initialize Turso DB:", error);
  }
};
