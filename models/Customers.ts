import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import Sequelize from 'sequelize/types/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Users } from './Users';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}



export enum UserState {
    STEP_ONE = 'STEP_ONE',
    STEP_TWO = 'STEP_TWO',
    VERIFIED = 'VERIFIED',
}



@Table({ timestamps: true, tableName: 'customer' })
export class Customers extends Model {


    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id!: string;

    // @Index({ name: 'email-index', type: 'UNIQUE', unique: true })
    @AllowNull(true)
    @Column(DataType.STRING)
    randoId!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    organizationId!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    name!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    email!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    billingAddress!: string;




    @AllowNull(true)
    @Column(DataType.STRING)
    phone!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    telegram!: string;




    @AllowNull(true)
    @Column(DataType.STRING)
    discord!: string;



    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;



}
