import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import Sequelize from 'sequelize/types/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Users } from './Users';


@Table({ timestamps: true, tableName: 'card' })
export class Card extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    cardId!: string;

    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    freeze!: boolean;


    @AllowNull(true)
    @Column(DataType.JSON)
    meta!: any;


    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;

}
