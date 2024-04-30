import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index } from 'sequelize-typescript';


export enum VerificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    BOTH = 'BOTH',
    RESET = 'RESET',
}

@Table({ timestamps: true, tableName: 'admin' })
export class Admin extends Model {
    @Default("1000")
    @AllowNull(false)
    @Column(DataType.STRING)
    rate!: string;



    @Default("")
    @AllowNull(false)
    @Column(DataType.STRING)
    USDC!: string;



    @Default("")
    @AllowNull(false)
    @Column(DataType.STRING)
    ETH!: string;



    @Default("")
    @AllowNull(false)
    @Column(DataType.STRING)
    USDT!: string;



    @Default("")
    @AllowNull(false)
    @Column(DataType.STRING)
    BTC!: string;



    @Default("")
    @AllowNull(false)
    @Column(DataType.STRING)
    BUSD!: string;

}
