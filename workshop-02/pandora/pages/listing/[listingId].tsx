import {
  MediaRenderer,
  useMarketplace,
  useNetwork,
  useNetworkMismatch,
  useListing,
} from "@thirdweb-dev/react";
import { ChainId, ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../../styles/Home.module.css";
import marketplaceAddress from '../../config.json';

const ListingPage: NextPage = () => {
  // Next JS Router hook to redirect to other pages and to grab the query from the URL (listingId)
  const router = useRouter();
  const [button, setButton] = useState("Purchase");
  const [clickable, setClickable] = useState(true);

  // De-construct listingId out of the router.query.
  // This means that if the user visits /listing/0 then the listingId will be 0.
  // If the user visits /listing/1 then the listingId will be 1.
  const { listingId } = router.query as { listingId: string };

  // Hooks to detect user is on the right network and switch them if they are not
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  // Initialize the marketplace contract
  const marketplace = useMarketplace(
    marketplaceAddress.contract // Your marketplace contract address here
  );

  // Fetch the listing from the marketplace contract
  const { data: listing, isLoading: loadingListing } = useListing(
    marketplace,
    listingId
  );

  // Store the bid amount the user entered into the bidding textbox
  const [bidAmount, setBidAmount] = useState<string>("");

  if (loadingListing) {
    return <div className={styles.loadingOrError}>Loading...</div>;
  }

  if (!listing) {
    return <div className={styles.loadingOrError}>Listing not found</div>;
  }

  async function buyNft() {
    try {
      // Ensure user is on the correct network
      setClickable(false);
      if (networkMismatch) {
        switchNetwork && switchNetwork(ChainId.Mumbai);
        return;
      }
      setButton("Please wait...");
      // Simple one-liner for buying the NFT
      await marketplace?.buyoutListing(listingId, 1);
      alert("NFT bought successfully!");
      router.push(`/`);
    } catch (error) {
      setClickable(true);
      setButton("Try again");
      console.error(error);
      alert(error);
    }
  }

  return (
    <div className={styles.container} style={{}}>
      <div className={styles.listingContainer}>
        <div className={styles.leftListing}>
          <MediaRenderer
            src={listing.asset.image}
            className={styles.mainNftImage}
          />
        </div>

        <div className={styles.rightListing}>
          <h1>{listing.asset.name}</h1>
          <p>
            Owned by{" "}
            <b>
              {listing.sellerAddress?.slice(0, 6) +
                "..." +
                listing.sellerAddress?.slice(36, 40)}
            </b>
          </p>

          <h2>
            <b>{listing.buyoutCurrencyValuePerToken.displayValue}</b>{" "}
            {listing.buyoutCurrencyValuePerToken.symbol}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 20,
              alignItems: "center",
            }}
          >
            <button
              style={{ 
                borderStyle: "none",
                pointerEvents: clickable ? "auto" : "none",
                opacity: clickable ? 1 : 0.5
              }}
              className={styles.mainButton}
              onClick={buyNft}
            >
              Buy
            </button>
            <p style={{ color: "grey" }}>|</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;