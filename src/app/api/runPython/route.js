import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req) {
    const body = await req.json();
    // console.log(body);
    const filePath = "temp.py";

    return new Promise((resolve, reject) => {
        // const filePath = path.join(process.cwd(), "temp.py");
        fs.writeFileSync(filePath, body.code, "utf8");

        exec(
            `python3 temp.py && rm temp.py`,
            { timeout: 5000 },
            (error, stdout, stderr) => {
                if (error) {
                    fs.unlinkSync(filePath);

                    return resolve(
                        new Response(JSON.stringify({ error: error.message }), {
                            status: 500,
                        })
                    );
                }
                if (stderr) {
                    fs.unlinkSync(filePath);

                    return resolve(
                        new Response(JSON.stringify({ error: stderr }), {
                            status: 500,
                        })
                    );
                }

                return resolve(
                    new Response(JSON.stringify({ output: stdout }), {
                        status: 200,
                    })
                );
            }
        );
    });
}
