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



@Table({ timestamps: true, tableName: 'invoice' })
export class Invoice extends Model {


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
    seller!: string;


    @AllowNull(true)
    @Column(DataType.JSON)
    customer!: any;


    @AllowNull(true)
    @Column(DataType.JSON)
    gateway!: any;


    @AllowNull(true)
    @Column(DataType.JSON)
    products!: any;


    @AllowNull(true)
    @Column(DataType.JSON)
    lineItems!: any;


    @AllowNull(true)
    @Column(DataType.STRING)
    issuedAt!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    paidAt!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    voidedAt!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    overdueAt!: string;



    @AllowNull(true)
    @Column(DataType.JSON)
    inputData!: string;



    @AllowNull(true)
    @Column(DataType.JSON)
    status!: string;




    @AllowNull(true)
    @Column(DataType.JSON)
    memo!: string;




    @AllowNull(true)
    @Column(DataType.JSON)
    url!: string;



    @AllowNull(true)
    @Column(DataType.JSON)
    payment!: string;


    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;
}
