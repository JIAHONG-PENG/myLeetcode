import { exec } from "child_process";
// import { NextRequest, NextResponse } from "next/server";

export async function GET(res) {
    return new Promise((resolve, reject) => {
        exec(
            "leetcode list 2>/dev/null | tail -r | sed -n '1,20p'",
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
                stdout = stdout
                    .trim()
                    .split("\n")
                    .map((text) => {
                        const textParts = text
                            .trim()
                            .split("    ")
                            .filter((t) => t !== "");

                        var description = textParts[0];

                        var level = textParts[1];
                        const levelParts = level.trim().split("(");
                        level = levelParts[0].trim() + " (" + levelParts[1];

                        return { description, level };
                    });
                console.log(stdout);
                return resolve(
                    new Response(JSON.stringify({ output: stdout }), {
                        status: 200,
                    })
                );
            }
        );
    });
}
