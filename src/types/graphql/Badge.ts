import { Field, ObjectType } from "type-graphql";

@ObjectType()
class GraphQLTBadge {
    @Field()
    name: string;

    @Field()
    icon: string;

    @Field(() => [String])
    permissions: string[];
}
export default GraphQLTBadge;