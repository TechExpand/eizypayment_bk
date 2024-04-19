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



@Table({ timestamps: true, tableName: 'bank' })
export class Banks extends Model {


    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    accountName!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    bankAccount!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    bankName!: string;



    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;



}
