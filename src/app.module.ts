import { Module } from "@nestjs/common";
import { ContactModule } from './modules/contact/contact.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [UserModule, ContactModule,  TypeOrmModule.forRoot({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "91710956",
        database: "contact_book_node",
        autoLoadEntities: true,
        synchronize: true
    })]
})
export class AppModule{}