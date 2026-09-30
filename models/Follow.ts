import {Schema,model,models,type InferSchemaType} from "mongoose";

const FollowSchema=new Schema({
  followerId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
  followingId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true}
},{timestamps:true});

FollowSchema.index({followerId:1,followingId:1},{unique:true});
FollowSchema.index({followingId:1,createdAt:-1});
FollowSchema.index({followerId:1,createdAt:-1});

export type FollowDoc=InferSchemaType<typeof FollowSchema>;
export default models.Follow||model("Follow",FollowSchema);
