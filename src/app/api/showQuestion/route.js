import { exec } from "child_process";

export async function POST(req, res) {
    const data = await req.json();
    console.log(data.code);

    if (data.code) {
        return new Promise((resolve, reject) => {
            exec(
                `leetcode show -c ${data.id} -l javascript 2>/dev/null`,
                (error, stdout, stderr) => {
                    if (error) {
                        return resolve(
                            new Response(JSON.stringify({ error }), {
                                status: 500,
                            })
                        );
                    }
                    if (stderr) {
                        return resolve(
                            new Response(JSON.stringify({ stderr }), {
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

    return new Promise((resolve, reject) => {
        exec(
            `leetcode show ${data.id} 2>/dev/null`,
            (error, stdout, stderr) => {
                if (error) {
                    return resolve(
                        new Response(JSON.stringify({ error }), { status: 500 })
                    );
                }

                if (stderr) {
                    console.log(stderr);
                    return resolve(
                        new Response(JSON.stringify({ stderr }), {
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
