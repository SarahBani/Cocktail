import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Cocktail } from "./cocktail.entity";
import { CocktailService } from "./cocktail.service";

@ApiTags("cocktail")
@Controller("cocktail")
export class CocktailController {
  constructor(private readonly cocktailsService: CocktailService) {}

  @Get()
  @ApiOperation({ summary: "Get cocktails" })
  @ApiQuery({ name: "search", required: false })
  @ApiResponse({
    status: 200,
    description: "List of cocktails",
    type: [Cocktail],
  })
  searchCocktail(@Query("search") search?: string): Promise<Cocktail[]> {
    return this.cocktailsService.findAll(search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a cocktail by ID" })
  @ApiResponse({ status: 200, description: "Cocktail found", type: Cocktail })
  @ApiResponse({ status: 404, description: "Cocktail not found" })
  async getCocktail(@Param("id", ParseIntPipe) id: number): Promise<Cocktail> {
    const cocktail = await this.cocktailsService.findOne(id);
    if (!cocktail)
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    return cocktail;
  }

  @Post()
  @ApiOperation({ summary: "Create a new cocktail" })
  @ApiResponse({
    status: 201,
    description: "Cocktail created successfully",
    type: Boolean,
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async newCocktail(@Body() cocktail: Cocktail) {
    console.log("info: creating cocktail", cocktail);
    const res = await this.cocktailsService.create(cocktail);
    console.log("res", res);
    return true;
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a cocktail" })
  @ApiResponse({
    status: 200,
    description: "Cocktail updated successfully",
    type: Cocktail,
  })
  @ApiResponse({ status: 404, description: "Cocktail not found" })
  async updateCocktail(
    @Param("id", ParseIntPipe) id: number,
    @Body() cocktail: Partial<Omit<Cocktail, "id">>,
  ): Promise<Cocktail> {
    const edited = await this.cocktailsService.findOne(id);
    if (!edited)
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    return this.cocktailsService.update(id, cocktail);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a cocktail by ID" })
  @ApiResponse({ status: 204, description: "Cocktail deleted successfully" })
  @ApiResponse({ status: 404, description: "Cocktail not found" })
  async deleteCocktail(@Param("id", ParseIntPipe) id: number): Promise<void> {
    const cocktail = await this.cocktailsService.findOne(id);
    if (!cocktail)
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    await this.cocktailsService.delete(id);
  }
}
