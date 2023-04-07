import type { NextPage } from "next";
import Head from "next/head";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Box,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import React from "react";
import { load, postTasks } from "../src/funcs";
import ThriftStore from '../build/contracts/ThriftStore.json';
import Web3 from 'web3';
var contract = require('@truffle/contract');

const Home: NextPage = () => {
  const [input, setInput] = React.useState<string>("");
  const [refresh, setRefresh] = React.useState<boolean>(true);
  const [addressAccount, setAddresAccount] = React.useState<any>(null);
  const [contract, setContract] = React.useState<any>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [itemName, setItemName] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("");
  const [itemDescription, setItemDescription] = React.useState("");
  const [itemPickupLocation, setItemPickupLocation] = React.useState("");

  const [show, setShow] = React.useState("");
  const [previews, setPreviews] = React.useState();

  // Handlers

  const handleInputChange = (e: any) => setInput(e.currentTarget.value);
  const handleToggled = async (id: number) => {
    await contract.toggleCompleted(id, { from: addressAccount });
    setRefresh(true);
  };
  const handleAddTask = async () => {
    postTasks(itemName,
      itemDescription,
      itemPrice,
      itemPickupLocation) ;
    setRefresh(false);
    load().then((e) => {
      setAddresAccount(e.addressAccount);
      setTasks(e.tasks);
      setContract(e.todoContract);
    });
};



  return (
    <VStack>
      <Head>
        <title>Todo List</title>
        <meta name="description" content="Blockchain TodoList." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HStack w="full">
        <Spacer />
        <VStack>
          <Heading>Blockchain TodoList</Heading>
          <Box h="30px" />
          <HStack w="md">
            <div className="form-container">
              {!show && (
                <form className="register-form" onSubmit={handleAddTask}>
                  <input
                    id="first-name"
                    className="form-field"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Item Name"
                    required={true}
                    name="firstName"
                  />
                  <input
                    id="text"
                    className="form-field"
                    type="text"
                    value={itemPickupLocation}
                    onChange={(e) => setItemPickupLocation(e.target.value)}
                    placeholder="Pick up Location"
                    name="email"
                    required={true}
                  />
                  <input
                    id="number"
                    className="form-field"
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="Item price"
                    required={true}
                    name="number"
                  />
                  <textarea
                    id="last-name"
                    className="form-field"
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Item Description"
                    required={true}
                    name="lastName"
                  />
                  <input
                    type="file"
                    name="picture"
                    accept="image/jpg, image/jpeg, image/png"
                    onChange={(e) => setImage(e.target.files)}
                  />
                  <button className="form-field" type="submit">
                    Post
                  </button>
                </form>
              )}
              {show && (
                <div>
                  {" "}
                  <Home
                    itemName={itemName}
                    itemPrice={itemPrice}
                    itemDescription={itemDescription}
                    itemPickupLocation={itemPickupLocation}
                    image={image}
                    previews={previews}
                  />
                </div>
              )}
            </div>
          </HStack>
          <Box h="30px" />
          <Text>Posted items</Text>
          {tasks == null ? (
            <Spinner />
          ) : (
            tasks.map((task, idx) =>
              !task[2] ? (
                <HStack key={idx} w="md" bg="gray.100" borderRadius={7}>
                  <div className="productList">
                    <div key={itemName} className="productCard">
                      {previews &&
                       previews.map((pic) => {
                          return (
                            <img
                              src={pic}
                              alt="product-img"
                              className="productImage"
                            ></img>
                          );
                        })}
                      <div className="productCard__content">
                        <h3 className="productName">{itemName}</h3>
                        <h3 className="productName">{itemDescription}</h3>
                        <div className="displayStack__1">
                          <div className="productPrice">
                            {itemPrice} ETH{" "}
                          </div>
                          <div className="productTime">
                            {itemPickupLocation}
                          </div>
                        </div>
                      </div>
                      <button className="button">Buy</button>
                    </div>
                  </div>
                </HStack>
              ) : null
            )
          )}
          <Box h="10px" />
          <Text>Tasks done</Text>
          {tasks == null ? (
            <Spinner />
          ) : (
            tasks.map((task, idx) =>
              task[2] ? (
                <HStack key={idx} w="md" bg="gray.100" borderRadius={7}>
                  <Box w="5px" />
                  <Text>{task[1]}</Text>
                  <Spacer />
                  <Button
                    bg="red.300"
                    onClick={() => handleToggled(task[0].toNumber())}
                  >
                    UNDONE
                  </Button>
                </HStack>
              ) : null
            )
          )}
        </VStack>
        <Spacer />
      </HStack>
    </VStack>
  );
};

export default Home;
