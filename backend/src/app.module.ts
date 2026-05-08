import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cocktail } from './cocktail/cocktail.entity';
import { CocktailModule } from './cocktail/cocktail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      url: process.env.DATABASE_URL,
      type: 'postgres',
      logging: true,
      entities: [Cocktail],
    }),
    CocktailModule,
  ],
})
export class AppModule {}
