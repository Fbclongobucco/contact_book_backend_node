import { Module } from "@nestjs/common";
import { ContactModule } from './modules/contact/contact.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';

@Module({
    imports: [UserModule, ContactModule, ConfigModule.forRoot(), TypeOrmModule.forRoot({
        type: process.env.DATABASE_TYPE as "postgres",
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        autoLoadEntities: Boolean(process.env.DATABASE_AUTOLOADENTITIES),
        synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE)
    }), AuthModule, AccountModule]
})
export class AppModule{}