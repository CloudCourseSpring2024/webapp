import { Sequelize } from "sequelize";
import bcrypt from 'bcrypt';
/*.*/
/* adding another com*/
export const userModel = (sequelize) => {
    const { DataTypes } = Sequelize;

    const User = sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            readOnly: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            writeOnly: true
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        account_created: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            readOnly: true
        },
        account_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            readOnly: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        hooks: {
            beforeCreate: async (user, options) => {
                // Hash the password before saving
                const hashedPassword = await bcrypt.hash(user.password, 10);
                user.password = hashedPassword;
            },
            beforeUpdate: async (user, options) => {
                // Only update specified fields
                const allowedFields = ['firstName', 'lastName', 'password'];
                for (const field in user._changed) {
                    if (!allowedFields.includes(field)) {
                        throw new Error('Attempting to update invalid field.');
                    }
                }
                // Update account_updated field
                user.accountUpdated = new Date();
                // Hash the password if it has changed
                if (user.changed('password')) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    user.password = hashedPassword;
                }
            },
        },
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
    });

    User.prototype.validPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};
