import { Field, ID, ObjectType } from "type-graphql";

import GraphQLTUser from "./User";
import GraphQLTPost from "./Post";
import { categoryType } from "../category";

@ObjectType()
class GraphQLTCategory {
    @Field(() => ID)
    name: string;

    @Field()
    description: string;

    @Field()
    type: categoryType;

    @Field(() => GraphQLTUser)
    author;

    @Field(() => [GraphQLTPost])
    posts;
}
export default GraphQLTCategory;