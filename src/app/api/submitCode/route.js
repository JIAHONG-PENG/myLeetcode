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
            // codeToSubmit =
            //     "/*\n" +
            //     `* @lc app=leetcode id=${questionMeta.id} lang=${lang}\n` +
            //     "*\n" +
            //     `* [${questionMeta.id}] ${questionMeta.title}\n` +
            //     "*/\n\n" +
            //     "// @lc code=start\n\n" +
            //     code +
            //     "\n\n// @lc code=end";

            break;
        case "python":
            fileExtension = "py";
            lang = "python3";
            // codeToSubmit =
            //     "#\n" +
            //     `# @lc app=leetcode id=${questionMeta.id} lang=${lang}\n` +
            //     "#\n" +
            //     `# [${questionMeta.id}] ${questionMeta.title}\n` +
            //     "#\n\n" +
            //     "# @lc code=start\n\n" +
            //     code +
            //     "\n\n# @lc code=end";

            break;

        case "c":
            fileExtension = "c";
            lang = "c";
            // codeToSubmit =
            //     "/*\n" +
            //     `* @lc app=leetcode id=${questionMeta.id} lang=${lang}\n` +
            //     "*\n" +
            //     `* [${questionMeta.id}] ${questionMeta.title}\n` +
            //     "*/\n\n" +
            //     "// @lc code=start\n\n" +
            //     code +
            //     "\n\n// @lc code=end";

            break;

        default:
            fileExtension = "js";
            lang = "javascript";
        // codeToSubmit =
        //     "/*\n" +
        //     `* @lc app=leetcode id=${questionMeta.id} lang=${lang}\n` +
        //     "*\n" +
        //     `* [${questionMeta.id}] ${questionMeta.title}\n` +
        //     "*/\n\n" +
        //     "// @lc code=start\n\n" +
        //     code +
        //     "\n\n// @lc code=end";
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
