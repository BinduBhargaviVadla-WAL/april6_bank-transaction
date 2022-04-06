const express = require("express");
const { sequelize } = require("../models");
const router = express.Router();
const usersModel = require("../models").Users;
const balanceModel = require("../models").Balance;
const transactionModel = require("../models").Transaction;

router.get("/", function (req, res) {
  usersModel.findAll().then(
    function (users) {
      res.status(200).json(users);
    },
    function (error) {
      res.status(500).send(error);
    }
  );
});
router.post("/addUser", function (req, res) {
  usersModel
    .create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    })
    .then(function (users) {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.post("/addBalance", function (req, res) {
  balanceModel
    .create({
      balance: req.body.balance,
      userId: req.body.userId,
    })
    .then((balance) => {
      res.status(200).json(balance);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.get("/viewTransactions", (req, res) => {
  transactionModel
    .findAll()
    .then((transaction) => {
      res.status(200).json(transaction);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.post("/addTransaction", function (req, res) {
  transactionModel
    .create({
      transaction_date: req.body.transaction_date,
      transaction_amount: req.body.transaction_amount,
      userId: req.body.userId,
    })
    .then((transaction) => {
      res.status(200).json(transaction);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.get("/viewBalance", (req, res) => {
  balanceModel
    .findAll()
    .then((balance) => {
      res.status(200).json(balance);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.post("/transaction", async (req, res) => {
  let transaction;
  let fromUserId, toUserId;
  let amount = req.body.amount;
  try {
    transaction = await sequelize.transaction();
    const fromUser = await usersModel.findOne({
      where: { username: req.body.fromUser },
    });
    const toUser = await usersModel.findOne({
      where: { username: req.body.toUser },
    });

    if (fromUser == null || toUser == null) {
      console.log("users not found");
      res.json({ status: 0, data: "users not found" });
    } else {
      fromUserId = fromUser.id;
      toUserId = toUser.id;
      const fromBalance = await balanceModel.findOne({
        where: { usersId: fromUserId },
      });
      const toBalance = await balanceModel.findOne({
        where: { usersId: toUserId },
      });
      if ((fromBalance == null) & (toBalance == null)) {
        console.log("Balance not found");
        res.json({ status: 0, data: "Balance not found" });
      }
      if (fromBalance < amount) {
        console.log(`User does not have sufficient amount to transfer`);
        res.json({
          status: 0,
          data: "User does not have sufficient amount to transfer",
        });
      } else {
        const updatedFromBalance = await balanceModel.update(
          { balance: fromBalance.balance - amount },
          { where: { usersId: fromUserId } },
          { transaction }
        );
        const updatedToBalance = await balanceModel.update(
          { balance: toBalance.balance - amount },
          { where: { usersId: toUserId } },
          { transaction }
        );
        const transactionDetails = await transactionModel.create(
          {
            transaction_date: new Date(),
            transaction_amount: amount,
            usersId: 1,
          },
          { transaction }
        );
        console.log("success");
        await transaction.commit();
        res.json({ updatedFromBalance, updatedToBalance, transactionDetails });
      }
    }
  } catch (error) {
    console.log("error");
    if (transaction) {
      await transaction.rollback();
    }
    res.json(error);
  }
});

module.exports = router;
