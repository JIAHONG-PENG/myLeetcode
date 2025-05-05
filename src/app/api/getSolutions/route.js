import { fetchRequest } from "../reqWrapper";

const graphql = {
    query: "    query ugcArticleSolutionArticles($questionSlug: String!, $orderBy: ArticleOrderByEnum, $userInput: String, $tagSlugs: [String!], $skip: Int, $before: String, $after: String, $first: Int, $last: Int, $isMine: Boolean) {  ugcArticleSolutionArticles(    questionSlug: $questionSlug    orderBy: $orderBy    userInput: $userInput    tagSlugs: $tagSlugs    skip: $skip    first: $first    before: $before    after: $after    last: $last    isMine: $isMine  ) {    totalNum    pageInfo {      hasNextPage    }    edges {      node {        ...ugcSolutionArticleFragment      }    }  }}        fragment ugcSolutionArticleFragment on SolutionArticleNode {  uuid  title  slug  summary  author {    realName    userAvatar    userSlug    userName    nameColor    certificationLevel    activeBadge {      icon      displayName    }  }  articleType  thumbnail  summary  createdAt  updatedAt  status  isLeetcode  canSee  canEdit  isMyFavorite  chargeType  myReactionType  topicId  hitCount  hasVideoArticle  reactions {    count    reactionType  }  title  slug  tags {    name    slug    tagType  }  topic {    id    topLevelCommentCount  }}    ",
    variables: {
        questionSlug: "",
        skip: 0,
        first: 15,
        orderBy: "MOST_VOTES",
        userInput: "",
        tagSlugs: [],
    },
    operationName: "ugcArticleSolutionArticles",
};

const referer = "https://leetcode.com/problems";

export async function POST(req) {
    const body = await req.json();

    graphql.variables.questionSlug = body.questionSlug;

    const res = await fetchRequest(graphql, referer);

    if (!res.ok) {
        console.log(res);
        return new Response(JSON.stringify({}), {
            status: res.status,
        });
    }

    const data = await res.json();

    const solutionArticles = data.data.ugcArticleSolutionArticles.edges;

    const solutionTitles = [];
    for (let a of solutionArticles) {
        solutionTitles.push({ title: a.node.title, topicId: a.node.topic.id });
    }

    return new Response(JSON.stringify({ solutionTitles }), {
        status: 200,
    });
}
