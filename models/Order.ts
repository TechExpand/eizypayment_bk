import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import Sequelize from 'sequelize/types/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Users } from './Users';
import { UserTokens } from './UserToken';
import { WithdrawalStatus } from './Withdrawal';


export enum OrderTypeState {
    BUY = 'BUY',
    SELL = 'SELL'
}

@Table({ timestamps: true, tableName: 'order' })
export class Order extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id!: string;
   

    @AllowNull(true)
    @Column(DataType.STRING)
    network!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    reason!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    token!: string;

    @Default("")
    @AllowNull(true)
    @Column(DataType.STRING)
    address!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    symbol!: string;


    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    processed!: boolean;


    @Default(0.0)
    @AllowNull(true)
    @Column(DataType.FLOAT)
    amount!: any;


    @Default(0.0)
    @AllowNull(true)
    @Column(DataType.FLOAT)
    usd!: any;
    

    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;

    @Default(OrderTypeState.BUY)
    @AllowNull(true)
    @Column(DataType.ENUM(OrderTypeState.BUY, OrderTypeState.SELL))
    type!: OrderTypeState;


    @Default(WithdrawalStatus.PENDING)
    @Column(DataType.ENUM(WithdrawalStatus.COMPLETE, WithdrawalStatus.FAILED, WithdrawalStatus.PENDING))
    status!: WithdrawalStatus


    @BelongsTo(() => Users, { onDelete: 'CASCADE' })
    user!: Users;
}



