import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCoffeeDto } from './dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Coffee, Flavor } from './entities';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
  ) {}

  async findAll(): Promise<Coffee[]> {
    return await this.coffeeRepository.find({
      relations: ['flavors'],
    });
  }

  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOne({
      where: { id },
      relations: ['flavors'],
    });

    if (!coffee) throw new NotFoundException(`Coffee with id #${id} not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    // first create all the coffee's flavors if they don't exist on database

    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.prayloadFlavorByName(name)),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });

    return await this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.prayloadFlavorByName(name)),
      ));

    console.log({ flavors });

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });

    if (!coffee) throw new NotFoundException(`Coffee with id #${id} not found`);

    return await this.coffeeRepository.save(coffee);
  }

  async delete(id: number) {
    const coffee = await this.findOne(id);

    return await this.coffeeRepository.remove(coffee);
  }

  private async prayloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });

    if (existingFlavor) return existingFlavor;

    return this.flavorRepository.create({ name });
  }
}
