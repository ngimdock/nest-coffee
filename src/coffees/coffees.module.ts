import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee, Flavor } from './entities';
import { Event } from '../events/entities';
import { COFFEE_BRANDS } from './coffees.constants';

@Injectable()
class OptionsProvider {
  create(options: any) {
    return options;
  }

  get() {
    return 'get options';
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event]), CoffeesModule],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    OptionsProvider,
    {
      provide: COFFEE_BRANDS,
      useFactory: (optionsProvider: OptionsProvider) => [
        'buddy brew',
        'nescafe',
        optionsProvider.get(),
      ],
      inject: [OptionsProvider],
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
