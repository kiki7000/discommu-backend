import { Field, ID, ObjectType } from "type-graphql";

import GraphQLTUser from "./User";
import GraphQLTPost from "./Post";

@ObjectType()
class GraphQLTComment {
    @Field(() => ID)
    id: string;

    @Field()
    content: string;

    @Field(() => GraphQLTUser)
    author;

    @Field(() => GraphQLTUser, { nullable: true })
    reply;

    @Field(() => GraphQLTPost)
    post;

    @Field()
    timestamp: number;

    @Field(() => [GraphQLTUser])
    hearts;
}
export default GraphQLTComment;