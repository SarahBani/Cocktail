import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cocktails } from './cocktails.entity';
import { CocktailsService } from './cocktails.service';

@ApiTags('cocktails')
@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  @ApiOperation({ summary: 'Get cocktails' })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'List of cocktails', type: [Cocktails] })
  searchCocktails(@Query('search') search?: string) : Promise<Cocktails[]> {
    return this.cocktailsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cocktail by ID' })
  @ApiResponse({ status: 200, description: 'Cocktail found', type: Cocktails })
  @ApiResponse({ status: 404, description: 'Cocktail not found' })
  async getCocktail(@Param('id', ParseIntPipe) id: number): Promise<Cocktails> {
    const cocktail = await this.cocktailsService.findOne(id);
    if (!cocktail) throw new NotFoundException(`Cocktail with id ${id} not found`);
    return cocktail;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cocktail' })
  @ApiResponse({ status: 201, description: 'Cocktail created successfully', type: Boolean })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async newCocktail(@Body() cocktail: Cocktails) {
    console.log("info: creating cocktail", cocktail)
    const res = await this.cocktailsService.create(cocktail);
    console.log("res", res);
    return true;
  }
}
