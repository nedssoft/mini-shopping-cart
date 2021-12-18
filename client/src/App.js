import React, { useState } from 'react';
import {
  Container,
  Heading,
  Stack,
  Input,
  FormControl,
  FormLabel,
  Button,
  Flex,
  Skeleton,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import ItemManager from './contracts/ItemManager.json';
import getWeb3 from './getWeb3';
import PaymentDetails from './components/PaymentDetails';
import NotifyPayment from './components/Notify';

export default function App() {
  const disclosure = useDisclosure();
  const onOpen = disclosure.onOpen;
  const [paymentReceived, setPaymentReceived] = React.useState(false);
  const [accounts, setAccounts] = useState(null);
  const itemManager = React.useRef(null);
  const web3Ref = React.useRef(null);
  const [itemAddress, setItemAddress] = useState(null);
  const [state, setState] = useState({
    cost: 0,
    itemName: 'Bored Ape NFT',
    loaded: false,
  });

  const listenToPaymentEvent = async (_itemManager) => {
    const itemManager = _itemManager.current;
    itemManager.events.SupplyChainStep().on('data', async function (evt) {
      if (Number(evt.returnValues._step) === 1) {
        // let item = await itemManager.methods
        //   .items(evt.returnValues._itemIndex)
        //   .call();
        // console.log(item);
        setPaymentReceived(true);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cost, itemName } = state;
    const _itemManager = itemManager.current;
    const result = await _itemManager.methods
      .createItem(itemName, cost)
      .send({ from: accounts[0] });
    setItemAddress(result.events.SupplyChainStep.returnValues._address);
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  React.useEffect(() => {
    if (itemAddress) {
      onOpen();
    }
  }, [itemAddress, onOpen]);

  React.useEffect(() => {
    (async () => {
      const web3 = await getWeb3();
      web3Ref.current = web3;
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      if (accounts.length) {
        setState((prevState) => ({ ...prevState, loaded: true }));
      }
      const networkId = await web3.eth.net.getId();
      const _itemManager = await new web3.eth.Contract(
        ItemManager.abi,
        ItemManager.networks[networkId] &&
          ItemManager.networks[networkId].address,
      );
      itemManager.current = _itemManager;
      listenToPaymentEvent(itemManager);
    })();
  }, []);

  if (!state.loaded) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <>
      <Container mt="50px">
        <Heading as="h2">Mini Shopping Cart</Heading>
        {!state.loaded && (
          <Stack>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </Stack>
        )}
        {state.loaded && (
          <Stack justify="center" align="center" mt="100px">
            <Text fontWeight="bold">Create new Item</Text>
            <FormControl as="fieldset">
              <Flex flexDir="column">
                <FormLabel htmlFor="itemName">Item Name</FormLabel>
                <Input
                  id="itemName"
                  type="text"
                  mb="10px"
                  name="itemName"
                  placeholder="Item name..."
                  onChange={handleInputChange}
                />
                <FormLabel htmlFor="cost">Item Cost</FormLabel>
                <Input
                  id="cost"
                  name="cost"
                  type="text"
                  placeholder="Item cost in Wei..."
                  onChange={handleInputChange}
                />
                <Button mt="10px" onClick={handleSubmit}>
                  Create Item
                </Button>
              </Flex>
            </FormControl>
          </Stack>
        )}
      </Container>
      <PaymentDetails
        address={itemAddress}
        cost={state.cost}
        disclosure={disclosure}
      />
      <NotifyPayment
        isOpen={paymentReceived}
        setIsOpen={setPaymentReceived}
        cost={
          web3Ref && web3Ref.current.utils.fromWei(String(state.cost), 'ether')
        }
        item={state.itemName}
      />
    </>
  );
}
