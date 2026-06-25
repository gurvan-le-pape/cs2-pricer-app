import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { SkinListing } from './skin-listing.entity';
import { SkinPrice } from './skin-price.entity';
import { SkinPrediction } from './skin-prediction.entity';
import { FxModule } from 'src/fx/fx.module';

@Module({
  imports: [
    HttpModule,
    FxModule,
    TypeOrmModule.forFeature([SkinListing, SkinPrediction, SkinPrice]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
