import {Schema,model,models} from "mongoose";
const SaveSchema=new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true},wallpaperId:{type:Schema.Types.ObjectId,ref:"Wallpaper",required:true}},{timestamps:true});
SaveSchema.index({userId:1,wallpaperId:1},{unique:true});
export default models.Save||model("Save",SaveSchema);