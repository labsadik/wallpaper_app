import {Schema,model,models,type InferSchemaType} from "mongoose";

const UserSchema=new Schema({
  name:{type:String,trim:true,required:true,maxlength:80},
  username:{type:String,trim:true,lowercase:true,index:true,unique:true,sparse:true,maxlength:80},
  email:{type:String,trim:true,lowercase:true,unique:true,index:true,required:true},
  passwordHash:{type:String,select:false},
  role:{type:String,enum:["user","publisher","admin"],default:"user",index:true},
  status:{type:String,enum:["active","suspended","banned"],default:"active",index:true},
  isVerified:{type:Boolean,default:false,index:true},
  avatarKey:{type:String,trim:true},
  suspensionUntil:{type:Date,index:true},
  suspensionReason:{type:String,trim:true,maxlength:500},
  bannedAt:{type:Date},
  banReason:{type:String,trim:true,maxlength:500},
  image:{type:String}
},{timestamps:true});

export type UserDoc=InferSchemaType<typeof UserSchema>;
export default models.User||model("User",UserSchema);
