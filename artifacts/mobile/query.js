const { createClient } = require("@libsql/client");
const turso = createClient({ url: "libsql://webvibezacadmey-webvibez-acadmey.aws-ap-south-1.turso.io", authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIzNzExNzcsImlkIjoiMDE5ZWZkOTYtMTkwMS03ZjYzLWIxNGMtZGIxMTI4ZWEwYjhmIiwicmlkIjoiMWU2MTVkOGItMDcxNC00ZmFhLThkNWYtZWUwOTdjNzVlOTAwIn0.gJD03aqWFPDY0aFjZ6mWZ1q6D9-1sHwwdgYBadWlxn3GjVSvphL6WlIT-d8qXekPDfU2LRfcpp30371xG8KvDg" });
turso.execute("SELECT * FROM users").then(res => console.log(res.rows));
