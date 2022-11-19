import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities';
import { DataSource, Repository } from 'typeorm';
import { UpdateCoffeeDto } from './dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Coffee, Flavor } from './entities';
import coffeesConfig from './config/coffees.config';

@Injectable({ scope: Scope.DEFAULT })
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private datasource: DataSource,
    private readonly configService: ConfigService,
    @Inject(coffeesConfig.KEY)
    private readonly configConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    console.log({ configConfiguration });
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;

    return await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
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

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new Event();

      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
