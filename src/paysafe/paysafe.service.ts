import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaysafeService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<any>
	) { }


	async getUserByEmail(email: string) {
		return await this.userModel.findOne({ email: email })
	}

	async createUser(userData: any) {
		return await this.userModel.create(userData);
	}

	async updateUser(email: string, paysafeCustomerId: string) {
		return await this.userModel.findOneAndUpdate({ email: email }, { $set: { paysafeCustomerId: paysafeCustomerId } })
	}

}
