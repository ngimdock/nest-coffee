import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Coffee } from './entities/coffees.entity';

@Injectable()
export class CoffeesService {
  private COFFEES: Coffee[] = [
    {
      id: 1,
      name: 'ngimdock',
      brand: 'developper',
      flavors: ['chocolate', 'vanilla'],
    },

    {
      id: 2,
      name: 'zemfack',
      brand: 'lover',
      flavors: [],
    },
  ];

  findAll(): Coffee[] {
    return this.COFFEES;
  }

  findOne(id: number): Coffee {
    const coffee = this.COFFEES.find((coffee) => coffee.id === id);

    if (!coffee) throw new NotFoundException(`Coffee with id #${id} not found`);

    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto): CreateCoffeeDto {
    this.COFFEES.push({ id: 0, ...createCoffeeDto });

    return createCoffeeDto;
  }

  update(id: number, data) {
    const coffee = this.findOne(id);

    const index = this.COFFEES.findIndex((coffee) => coffee.id === id);

    this.COFFEES[index] = { ...coffee, ...data };

    return this.COFFEES[index];
  }

  delete(id: number): Coffee {
    const index = this.COFFEES.findIndex((coffee) => coffee.id === id);

    const deletedCoffee = this.COFFEES[index];

    this.COFFEES.splice(index, 1);

    return deletedCoffee;
  }
}
