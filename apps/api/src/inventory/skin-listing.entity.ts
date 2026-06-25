import { Entity, PrimaryColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { SkinPrediction } from './skin-prediction.entity';
import { SkinPrice } from './skin-price.entity';

@Entity('skin_listings')
export class SkinListing {
  @PrimaryColumn()
  id!: string;

  @Column({ name: 'skin_id' })
  skinId!: string;

  @Column({ name: 'wear_id' })
  wearId!: string;

  @Column()
  type!: string;

  @Column({ name: 'market_hash_name' })
  marketHashName!: string;

  @Column({ name: 'total_supply', nullable: true })
  totalSupply!: number;

  @Column({ name: 'buff_id', nullable: true })
  buffId!: number;

  @OneToOne(() => SkinPrediction, (p) => p.listing)
  prediction!: SkinPrediction;

  @OneToMany(() => SkinPrice, (p) => p.listing)
  prices!: SkinPrice[];
}
