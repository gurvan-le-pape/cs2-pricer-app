import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { SkinListing } from './skin-listing.entity';

@Entity('skin_predictions')
export class SkinPrediction {
  @PrimaryColumn({ name: 'listing_id' })
  listingId!: string;

  @Column({ name: 'predicted_price_cny', type: 'float' })
  predictedPriceCny!: number;

  @Column({ name: 'undervalue_pct', type: 'float' })
  undervaluePct!: number;

  @Column({ name: 'predicted_at' })
  predictedAt!: Date;

  @OneToOne(() => SkinListing, (l) => l.prediction)
  @JoinColumn({ name: 'listing_id' })
  listing!: SkinListing;
}
