import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cocktail } from "./cocktail.entity";
import { ElasticSearch } from "../elasticsearch.service";

@Injectable()
export class CocktailService implements OnModuleInit {
  constructor(
    @InjectRepository(Cocktail)
    private cocktailRepository: Repository<Cocktail>,
    private readonly elasticSearch: ElasticSearch,
  ) {}

  async onModuleInit() {
    try {
      const cocktails = await this.cocktailRepository.find();
      await this.elasticSearch.bulkIndex(cocktails);
      console.log(`Indexed ${cocktails.length} cocktails in Elasticsearch`);
    } catch (error) {
      console.error(
        "Failed to sync cocktails to Elasticsearch on startup:",
        error,
      );
    }
  }

  async findAll(search?: string): Promise<Cocktail[]> {
    if (!search) return this.cocktailRepository.find();
    try {
      const ids = await this.elasticSearch.fuzzySearch(search);
      if (ids.length > 0) {
        return this.cocktailRepository
          .createQueryBuilder("cocktail")
          .where("cocktail.id IN (:...ids)", { ids })
          .getMany();
      }
    } catch (error) {
      console.error(
        "Elasticsearch search failed, falling back to DB search:",
        error,
      );
    }
    return this.cocktailRepository
      .createQueryBuilder("cocktail")
      .where(
        "LOWER(cocktail.title) LIKE :search OR LOWER(cocktail.description) LIKE :search",
        { search: `%${search.toLowerCase()}%` },
      )
      .getMany();
  }

  findOne(id: number): Promise<Cocktail | null> {
    return this.cocktailRepository.findOneBy({ id });
  }

  async create(cocktail: Cocktail) {
    const existing = await this.cocktailRepository.findOneBy({
      title: cocktail.title,
    });
    if (existing) {
      throw new ConflictException(
        `A cocktail with title "${cocktail.title}" already exists`,
      );
    }
    const result = await this.cocktailRepository.insert(cocktail);
    const id = result.identifiers[0].id;
    try {
      await this.elasticSearch.indexCocktail({
        id,
        title: cocktail.title,
        description: cocktail.description,
      });
    } catch (error) {
      console.error("Failed to index new cocktail in Elasticsearch:", error);
    }
    return result;
  }

  async update(
    id: number,
    cocktail: Partial<Omit<Cocktail, "id">>,
  ): Promise<Cocktail> {
    const existing = await this.cocktailRepository.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    }

    if (cocktail.title && cocktail.title !== existing.title) {
      const duplicate = await this.cocktailRepository.findOneBy({
        title: cocktail.title,
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          `A cocktail with title "${cocktail.title}" already exists`,
        );
      }
    }

    await this.cocktailRepository.update(id, cocktail);
    const updated = { ...existing, ...cocktail } as Cocktail;

    try {
      await this.elasticSearch.indexCocktail({
        id,
        title: updated.title,
        description: updated.description,
      });
    } catch (error) {
      console.error("Failed to update cocktail in Elasticsearch:", error);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.cocktailRepository.delete(id);
    try {
      await this.elasticSearch.deleteCocktail(id);
    } catch (error) {
      console.error("Failed to delete cocktail from Elasticsearch:", error);
    }
  }
}
