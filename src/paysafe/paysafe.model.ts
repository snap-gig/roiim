import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String, trim: true, lowercase: true, sparse: true },
	mobileNumber:{type:Number},
	paysafeCustomerId: { type: String }
}, {
	timestamps: true
});