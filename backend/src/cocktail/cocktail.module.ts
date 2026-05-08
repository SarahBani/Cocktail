import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CocktailService } from './cocktail.service';
import { CocktailController } from './cocktail.controller';
import { Cocktail } from './cocktail.entity';
import { ElasticSearch } from '../elasticsearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cocktail])],
  providers: [CocktailService, ElasticSearch],
  controllers: [CocktailController],
})
export class CocktailModule {}
