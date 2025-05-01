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

const graphql = {
    operationName: "problemsetQuestionList",
    variables: {
        categorySlug: "all-code-essentials",
        skip: 0,
        // limit: 2,
        filters: {},
    },
    query: " query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {  problemsetQuestionList: questionList(    categorySlug: $categorySlug    limit: $limit    skip: $skip    filters: $filters  ) {    total: totalNum    questions: data {      acRate   difficulty  frontendQuestionId: questionFrontendId     paidOnly: isPaidOnly      status      title      titleSlug   }  } }   ",
};

const graphqlV2 = {
    query: "    query problemsetQuestionListV2($filters: QuestionFilterInput, $limit: Int, $searchKeyword: String, $skip: Int, $sortBy: QuestionSortByInput, $categorySlug: String) {  problemsetQuestionListV2(    filters: $filters    limit: $limit    searchKeyword: $searchKeyword    skip: $skip    sortBy: $sortBy    categorySlug: $categorySlug  ) {    questions {      id      titleSlug      title      translatedTitle      questionFrontendId      paidOnly      difficulty      topicTags {        name        slug        nameTranslated      }      status      isInMyFavorites      frequency      acRate    }    totalLength    finishedLength    hasMore  }}    ",
    variables: {
        skip: 0,
        limit: 100,
        categorySlug: "all-code-essentials",
        filters: {
            filterCombineType: "ALL",
            statusFilter: {
                questionStatuses: [],
                operator: "IS",
            },
            difficultyFilter: {
                difficulties: [],
                operator: "IS",
            },
            languageFilter: {
                languageSlugs: [],
                operator: "IS",
            },
            topicFilter: {
                topicSlugs: [],
                operator: "IS",
            },
            acceptanceFilter: {},
            frequencyFilter: {},
            lastSubmittedFilter: {},
            publishedFilter: {},
            companyFilter: {
                companySlugs: [],
                operator: "IS",
            },
            positionFilter: {
                positionSlugs: [],
                operator: "IS",
            },
            premiumFilter: {
                premiumStatus: [],
                operator: "IS",
            },
        },
        searchKeyword: "",
        sortBy: {
            sortField: "CUSTOM",
            sortOrder: "ASCENDING",
        },
        filtersV2: {
            filterCombineType: "ALL",
            statusFilter: {
                questionStatuses: [],
                operator: "IS",
            },
            difficultyFilter: {
                difficulties: [],
                operator: "IS",
            },
            languageFilter: {
                languageSlugs: [],
                operator: "IS",
            },
            topicFilter: {
                topicSlugs: [],
                operator: "IS",
            },
            acceptanceFilter: {},
            frequencyFilter: {},
            lastSubmittedFilter: {},
            publishedFilter: {},
            companyFilter: {
                companySlugs: [],
                operator: "IS",
            },
            positionFilter: {
                positionSlugs: [],
                operator: "IS",
            },
            premiumFilter: {
                premiumStatus: [],
                operator: "IS",
            },
        },
    },
    operationName: "problemsetQuestionListV2",
};

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
            body: JSON.stringify(graphqlV2),
        });

        // console.log(process.env.X_CSRFTOKEN);
        // console.log(process.env.COOKIE);

        const data = await response.json();
        const questions = data.data.problemsetQuestionListV2.questions;
        const categories = new Map();
        categories.set("all", questions.length);

        for (let q of questions) {
            let topic = q.topicTags[0].slug;

            if (categories.get(topic) == null) {
                categories.set(topic, 1);
            } else {
                categories.set(topic, categories.get(topic) + 1);
            }
        }

        return new Response(
            JSON.stringify({
                questions,
                categories: Object.fromEntries(categories),
            }),
            {
                status: 200,
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
