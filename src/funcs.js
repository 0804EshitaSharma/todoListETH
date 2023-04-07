import ThriftStore from '../build/contracts/ThriftStore.json';
import Web3 from 'web3';
var contract = require('@truffle/contract');

export const load = async () => {
    await loadWeb3();
    const addressAccount = await loadAccount();
    const { todoContract, tasks } = await loadContract(addressAccount);
    console.error({ todoContract, tasks });
    return { addressAccount, todoContract, tasks };
};

export const postTasks = async ( itemName,
    itemDescription,
    itemPrice,
    itemPickupLocation, addressAccount) => {
  await todoContract.postAd( itemName,
    itemDescription,
    itemPrice,
    itemPickupLocation, {from: addressAccount});
};

//view listing modify below code
const loadTasks = async (todoContract, addressAccount) => {
    const tasksCount = await todoContract.getAllItemIdsPostedByUser({from: addressAccount});
    const tasks = [];
    for (var i = 0; i < tasksCount; i++) {
        const task = await todoContract.getItem(tasksCount[i]);
        tasks.push(task);
    }
    console.error(tasks);
    return tasks
};

const loadContract = async (addressAccount) => {
    const theContract = contract(ThriftStore);
    theContract.setProvider(web3.eth.currentProvider);
    const todoContract = await theContract.deployed();
    await postTasks(todoContract, addressAccount);
    const tasks = await loadTasks(todoContract, addressAccount);

    return { todoContract, tasks }
};

const loadAccount = async () => {
    const addressAccount = await web3.eth.getCoinbase();
    return addressAccount;
};

const loadWeb3 = async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */});
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
};