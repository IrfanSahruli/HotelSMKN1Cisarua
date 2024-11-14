const router = require("express").Router();

//Users
router.use("/", require("./User/users"));

module.exports = router;