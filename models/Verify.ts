import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index } from 'sequelize-typescript';


export enum VerificationType {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
    BOTH = 'BOTH',
	RESET = 'RESET',
}

@Table({ timestamps: true, tableName: 'verify' })
export class Verify extends Model {
	@AllowNull(false)
	@Column(DataType.STRING)
	serviceId!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	code!: string;


	@AllowNull(true)
	@Column(DataType.STRING)
	secret_key!: string;


	@AllowNull(true)
	@Column(DataType.STRING)
	client!: string;


    @Default(false)
	@AllowNull(true)
	@Column(DataType.BOOLEAN)
	used!: string;

	


	// @Default(VerificationType.EMAIL)
	// @Column(DataType.ENUM(VerificationType.EMAIL, VerificationType.SMS))
	// status!: VerificationType;

}
