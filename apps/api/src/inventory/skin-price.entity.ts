import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SkinListing } from './skin-listing.entity';

@Entity('skin_prices')
export class SkinPrice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'listing_id' })
  listingId!: string;

  @Column({ name: 'price_cny', type: 'float' })
  priceCny!: number;

  @Column({ name: 'fetched_at' })
  fetchedAt!: Date;

  @ManyToOne(() => SkinListing, (l) => l.prices)
  @JoinColumn({ name: 'listing_id' })
  listing!: SkinListing;
}
