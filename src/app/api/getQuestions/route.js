import { exec } from "child_process";
// import { NextRequest, NextResponse } from "next/server";

export async function GET(res) {
    return new Promise((resolve, reject) => {
        exec(
            // "leetcode list 2>/dev/null | tail -r | sed -n '1,20p'",
            "leetcode list 2>/dev/null | tail -r",
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
                        if (text.includes("Easy   (")) {
                            var textParts = text.split("Easy   (");
                            var description = textParts[0].trim();
                            var level = "Easy (" + textParts[1].trim();
                        } else if (text.includes("Medium (")) {
                            var textParts = text.split("Medium (");
                            var description = textParts[0].trim();
                            var level = "Medium (" + textParts[1].trim();
                        } else if (text.includes("Hard   (")) {
                            const textParts = text.split("Hard   (");
                            var description = textParts[0].trim();
                            var level = "Hard (" + textParts[1].trim();
                        } else {
                            console.log(text);
                        }

                        return { description, level };
                    });

                return resolve(
                    new Response(JSON.stringify({ output: stdout }), {
                        status: 200,
                    })
                );
            }
        );
    });
}
