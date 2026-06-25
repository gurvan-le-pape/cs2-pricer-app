import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { InventoryService } from './inventory.service';
import { User } from '../users/user.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getInventory(@Req() req: Request & { user: User }) {
    return this.inventoryService.getInventory(req.user.steamId);
  }
}
