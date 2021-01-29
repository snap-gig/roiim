import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './paysafe.model';
import { PaysafeService } from './paysafe.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
	],
	providers: [PaysafeService],
	exports: [PaysafeService, MongooseModule]
})
export class PaysafeModule { }
