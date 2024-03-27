import { Sequelize } from "sequelize";

export const emailverifyModel = (sequelize) => {
    const { DataTypes } = Sequelize;

    const Emailverify = sequelize.define("Emailverify", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        timestamps: true
    });

    return Emailverify;
};
