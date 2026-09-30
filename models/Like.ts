import {Schema,model,models} from "mongoose";
const LikeSchema=new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true},wallpaperId:{type:Schema.Types.ObjectId,ref:"Wallpaper",required:true}},{timestamps:true});
LikeSchema.index({userId:1,wallpaperId:1},{unique:true});
export default models.Like||model("Like",LikeSchema);