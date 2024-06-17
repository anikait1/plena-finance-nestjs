import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import { DecodeJWTMiddleware } from './common/jwt.middleware';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'plena-finance',
      autoLoadModels: true,
      synchronize: true,
      define: {
        underscored: true,
      },
    }),
    CacheModule.register({
      ttl: 5 * 60 * 1000, // 5 minutes
      max: 100,
      isGlobal: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DecodeJWTMiddleware)
      .exclude(
        { path: '/users', method: RequestMethod.POST },
        { path: '/users/token', method: RequestMethod.POST },
        { path: '/', method: RequestMethod.GET },
        { path: '/health-check', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
