import { NestFactory } from '@nestjs/core';
import { faker } from '@faker-js/faker';
import { AppModule } from 'src/app.module';
import { BlockService } from 'src/users/block-user.service';
import { UsersService } from 'src/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const blockService = app.get(BlockService);

  const users = await usersService.bulkCreate(generateFakeUsers(10_000));
  const userIds = users.map((user) => user.id);
  await Promise.allSettled(
    [...Array(500)].map((_) => randomBlock(userIds, blockService)),
  );

  await app.close();
}

function generateFakeUsers(numberOfUsers: number) {
  const users = [];
  for (let i = 0; i < numberOfUsers; i++) {
    users.push({
      name: faker.person.firstName(),
      surname: Math.random() > 0.5 ? faker.person.lastName() : undefined,
      username: faker.internet.userName(),
      birthdate: faker.date.anytime(),
    });
  }

  return users;
}

function randomBlock(userIds: number[], blockService: BlockService) {
  const userOne = userIds[Math.floor(Math.random() * userIds.length)];
  const userTwo = userIds[Math.floor(Math.random() * userIds.length)];

  if (!userOne || !userTwo || userOne === userTwo) return;
  return blockService.create(userOne, userTwo);
}

bootstrap().catch((err) => {
  console.error('Seeding failed!', err);
  process.exit(1);
});
