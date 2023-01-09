import { Entity, Column, Index, OneToMany, BeforeInsert } from "typeorm";
import BaseEntity from "./Entity";

@Entity("schedules")
export class Schedule extends BaseEntity {
  @Index()
  @Column()
  Home: string;

  @Index()
  @Column()
  Away: string;

  @Index()
  @Column({ nullable: true })
  Weak: number;

  @Index()
  @Column({ nullable: true })
  Round: number;

  @Column({ nullable: true })
  Win: string;

  @Column({ nullable: true })
  Lose: string;

  @Column({ nullable: true })
  Days: string;

  @Index()
  @Column()
  date: Date;
}
