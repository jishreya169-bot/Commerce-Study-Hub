import { createClient } from "@libsql/client/web";

const TURSO_URL = "libsql://webvibezacadmey-webvibez-acadmey.aws-ap-south-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIzNzExNzcsImlkIjoiMDE5ZWZkOTYtMTkwMS03ZjYzLWIxNGMtZGIxMTI4ZWEwYjhmIiwicmlkIjoiMWU2MTVkOGItMDcxNC00ZmFhLThkNWYtZWUwOTdjNzVlOTAwIn0.gJD03aqWFPDY0aFjZ6mWZ1q6D9-1sHwwdgYBadWlxn3GjVSvphL6WlIT-d8qXekPDfU2LRfcpp30371xG8KvDg";

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    const res = await turso.execute("SELECT id, studentId, createdAt FROM fees ORDER BY createdAt DESC");
    
    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const row of res.rows) {
      const id = row[0] as string;
      const studentId = row[1] as string;
      
      if (seen.has(studentId)) {
        toDelete.push(id);
      } else {
        seen.add(studentId);
      }
    }

    console.log(`Found ${toDelete.length} duplicate fees to delete.`);

    for (const id of toDelete) {
      await turso.execute({
        sql: "DELETE FROM fees WHERE id = ?",
        args: [id]
      });
      console.log(`Deleted fee ${id}`);
    }

    console.log("Cleanup complete!");
  } catch (err) {
    console.error(err);
  }
}

main();
