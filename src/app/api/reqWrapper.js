export const fetchRequest = async (graphqlQuery, referer) => {
    const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Referer: referer,
            "x-csrftoken": process.env.X_CSRFTOKEN,
            Cookie: process.env.COOKIE,
            // "user-agent": "Mozilla/5.0",
        },
        body: JSON.stringify(graphqlQuery),
    });

    return res;
};
