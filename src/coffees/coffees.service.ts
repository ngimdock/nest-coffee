import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCoffeeDto } from './dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Coffee } from './entities/coffees.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ) {}

  /**
   * return all coffees on database
   */
  async findAll(): Promise<Coffee[]> {
    return await this.coffeeRepository.find();
  }

  /**
   *return a specific coffee on database base on it id
   * @param id number
   * @returns Promise<Coffee>
   */
  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOneBy({ id });

    if (!coffee) throw new NotFoundException(`Coffee with id #${id} not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this.coffeeRepository.create(createCoffeeDto);

    return await this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
    });

    if (!coffee) throw new NotFoundException(`Coffee with id #${id} not found`);

    return await this.coffeeRepository.save(coffee);
  }

  async delete(id: number) {
    const coffee = await this.findOne(id);

    return await this.coffeeRepository.remove(coffee);
  }
}
