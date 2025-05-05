import { fetchRequest } from "../reqWrapper";

const graphql = {
    query: "    query ugcArticleSolutionArticle($articleId: ID, $topicId: ID) {  ugcArticleSolutionArticle(articleId: $articleId, topicId: $topicId) {    ...ugcSolutionArticleFragment    content    isSerialized    isAuthorArticleReviewer    scoreInfo {      scoreCoefficient    }    prev {      uuid      slug      topicId      title    }    next {      uuid      slug      topicId      title    }  }}        fragment ugcSolutionArticleFragment on SolutionArticleNode {  uuid  title  slug  summary  author {    realName    userAvatar    userSlug    userName    nameColor    certificationLevel    activeBadge {      icon      displayName    }  }  articleType  thumbnail  summary  createdAt  updatedAt  status  isLeetcode  canSee  canEdit  isMyFavorite  chargeType  myReactionType  topicId  hitCount  hasVideoArticle  reactions {    count    reactionType  }  title  slug  tags {    name    slug    tagType  }  topic {    id    topLevelCommentCount  }}    ",
    variables: {
        topicId: "",
    },
    operationName: "ugcArticleSolutionArticle",
};

const referer = "https://leetcode.com/problems";

export async function POST(req) {
    const body = await req.json();
    graphql.variables.topicId = body.topicId;

    const res = await fetchRequest(graphql, referer);

    if (!res.ok) {
        console.log(res);
        return new Response(JSON.stringify({}), {
            status: res.status,
        });
    }

    const data = await res.json();

    const { title, content } = data.data.ugcArticleSolutionArticle;

    return new Response(JSON.stringify({ title, content }), {
        status: 200,
    });
}
