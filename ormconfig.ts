import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const connectionSource = new DataSource({
  type: 'postgres',
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_NAME'),
  host: configService.get<string>('POSTGRES_HOST'),
  port: +configService.get<number>('POSTGRES_PORT'),
  synchronize: false,
  entities: ['dist/**/**.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  //   subscribers: ['dist/subscribers/**/*{.ts,.js}'],
});
