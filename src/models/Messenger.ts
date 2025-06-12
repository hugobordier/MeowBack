import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import User from './User';

class Messenger extends Model{
    declare id: number;
    declare sender: string;
    declare recipientId: string;
    declare message: string;
    declare msgTimestamp: Date;
    declare isRead: boolean;
}

Messenger.init(
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sender:{
            type: DataTypes.UUID,
            allowNull: false,
        },
        recipientId:{
            type: DataTypes.UUID,
            allowNull: false,
        },
        message:{
            type: DataTypes.TEXT,
            allowNull: false,
        },
        msgTimestamp:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        isRead:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: db,
        tableName: 'Messenger',
        timestamps: false,
    }
);

//COnstraints
User.hasMany(Messenger, {foreignKey: 'sender', as: 'sentMessages'});
Messenger.belongsTo(User, {foreignKey: 'sender', as: 'senderUser'});

User.hasMany(Messenger, {foreignKey: 'recipientId', as: 'receivedMessages'});
Messenger.belongsTo(User, {foreignKey: 'recipientId', as: 'recipientUser'});


export default Messenger;