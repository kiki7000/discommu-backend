import Mongoose from "mongoose";

import config from "../../config.json";
import logger from "../utils/logger";


export let db: Mongoose.Connection;


export const dbConnect = async () => {
    if (db) { await dbDisconnect(); }

    await Mongoose.connect(`mongodb+srv://admin:${config.db.password}@${config.db.url}/discommu?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    });

    db = Mongoose.connection;

    db.once("open", async () => {
        await logger.info("Database connect");
    });
    db.on("error", async () => {
        await logger.error("Error while connecting");
    });
}

export const dbDisconnect = async () => {
    if (!db) return;

    await Mongoose.disconnect();
    await logger.info("Database disconnect");
}

export { UserModel } from "./users/users.models";
export { PostModel } from "./posts/posts.models";
export { CategoryModel } from "./categories/categories.models";
export { CommentModel } from "./comments/comments.models";
export { AnnouncementModel } from "./announcements/announcements.models";
export { ReportModel } from "./reports/reports.models";