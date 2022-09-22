import { Field, ID, ObjectType } from "type-graphql";

import GraphQLTBadge from "./Badge";
import GraphQLTPost from "./Post";

@ObjectType()
class GraphQLTUser {
    @Field(() => ID)
    discordID: string;

    @Field()
    discriminator: string;

    @Field()
    username: string;

    @Field()
    avatarURL: string;

    @Field()
    description: string;

    @Field()
    point: number;

    @Field(() => [String])
    permissions: string[];

    @Field(() => [GraphQLTBadge])
    badges;

    @Field(() => [GraphQLTUser])
    following;

    @Field(() => [GraphQLTUser])
    follower;

    @Field(() => [GraphQLTPost])
    posts;

    @Field(() => [GraphQLTPost])
    hearts;
}
export default GraphQLTUser;