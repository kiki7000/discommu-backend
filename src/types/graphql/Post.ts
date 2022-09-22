import { Field, ID, ObjectType } from "type-graphql";

import GraphQLTUser from "./User";
import GraphQLTCategory from "./Category";
import GraphQLTComment from "./Comment";

@ObjectType()
class GraphQLTPost {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    content: string;

    @Field(() => GraphQLTUser)
    author;

    @Field(() => GraphQLTCategory)
    category;

    @Field()
    timestamp: number;

    @Field()
    views: number;

    @Field(() => [String])
    tag: string[];

    @Field(() => [GraphQLTComment])
    comments;

    @Field(() => [GraphQLTUser])
    hearts;
}
export default GraphQLTPost;