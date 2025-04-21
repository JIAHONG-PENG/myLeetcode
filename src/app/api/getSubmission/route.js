export async function POST(req) {
    const { titleSlug } = await req.json();

    const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Referer: `https://leetcode.com/problems/${titleSlug}/submissions/`,
            "x-csrftoken": process.env.X_CSRFTOKEN,
            Cookie: process.env.COOKIE,
        },
        body: JSON.stringify({
            query: "    query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!, $lang: Int, $status: Int) {  questionSubmissionList(    offset: $offset    limit: $limit    lastKey: $lastKey    questionSlug: $questionSlug    lang: $lang    status: $status  ) {    lastKey    hasNext    submissions {      id      title      titleSlug      status      statusDisplay      lang      langName      runtime      timestamp      url      isPending      memory      hasNotes      notes      flagType      frontendId      topicTags {        id      }    }  }}    ",
            variables: {
                questionSlug: titleSlug,
                offset: 0,
                limit: 10,
                lastKey: null,
            },
            operationName: "submissionList",
        }),
    });

    const data = await res.json();
    const submissionsAccepted =
        await data.data.questionSubmissionList.submissions.filter(
            (s) => s.statusDisplay === "Accepted"
        );

    const res1 = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Referer: `https://leetcode.com/problems/${titleSlug}/submissions/`,
            "x-csrftoken": process.env.X_CSRFTOKEN,
            Cookie: process.env.COOKIE,
        },
        body: JSON.stringify({
            query: "    query submissionDetails($submissionId: Int!) {  submissionDetails(submissionId: $submissionId) {    runtime    runtimeDisplay    runtimePercentile    runtimeDistribution    memory    memoryDisplay    memoryPercentile    memoryDistribution    code    timestamp    statusCode    user {      username      profile {        realName        userAvatar      }    }    lang {      name      verboseName    }    question {      questionId      titleSlug      hasFrontendPreview    }    notes    flagType    topicTags {      tagId      slug      name    }    runtimeError    compileError    lastTestcase    codeOutput    expectedOutput    totalCorrect    totalTestcases    fullCodeOutput    testDescriptions    testBodies    testInfo    stdOutput  }}    ",
            variables: {
                submissionId: submissionsAccepted[0].id,
            },
            operationName: "submissionDetails",
        }),
    });

    const data1 = await res1.json();
    const submissionDetails = await data1.data.submissionDetails;

    return new Response(
        JSON.stringify({
            output: submissionDetails.code,
            language: submissionDetails.lang.name,
            runtimePercentile: submissionDetails.runtimePercentile,
            memoryPercentile: submissionDetails.memoryPercentile,
        }),
        { status: 200 }
    );
}
