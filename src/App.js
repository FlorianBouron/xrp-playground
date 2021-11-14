import { useEffect, useState } from "react";
import { Container, Typography, Button } from "@mui/material";
const xrpl = require("xrpl");

function App() {
  const [client, setClient] = useState();
  const [wallet, setWallet] = useState();

  const getWallet = () => {
    const wallet = xrpl.Wallet.fromSeed("shFEGd7bxdcjJebjBdUCzMiTx4vck");
    console.log(wallet.address);
    setWallet(wallet);
  };

  const connectToNetwork = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    setClient(client);
  };

  useEffect(() => {
    // Get Credentials
    getWallet();
    // Connect to testnet network
    connectToNetwork();
  }, []);

  const handleTransaction = async () => {
    // Prepare the transaction
    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: wallet.address,
      Amount: xrpl.xrpToDrops("22"),
      Destination: "rNvFCZXpDtGeQ3bVas95wGLN6N2stGmA9o",
    });
    const max_ledger = prepared.LastLedgerSequence;
    console.log("Prepared transaction instructions:", prepared);
    console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
    console.log("Transaction expires after ledger:", max_ledger);
    // Sign the transaction
    const signed = wallet.sign(prepared);
    console.log("Identifying hash:", signed.hash);
    console.log("Signed blob:", signed.tx_blob);
    // Submit the signed blob
    const tx = await client.submitAndWait(signed.tx_blob);
    console.log("Transaction result:", tx.result.meta.TransactionResult);
    console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2));
  };

  return (
    <Container>
      <Typography variant="h2" component="h1">
        XRP Playground
      </Typography>
      <Button variant="contained" onClick={handleTransaction}>
        Make a transaction
      </Button>
    </Container>
  );
}

export default App;
