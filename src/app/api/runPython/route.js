import { exec } from "child_process";

export async function POST(req) {
    const body = await req.json();
    // console.log(body);

    return new Promise((resolve, reject) => {
        exec(
            `echo "${body.code}" > temp.py && python3 temp.py && rm temp.py`,
            { timeout: 5000 },
            (error, stdout, stderr) => {
                if (error) {
                    return resolve(
                        new Response(JSON.stringify({ error: error.message }), {
                            status: 500,
                        })
                    );
                }
                if (stderr) {
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
