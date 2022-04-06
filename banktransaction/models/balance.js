"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Balance.belongsTo(models.Users, {
        foreignKey: "usersId",
        onDelete: "CASCADE",
      });
    }
  }
  Balance.init(
    {
      balance: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Balance",
    }
  );
  return Balance;
};
