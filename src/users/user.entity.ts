import { Role } from 'src/role/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'firstName' })
  firstName: string;

  @Column({ name: 'lastName' })
  lastName: string;

  @Column({ default: true, name: 'isActive' })
  isActive: boolean;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, unique: true })
  userName: string;

  @Column({ nullable: false, unique: true })
  address: string;

  @Column({ nullable: false, name: 'privateKey' })
  privateKey: string;

  @Column({
    name: 'roles',
    array: true,
    type: 'enum',
    enum: ['admin', 'user'],
    enumName: 'rolesEnum',
    default: ['user'] 
  })
  roles: Role[];
}
