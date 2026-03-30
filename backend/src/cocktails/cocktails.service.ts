import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cocktails } from './cocktails.entity';
import { ElasticSearch } from '../elasticsearch.service';

@Injectable()
export class CocktailsService implements OnModuleInit {
  constructor(
    @InjectRepository(Cocktails)
    private usersRepository: Repository<Cocktails>,
    private readonly elasticSearch: ElasticSearch,
  ) {}

  async onModuleInit() {
    try {
      const cocktails = await this.usersRepository.find();
      await this.elasticSearch.bulkIndex(cocktails);
      console.log(`Indexed ${cocktails.length} cocktails in Elasticsearch`);
    } catch (error) {
      console.error('Failed to sync cocktails to Elasticsearch on startup:', error);
    }
  }

  async findAll(search?: string): Promise<Cocktails[]> {
    if (!search) return this.usersRepository.find();
    try {
      const ids = await this.elasticSearch.fuzzySearch(search);
      if (ids.length > 0) {
        return this.usersRepository
          .createQueryBuilder('cocktail')
          .where('cocktail.id IN (:...ids)', { ids })
          .getMany();
      }
    } catch (error) {
      console.error('Elasticsearch search failed, falling back to DB search:', error);
    }
    return this.usersRepository
      .createQueryBuilder('cocktail')
      .where(
        'LOWER(cocktail.title) LIKE :search OR LOWER(cocktail.description) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      )
      .getMany();
  }

  findOne(id: number): Promise<Cocktails | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(cocktail: Cocktails) {
    const existing = await this.usersRepository.findOneBy({ title: cocktail.title });
    if (existing) {
      throw new ConflictException(`A cocktail with title "${cocktail.title}" already exists`);
    }
    const result = await this.usersRepository.insert(cocktail);
    const id = result.identifiers[0].id;
    try {
      await this.elasticSearch.indexCocktail({ id, title: cocktail.title, description: cocktail.description });
    } catch (error) {
      console.error('Failed to index new cocktail in Elasticsearch:', error);
    }
    return result;
  }
}
