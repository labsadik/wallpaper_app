import {Schema,model,models,type InferSchemaType} from "mongoose";

const UserSchema=new Schema({
  name:{type:String,trim:true,required:true,maxlength:80},
  email:{type:String,trim:true,lowercase:true,unique:true,index:true,required:true},
  passwordHash:{type:String,select:false},
  role:{type:String,enum:["user","publisher","admin"],default:"user",index:true},
  status:{type:String,enum:["active","suspended"],default:"active",index:true},
  image:{type:String}
},{timestamps:true});

export type UserDoc=InferSchemaType<typeof UserSchema>;
export default models.User||model("User",UserSchema);