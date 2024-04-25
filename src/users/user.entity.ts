import { Role } from 'src/role/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    nullable: false,
    unique: true,
  })
  address: string;

  @Column({
    nullable: false,
    name: 'private_key',
  })
  privateKey: string;

  @Column({
    name: 'roles',
    array: true,
    type: 'enum',
    enum: ['admin', 'user'],
    enumName: 'rolesEnum',
    default: ['user'],
  })
  roles: Role[];
}
