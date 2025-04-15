import { exec } from "child_process";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(res) {
//     return new Promise((resolve, reject) => {
//         exec(
//             // "leetcode list 2>/dev/null | tail -r | sed -n '1,20p'",
//             "leetcode list 2>/dev/null | tail -r",
//             (error, stdout, stderr) => {
//                 if (error) {
//                     return resolve(
//                         new Response(JSON.stringify({ error }), {
//                             status: 500,
//                         })
//                     );
//                 }
//                 if (stderr) {
//                     return resolve(
//                         new Response(JSON.stringify({ stderr }), {
//                             status: 500,
//                         })
//                     );
//                 }

//                 // error
//                 if (stdout.includes("[ERROR]")) {
//                     return resolve(
//                         new Response(JSON.stringify({ output: [] }), {
//                             status: 200,
//                         })
//                     );
//                 }

//                 stdout = stdout
//                     .trim()
//                     .split("\n")
//                     .map((text) => {
//                         if (text.includes("Easy   (")) {
//                             var textParts = text.split("Easy   (");
//                             var description = textParts[0].trim();
//                             var level = "Easy (" + textParts[1].trim();
//                         } else if (text.includes("Medium (")) {
//                             var textParts = text.split("Medium (");
//                             var description = textParts[0].trim();
//                             var level = "Medium (" + textParts[1].trim();
//                         } else if (text.includes("Hard   (")) {
//                             const textParts = text.split("Hard   (");
//                             var description = textParts[0].trim();
//                             var level = "Hard (" + textParts[1].trim();
//                         } else {
//                             console.log(text);
//                         }

//                         return { description, level };
//                     });

//                 return resolve(
//                     new Response(JSON.stringify({ output: stdout }), {
//                         status: 200,
//                     })
//                 );
//             }
//         );
//     });
// }

export async function GET(res) {
    try {
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Referer: "https://leetcode.com/problems",
                "x-csrftoken": process.env.X_CSRFTOKEN,
                Cookie: process.env.COOKIE,
            },
            body: JSON.stringify({
                operationName: "problemsetQuestionList",
                variables: {
                    categorySlug: "all-code-essentials",
                    skip: 0,
                    // limit: 2,
                    filters: {},
                },
                query: " query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {  problemsetQuestionList: questionList(    categorySlug: $categorySlug    limit: $limit    skip: $skip    filters: $filters  ) {    total: totalNum    questions: data {      acRate   difficulty  frontendQuestionId: questionFrontendId     paidOnly: isPaidOnly      status      title      titleSlug   }  } }   ",
            }),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data.data.problemsetQuestionList), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
