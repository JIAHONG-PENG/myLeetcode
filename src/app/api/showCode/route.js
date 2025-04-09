import { exec } from "child_process";

export async function POST(req, res) {
    const data = await req.json();

    return new Promise((resolve, reject) => {
        exec(
            `leetcode show -c ${data.id} -l javascript`,
            (error, stdout, stderr) => {
                if (error) {
                }
                if (stderr) {
                }

                return;
            }
        );
    });
}
