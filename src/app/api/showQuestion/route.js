import { exec } from "child_process";

// export async function POST(req, res) {
//     const data = await req.json();

//     if (data.code) {
//         return new Promise((resolve, reject) => {
//             exec(
//                 `leetcode show -c ${data.id} -l javascript 2>/dev/null`,
//                 (error, stdout, stderr) => {
//                     if (error) {
//                         return resolve(
//                             new Response(JSON.stringify({ error }), {
//                                 status: 500,
//                             })
//                         );
//                     }
//                     if (stderr) {
//                         return resolve(
//                             new Response(JSON.stringify({ stderr }), {
//                                 status: 500,
//                             })
//                         );
//                     }

//                     return resolve(
//                         new Response(JSON.stringify({ output: stdout }), {
//                             status: 200,
//                         })
//                     );
//                 }
//             );
//         });
//     }

//     return new Promise((resolve, reject) => {
//         exec(
//             `leetcode show ${data.id} 2>/dev/null`,
//             (error, stdout, stderr) => {
//                 if (error) {
//                     return resolve(
//                         new Response(JSON.stringify({ error }), { status: 500 })
//                     );
//                 }

//                 if (stderr) {
//                     console.log(stderr);
//                     return resolve(
//                         new Response(JSON.stringify({ stderr }), {
//                             status: 500,
//                         })
//                     );
//                 }

//                 return resolve(
//                     new Response(JSON.stringify({ output: stdout }), {
//                         status: 200,
//                     })
//                 );
//             }
//         );
//     });
// }

export async function POST(req) {
    const { id, titleSlug, code } = await req.json();

    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Referer: `https://leetcode.com/problems/${titleSlug}/`,
            "x-csrftoken": process.env.X_CSRFTOKEN,
            Cookie: process.env.COOKIE,
        },
        body: JSON.stringify({
            operationName: "questionDetail",
            variables: {
                titleSlug: titleSlug,
            },
            query: "query questionDetail($titleSlug: String!) {question(titleSlug: $titleSlug) {  title  titleSlug  questionId  questionFrontendId  questionTitle  translatedTitle  content  translatedContent  categoryTitle  difficulty stats codeSnippets {      code      lang      langSlug    } }}",
        }),
    });

    const response_json = await response.json();
    const data = await response_json.data.question;

    if (code) {
        return new Response(
            JSON.stringify({
                output: data.codeSnippets.filter(
                    (code) => code.langSlug === "javascript"
                )[0].code,
            }),
            {
                status: 200,
            }
        );
    }

    return new Response(
        JSON.stringify({
            output:
                `<h4>${id}. ${data.title}</h4>` +
                `<p>* ${data.categoryTitle}</p>` +
                `<p>* ${data.difficulty} (${
                    JSON.parse(data.stats).acRate
                })</p>` +
                `<p>* Total Accepted: ${
                    JSON.parse(data.stats).totalAccepted
                }</p>` +
                `<p>* Total Submission: ${
                    JSON.parse(data.stats).totalSubmission
                }</p>\n` +
                data.content,
        }),
        {
            status: 200,
        }
    );
}
