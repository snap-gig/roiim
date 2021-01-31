import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaysafeModule } from './paysafe/paysafe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PaysafeController } from './paysafe/paysafe.controller';
import { ConfigModule } from '@nestjs/config';


@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRoot(process.env.MONGO_DB_URL ?? "mongodb+srv://gagan:LuLVMUpqs1Oj8bmS@cluster0.2cspj.mongodb.net/Roiim?retryWrites=true&w=majority"),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
			exclude: ['/api*'],
		}),
		PaysafeModule,
	],
	controllers: [PaysafeController],
})
export class AppModule { }

