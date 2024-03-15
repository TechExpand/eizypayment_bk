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



@Table({ timestamps: true, tableName: 'paymentRequest' })
export class PaymentRequests extends Model {


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
    symbol!: string;
    


    @AllowNull(true)
    @Column(DataType.STRING)
    url!: string;




    @AllowNull(true)
    @Column(DataType.STRING)
    sellerName!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    sellerLogoUrl!: string;




    @AllowNull(true)
    @Column(DataType.STRING)
    cancelUrl!: string;




    @AllowNull(true)
    @Column(DataType.STRING)
    successUrl!: string;

    
    @AllowNull(true)
    @Column(DataType.JSON)
    products!: any;


    @AllowNull(true)
    @Column(DataType.JSON)
    gateway!: any;



    // @AllowNull(true)
    // @Column(DataType.STRING)
    // paidAt!: string;


    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    processed!: boolean;



    // @AllowNull(true)
    // @Column(DataType.JSON)
    // status!: string;


    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;
}
