const Migrations = artifacts.require("Migrations");
const TodoList = artifacts.require("TodoList");
const ThriftStore = artifacts.require("ThriftStore");
module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TodoList);
  deployer.deploy(ThriftStore);
};
