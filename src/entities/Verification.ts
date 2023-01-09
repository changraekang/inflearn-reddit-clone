import { Exclude, Expose } from "class-transformer";
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { makeId, slugify } from "../utils/helpers";
import Comment from "./Comment";
import BaseEntity from "./Entity";
import Sub from "./Sub";
import { User } from "./User";
import Vote from "./Vote";

@Entity("verifications")
export default class Verification extends BaseEntity {
  @Index()
  @Column()
  identifier: string;

  @Column()
  email: string;

  @ManyToOne(() => User, (user) => user.verifications)
  @JoinColumn({ name: "email", referencedColumnName: "email" })
  user: User;
}
