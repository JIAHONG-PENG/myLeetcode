import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req, res) {
    const { code, questionMeta, language } = await req.json();

    var fileExtension;
    var lang;
    // var codeToSubmit;

    switch (language) {
        case "javascript":
            fileExtension = "js";
            lang = "javascript";

            break;
        case "python":
            fileExtension = "py";
            lang = "python3";

            break;
        case "c":
            fileExtension = "c";
            lang = "c";

            break;
        default:
            fileExtension = "js";
            lang = "javascript";
    }

    return new Promise((resolve, reject) => {
        const filePath = path.join(
            process.cwd(),
            "tmp",
            `${questionMeta.titleSlug}.${fileExtension}`
        );

        // Ensure tmp directory exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        // Write the user's code to a file
        fs.writeFileSync(filePath, code, "utf8");

        exec(
            `leetcode submit ${filePath} 2> /dev/null`,
            (error, stdout, stderr) => {
                if (error) {
                    return resolve(
                        new Response(JSON.stringify({ output: error }), {
                            status: 500,
                        })
                    );
                }
                if (stderr) {
                    return resolve(
                        new Response(JSON.stringify({ output: stderr }), {
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
