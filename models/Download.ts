import {Schema,model,models} from "mongoose";
const DownloadSchema=new Schema({userId:{type:Schema.Types.ObjectId,ref:"User"},wallpaperId:{type:Schema.Types.ObjectId,ref:"Wallpaper",required:true},requestId:{type:String,index:true}},{timestamps:true});
export default models.Download||model("Download",DownloadSchema);