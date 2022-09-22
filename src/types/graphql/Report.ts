import { Field, ID, ObjectType } from "type-graphql";

import { reportType } from "../report";

import GraphQLTUser from "./User";
import GraphQLTReportData from "./ReportData";

@ObjectType()
class GraphQLTReport {
    @Field(() => ID)
    id: string;

    @Field()
    content: string;

    @Field(() => GraphQLTUser)
    user;

    @Field(() => GraphQLTReportData)
    data;

    @Field()
    type: reportType;

    @Field()
    timestamp: number;
}
export default GraphQLTReport;