import { Schema } from "mongoose";
import { IReportDocument, IReportModel } from "./reports.types";

import { reportType } from "../../types/report";

const ReportSchema = new Schema<IReportDocument, IReportModel>({
    content: String,
    data: {
        type: String,
        default: ""
    },
    timestamp: Number,
    userID: String,
    type: {
        type: Number,
        enum: reportType,
        default: undefined
    }
});
ReportSchema.index({ content: "text" });

export default ReportSchema;