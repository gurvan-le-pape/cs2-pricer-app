import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findBySteamId(steamId: string): Promise<User | null> {
    return this.repo.findOne({ where: { steamId } });
  }

  async upsert(data: {
    steamId: string;
    displayName: string;
    avatar: string;
  }): Promise<User> {
    const user = await this.findBySteamId(data.steamId);
    if (user) {
      user.displayName = data.displayName;
      user.avatar = data.avatar;
      return this.repo.save(user);
    }
    return this.repo.save(this.repo.create(data));
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }
}
