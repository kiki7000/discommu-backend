import { AuthChecker } from "type-graphql";

import TContext from "../types/context";
import { CategoryModel, PostModel, CommentModel } from "../database";

const DiscommuAuthChecker: AuthChecker<TContext> = async ({ context, args }, roles: string[]) => {
    if (!context.user)
        return false;

    if (!roles.length)
        return true;

    if (context.user.permissions.includes("admin"))
        return true;

    for (const role of roles) {
        switch (role.toLowerCase()) {
            case "admin":
                return false;
            case "user_edit":
                if (!(args.id && (args.id === context.user.discordID)))
                    return false;
                break;
            case "modify_categories":
                if (!context.user.permissions.includes("modify_categories"))
                    return false;
                break;
            case "self_category":
                if (!context.user.permissions.includes("modify_categories"))
                    return false;
                else {
                    const category = await CategoryModel.findOne({ name: args.name });
                    if (category?.authorID !== context.user.discordID)
                        return false;
                }
                break;
            case "self_post":
                const post = await PostModel.findById(args.id);
                if (post?.authorID !== context.user.discordID)
                    return false;
                break;
            case "self_comment":
                const comment = await CommentModel.findById(args.id);
                if (comment?.authorID !== context.user.discordID)
                    return false;
                break;
        }
    }
    return true;
}
export default DiscommuAuthChecker;