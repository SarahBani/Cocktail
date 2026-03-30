import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Cocktails {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Mojito', description: 'Name of the cocktail' })
  @Column({ unique: true })
  title: string;

  @ApiProperty({ example: 'A refreshing mint cocktail', description: 'Description of the cocktail' })
  @Column()
  description: string;

  @ApiProperty({ example: 9.99, description: 'Price in euros' })
  @Column()
  price: number;
}