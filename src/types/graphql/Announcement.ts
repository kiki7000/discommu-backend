import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
class GraphQLTAnnouncement {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    content: string;

    @Field()
    type: number;

    @Field()
    timestamp: number;
}
export default GraphQLTAnnouncement;