import { FieldResolver, Resolver, Root, Ctx, Mutation, Authorized, Arg, PubSub, PubSubEngine, Subscription } from "type-graphql";
import { ApolloError } from "apollo-server-errors";

import GraphQLTCategory from "../types/graphql/Category";
import GraphQLTPost from "../types/graphql/Post";
import GraphQLTReport from "../types/graphql/Report";

import TContext from "../types/context";
import { postSort } from "../types/post";
import { reportType } from "../types/report";
import { categoryType, TCategory } from "../types/category";

import CreateCategory from "../inputs/CreateCategory";
import EditCategory from "../inputs/EditCategory";
import { CategoryModel, PostModel, ReportModel } from "../database";

@Resolver(GraphQLTCategory)
export default class {
    @FieldResolver()
    async name(@Root() root: TCategory) {
        return root.name;
    }

    @FieldResolver()
    async description(@Root() root: TCategory) {
        return root.description;
    }

    @FieldResolver()
    async type(@Root() root: TCategory) {
        return root.type;
    }

    @FieldResolver()
    async author(@Root() root: TCategory, @Ctx() ctx: TContext) {
        return await ctx.userCache.getUser(root.authorID);
    }

    @FieldResolver(() => [GraphQLTPost])
    async posts(
        @Root() root: TCategory,
        @Arg("query", { nullable: true }) query?: string,
        @Arg("authorID", { nullable: true, description: "The post's author's ID" }) authorID?: string,
        @Arg("tag", () => [String], { nullable: true, description: "The post's tag" }) tag?: string[],
        @Arg("limit", { nullable: true, description: "How many posts to divide" }) limit?: number,
        @Arg("limitIndex", { defaultValue: 1, description: "Index of divided posts", nullable: true }) limitIndex?: number,
        @Arg("sort", { nullable: true, description: "How to sort the results", defaultValue: "newest" }) sort?: postSort
    ) {
        if (limitIndex <= 0)
            throw new ApolloError("limitIndex should be a natural number", "TYPE_ERROR");

        let searchQuery = { category: root.name };
        if (query)
            searchQuery["$text"] = { $search: query };
        if (tag)
            searchQuery["tag"] = { $all: tag };
        if (authorID)
            searchQuery["authorID"] = authorID;

        return await PostModel.find(searchQuery, undefined, {
            limit: limit ?? undefined,
            skip: limit && limitIndex ? (limitIndex - 1) * limit : undefined,
            sort: {
                newest: undefined,
                alphabetic: {
                    title: 1
                },
                hearts: {
                    hearts: -1
                },
                views: {
                    views: -1
                }
            }[sort]
        }).exec();
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => [GraphQLTReport])
    async reports(
        @Root() root: TCategory,
        @Ctx() ctx: TContext,
        @Arg("query", { nullable: true }) query?: string,
        @Arg("userID", { nullable: true, description: "The report's author's ID" }) userID?: string,
        @Arg("limit", { nullable: true, description: "How many reports to divide" }) limit?: number,
        @Arg("limitIndex", { defaultValue: 1, description: "Index of divided reports", nullable: true }) limitIndex?: number
    ) {
        if (limitIndex <= 0)
            throw new ApolloError("limitIndex should be a natural number", "TYPE_ERROR");

        let searchQuery = { data: root.name, type: reportType.CATEGORY };
        if (query)
            searchQuery["$text"] = { $search: query };
        if (userID)
            searchQuery["userID"] = userID;

        return await ReportModel.find(searchQuery, undefined, {
            limit: limit ?? undefined,
            skip: limit && limitIndex ? (limitIndex - 1) * limit : undefined
        }).exec();
    }


    @Subscription(() => GraphQLTCategory, {
        topics: "categoryAdded",
        filter: ({ payload, args }) =>
            (args.authorID ? payload.authorID == args.authorID : true)
            && (args.type ? payload.type == args.type : true)
            && (args.query ? (payload.name + payload.description).includes(args.query) : true)
    })
    async categoryAdded(
        @Root() category: TCategory,
        @Arg("query", { nullable: true }) query?: string,
        @Arg("authorID", { nullable: true, description: "The category's author's ID" }) authorID?: string
    ) {
        return category;
    }

    @Authorized(["MODIFY_CATEGORIES"])
    @Mutation(() => GraphQLTCategory)
    async createCategory(@PubSub() pubsub: PubSubEngine, @Ctx() ctx: TContext, @Arg("data") data: CreateCategory) {
        if (await CategoryModel.exists({ name: data.name }))
            throw new ApolloError(`Category with name ${data.name} exists`, "CATEGORY_EXISTS");

        const category = await CategoryModel.create({ name: data.name, description: data.description, type: 1, authorID: ctx.user.discordID });
        await pubsub.publish("categoryAdded", category);
        return category;
    }

    @Authorized(["SELF_CATEGORY"])
    @Mutation(() => GraphQLTCategory, { nullable: true })
    async editCategoryDescription(@Arg("name") categoryName: string, @Arg("description") description: string) {
        if (description.length >= 100)
            throw new ApolloError("description must be shorter than or equal to 100 characters.", "FIELD_LENGTH_OVER");

        return CategoryModel.findOneAndUpdate(
            {name: categoryName},
            {$set: {description: description}},
            {new: true}
        );
    }

    @Authorized(["ADMIN"])
    @Mutation(() => GraphQLTCategory, { nullable: true })
    async editCategoryType(@Arg("name") categoryName: string, @Arg("type") type: categoryType) {
        return CategoryModel.findOneAndUpdate(
            {name: categoryName},
            {$set: {type: type}},
            {new: true}
        );
    }

    @Authorized(["SELF_CATEGORY"])
    @Mutation(() => GraphQLTCategory, { nullable: true })
    async editCategory(@Ctx() ctx: TContext, @Arg("name") categoryName: string, @Arg("data") data: EditCategory) {
        if (data.type && !ctx.user.permissions.includes("admin"))
            throw new ApolloError("To edit category type, you need the administer permission", "NO_PERMISSION");

        if (data.description)
            await this.editCategoryDescription(categoryName, data.description);

        if (data.type)
            await this.editCategoryType(categoryName, data.type);

        return CategoryModel.findOne({name: categoryName});
    }

    @Authorized(["SELF_CATEGORY"])
    @Mutation(() => GraphQLTCategory, { nullable: true })
    async deleteCategory(@Ctx() ctx: TContext, @Arg("name") categoryName: string) {
        const posts = await PostModel.find({ category: categoryName });
        if (posts.length >= 10)
            throw new ApolloError("Category has posts more than 10", "TOO_MANY_POSTS");

        await posts.forEach(post => post.delete());
        return CategoryModel.findOneAndDelete({name: categoryName});
    }
}