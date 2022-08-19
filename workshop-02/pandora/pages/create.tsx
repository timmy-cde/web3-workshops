import {
  useMarketplace,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { ChainId, NATIVE_TOKEN_ADDRESS, TransactionResult } from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import marketplaceAddress from '../config.json';

const Create: NextPage = () => {
  // Next JS Router hook to redirect to other pages
  const router = useRouter();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const [button, setButton] = useState("Submit Your Listing");
  const [clickable, setClickable] = useState(true);

  // Connect to our marketplace contract via the useMarketplace hook
  const marketplace = useMarketplace(
    marketplaceAddress.contract // Your marketplace contract address here
  );

  // This function gets called when the form is submitted.
  async function handleCreateListing(e: any) {
    setButton("Please Wait...");
    setClickable(false);

    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(ChainId.Mumbai);
        return;
      }

      // Prevent page from refreshing
      e.preventDefault();

      // Store the result of either the direct listing creation or the auction listing creation
      let transactionResult: undefined | TransactionResult = undefined;

      // De-construct data from form submission
      const { listingType, contractAddress, tokenId, price } =
        e.target.elements;

      // Depending on the type of listing selected, call the appropriate function
      // For Direct Listings:
      transactionResult = await createDirectListing(
        contractAddress.value,
        tokenId.value,
        price.value
      );

      // If the transaction succeeds, take the user back to the homepage to view their listing!
      if (transactionResult) {
        alert("Successful listing... LPG!");
        router.push(`/`);
      }
    } catch (error) {
      setButton("Please try again... 😥");
      setClickable(true);
      console.error(error);
    }
  }

  async function createDirectListing(
    contractAddress: string,
    tokenId: string,
    price: string
  ) {
    try {
      const transaction = await marketplace?.direct.createListing({
        assetContractAddress: contractAddress, // Contract Address of the NFT
        buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price.
        currencyContractAddress: NATIVE_TOKEN_ADDRESS, // NATIVE_TOKEN_ADDRESS is the crpyto curency that is native to the network. i.e. Rinkeby ETH.
        listingDurationInSeconds: 60 * 60 * 24 * 7, // When the auction will be closed and no longer accept bids (1 Week)
        quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
        startTimestamp: new Date(0), // When the listing will start
        tokenId: tokenId, // Token ID of the NFT.
      });

      return transaction;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={(e) => handleCreateListing(e)}>
      <div className={styles.container}>
        {/* Form Section */}
        <div className={styles.collectionContainer}>
          <h1 className={styles.ourCollection}>
            List Your NFT
          </h1>


          {/* NFT Contract Address Field */}
          <input
            type="text"
            name="contractAddress"
            className={styles.textInput}
            placeholder="NFT Contract Address"
          />

          {/* NFT Token ID Field */}
          <input
            type="text"
            name="tokenId"
            className={styles.textInput}
            placeholder="NFT Token ID"
          />

          {/* Sale Price For Listing Field */}
          <input
            type="text"
            name="price"
            className={styles.textInput}
            placeholder="Sale Price"
          />

          <button
            type="submit"
            className={styles.mainButton}
            style={{ 
              marginTop: 32, 
              borderStyle: "none",
              pointerEvents: clickable ? "auto" : "none",
              opacity: clickable ? 1 : 0.5
            }}
          >
            {button}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Create;
