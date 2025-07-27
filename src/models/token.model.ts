import { Date, Document, Schema, model} from "mongoose";


export interface Token {
    userId : String,
    token : String,
    createdAt : Date
}

export interface TokenDocument extends Token, Document {}

const tokenSchema = new Schema({
    userId : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },

token : {
    type : String,
    required : true
},

createdAt : {
    type: Date,
    default : Date.now,
    expires: 3600
}
})


export const Token = model<TokenDocument>("Token",tokenSchema );