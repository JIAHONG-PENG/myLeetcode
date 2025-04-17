import { db } from "@/app/db/db";

export async function POST(req) {
    const { csrfToken, cookie } = await req.json();
    console.log(csrfToken);
    console.log(cookie);

    const res = await db.query(
        `INSERT INTO LeetcodeSession (csrftoken, cookie)
        VALUES (${csrfToken}, ${cookie});`
    );

    console.log(res);
}
