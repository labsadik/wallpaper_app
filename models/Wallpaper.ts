import {Schema,model,models,type InferSchemaType} from "mongoose";

export const WALLPAPER_DEVICES=["desktop","tablet","mobile"] as const;
export type WallpaperDevice=typeof WALLPAPER_DEVICES[number];

const WallpaperSchema=new Schema({
  title:{type:String,trim:true,required:true,maxlength:160,index:true},
  slug:{type:String,trim:true,unique:true,index:true,required:true},
  category:{type:String,trim:true,index:true,required:true},
  tags:{type:[String],default:[]},
  devices:{type:[String],enum:WALLPAPER_DEVICES,default:["desktop","tablet","mobile"],index:true},
  publisherId:{type:Schema.Types.ObjectId,ref:"User",index:true,required:true},
  status:{type:String,enum:["draft","processing","pending_review","published","rejected","archived"],default:"processing",index:true},
  publishAt:{type:Date,index:true},
  publishedAt:{type:Date,index:true},
  qualityStatus:{type:String,enum:["pending","pass","warning","fail"],default:"pending"},
  duplicateStatus:{type:String,enum:["pending","unique","possible_duplicate","duplicate"],default:"pending"},
  moderationReason:{type:String,trim:true,maxlength:500},
  removedAt:{type:Date,index:true},
  removedBy:{type:Schema.Types.ObjectId,ref:"User"},
  source:{width:Number,height:Number,sizeBytes:Number,mimeType:String,sha256:String,phash:String},
  variants:{
    desktop:{key:String,width:Number,height:Number,sizeBytes:Number,mimeType:String},
    tablet:{key:String,width:Number,height:Number,sizeBytes:Number,mimeType:String},
    mobile:{key:String,width:Number,height:Number,sizeBytes:Number,mimeType:String},
    thumbnail:{key:String,width:Number,height:Number,sizeBytes:Number,mimeType:String}
  },
  likeCount:{type:Number,default:0,index:true},
  saveCount:{type:Number,default:0},
  downloadCount:{type:Number,default:0,index:true}
},{timestamps:true});

export type WallpaperDoc=InferSchemaType<typeof WallpaperSchema>;
export default models.Wallpaper||model("Wallpaper",WallpaperSchema);
