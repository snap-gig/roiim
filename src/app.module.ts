import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaysafeModule } from './paysafe/paysafe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PaysafeController } from './paysafe/paysafe.controller';

@Module({
	imports: [
		PaysafeModule,
		MongooseModule.forRoot('mongodb+srv://gagan:LuLVMUpqs1Oj8bmS@cluster0.2cspj.mongodb.net/Roiim?retryWrites=true&w=majority'),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
			exclude: ['/api*'],
		}),
	],
	controllers: [PaysafeController],
})
export class AppModule { }

