import { Table, Model, Column, DataType, AllowNull, Default, PrimaryKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';


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
    rate!: number;


    @AllowNull(true)
    @Column(DataType.STRING)
    gasFee!: number;

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
