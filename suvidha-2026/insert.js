require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function insert() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    console.log("Connected to Neon DB");

    // User
    let res = await client.query(`SELECT id FROM "User" WHERE mobile = '9876543210'`);
    let userId;
    if (res.rows.length === 0) {
        // We use a unique ID string here
        const newId = 'usr_' + Date.now();
        await client.query(
            `INSERT INTO "User" (id, mobile, name, address, "preferredLanguage", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)`,
            [newId, '9876543210', 'Demo User', '12 Demo St', 'en', new Date()]
        );
        userId = newId;
    } else {
        userId = res.rows[0].id;
    }

    // Connection
    let connRes = await client.query(`SELECT id FROM "Connection" WHERE "consumerNumber" = 'MH-NP-2024-001247'`);
    if (connRes.rows.length === 0) {
        await client.query(
            `INSERT INTO "Connection" (id, "userId", type, provider, "consumerNumber", address, "outstandingAmt", "lastBillAmt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            ['conn_' + Date.now(), userId, 'ELECTRICITY', 'MSEDCL', 'MH-NP-2024-001247', '12 Demo St', 1247.50, 540.00, new Date()]
        );
        console.log("Connection inserted successfully.");
    } else {
        console.log("Connection already exists.");
    }

    await client.end();
}

insert().catch(err => {
    console.error(err);
    process.exit(1);
});
