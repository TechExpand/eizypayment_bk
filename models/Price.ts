import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import Sequelize from 'sequelize/types/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Users } from './Users';


@Table({ timestamps: true, tableName: 'price' })
export class Price extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    cardCreation!: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    fundCardFeeValue!: number;


    @AllowNull(true)
    @Column(DataType.STRING)
    invoiceFeeValue!: number;


    @AllowNull(true)
    @Column(DataType.STRING)
    invoiceFeeMinValue!: number;


    @AllowNull(true)
    @Column(DataType.STRING)
    fundFeePercent!: number;


    @AllowNull(true)
    @Column(DataType.STRING)
    fundWalletFeeValue!: number;


    @AllowNull(true)
    @Column(DataType.STRING)
    withdrawWalletFeeValue!: number;


}
