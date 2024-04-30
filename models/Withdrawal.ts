import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import Sequelize from 'sequelize/types/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Users } from './Users';
import { UserTokens } from './UserToken';

export enum WithdrawalStatus {
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    COMPLETE = 'COMPLETE',
}


export enum UserState {
    STEP_ONE = 'STEP_ONE',
    STEP_TWO = 'STEP_TWO',
    VERIFIED = 'VERIFIED',
}


export enum WithdrawTypeState {
    P2P = 'P2P',
    CRYPTO = 'CRYPTO'
}

@Table({ timestamps: true, tableName: 'withdrawal' })
export class Withdrawal extends Model {


    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    randoId!: string;

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
    withdrawalAddress!: string;


    @AllowNull(true)
    @Column(DataType.JSON)
    bank!: any;


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


    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;

    @Default(WithdrawTypeState.CRYPTO)
    @AllowNull(true)
    @Column(DataType.ENUM(WithdrawTypeState.P2P, WithdrawTypeState.CRYPTO))
    type!: WithdrawTypeState;


    @ForeignKey(() => UserTokens)
    @AllowNull(false)
    @Column(DataType.UUID)
    userTokenId!: string;



    @Default(WithdrawalStatus.PENDING)
    @Column(DataType.ENUM(WithdrawalStatus.COMPLETE, WithdrawalStatus.FAILED, WithdrawalStatus.PENDING))
    status!: WithdrawalStatus


    @BelongsTo(() => Users, { onDelete: 'CASCADE' })
    user!: Users;



    @BelongsTo(() => UserTokens, { onDelete: 'CASCADE' })
    userToken!: UserTokens;
}



