import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/common/decorators';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ParseIntPipe } from 'src/common/pipes/parse-int.pipe';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';
import { ApiForbiddenResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('coffees')
@ApiTags('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all coffees' })
  @ApiForbiddenResponse({ description: 'Forbiden.' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.coffeesService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a coffee' })
  findOne(@Param('id') id: number) {
    console.log('hey');

    return this.coffeesService.findOne(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a coffee' })
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coffee' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
  ) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coffee' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coffeesService.delete(id);
  }
}
