import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CocktailsService } from './cocktails.service';
import { CocktailsController } from './cocktails.controller';
import { Cocktails } from './cocktails.entity';
import { ElasticSearch } from '../elasticsearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cocktails])],
  providers: [CocktailsService, ElasticSearch],
  controllers: [CocktailsController],
})
export class CocktailsModule {}
