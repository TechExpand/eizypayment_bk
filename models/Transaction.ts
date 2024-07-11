import {
    Table,
    Model,
    Column,
    DataType,
    HasOne,
    BelongsToMany,
    BelongsTo,
    ForeignKey,
    HasMany,
    AllowNull,
    Default,
} from 'sequelize-typescript';
import { Users } from './Users';



export enum TransactionType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT',
    NOTIFICATION = "NOTIFICATION"
}


export enum ServiceType {
    INVOICE = "INVOICE",
    PAYMENT_REQUEST = "PAYMENT_REQUEST",
    CROWD_FUND = "CROWD_FUND",
    WITHDRAWAL = "WITHDRAWAL",
    NOTIFICATION = "NOTIFICATION",
    CRYPTO = "CRYPTO"
}

export enum TransactionDateType {
    SINGLE_DATE = 'SINGLE_DATE',
    THIS_MONTH = 'THIS_MONTH',
    DATE_RANGE = 'DATE_RANGE',
    ALL = 'ALL',

}


export enum TransactionStatus {
    COMPLETE = "COMPLETE",
    PENDING = "PENDING",
    NONE = "NONE"
}



@Table({ timestamps: true, tableName: 'transactions' })
export class Transactions extends Model {



    @AllowNull(true)
    @Column(DataType.STRING)
    ref!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    description!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    title!: string;


    @AllowNull(true)
    @Column(DataType.ENUM(TransactionType.CREDIT, TransactionType.DEBIT, TransactionType.NOTIFICATION))
    type!: TransactionType;


    @AllowNull(true)
    @Column(DataType.ENUM(ServiceType.INVOICE, ServiceType.CRYPTO, ServiceType.PAYMENT_REQUEST, ServiceType.WITHDRAWAL, ServiceType.CROWD_FUND, ServiceType.NOTIFICATION))
    service!: ServiceType;


    @AllowNull(true)
    @Column(DataType.STRING)
    amount!: number;


    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    read!: boolean;


    @AllowNull(true)
    @Column(DataType.ENUM(TransactionStatus.COMPLETE, TransactionStatus.PENDING, TransactionStatus.NONE))
    status!: TransactionStatus;


    @AllowNull(true)
    @Column(DataType.JSON)
    mata!: any;


    @AllowNull(true)
    @ForeignKey(() => Users)
    @Column(DataType.UUID)
    userId!: string;




}
