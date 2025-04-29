import { fetchRequest } from "../reqWrapper";

const graphqlQuery = {
    query: "    query globalData {  userStatus {    userId    isSignedIn    isMockUser    isPremium    isVerified    username    realName    avatar    isAdmin    isSuperuser    permissions    isTranslator    activeSessionId    checkedInToday    completedFeatureGuides    notificationStatus {      lastModified      numUnread    }  }}    ",
    variables: {},
    operationName: "globalData",
};

const referer = "https://leetcode.com/";

export async function POST(req) {
    const res = await fetchRequest(graphqlQuery, referer);

    if (!res.ok) {
        return new Response(
            JSON.stringify({
                isSignedIn: false,
                username: null,
            }),
            {
                status: res.status,
            }
        );
    }

    const data = await res.json();

    const userStatus = data.data.userStatus;

    return new Response(
        JSON.stringify({
            isSignedIn: userStatus.isSignedIn,
            username: userStatus.realName,
        }),
        {
            status: 200,
        }
    );
}
