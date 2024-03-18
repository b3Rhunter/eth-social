import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ABI from '../ABIs/ERC721_ABI.json';

const contractAddress = "0x655cf610e30ADA5AFFC4da0222Ff920A52Aa7595";

const MyNFTs = () => {
    const [nfts, setNFTs] = useState([]);

    const getNFTs = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const contract = new ethers.Contract(contractAddress, ABI, signer);
            const fetchedNFTs = await contract.getTokensByOwner(userAddress);
            const formattedNFTs = fetchedNFTs.map(nft => ({
                name: nft[0],
                symbol: nft[1],
                description: nft[2],
                imageUrl: nft[3]
            }));
            setNFTs(formattedNFTs);
        } catch (error) {
            console.log('Error getting NFTs:', error);
        }
    };

    useEffect(() => {
        getNFTs();
    }, []);

    return (
            <div className="nft-gallery">
                {nfts.length > 0 ? nfts.map((nft, index) => (
                    <div key={index} className="nft-item">
                        <h3>{nft.name} ({nft.symbol})</h3>
                        <em>{nft.description}</em>
                        <img src={nft.imageUrl} alt={nft.name} />
                    </div>
                )) : <p>No NFTs found.</p>}
            </div>
    );
};

export default MyNFTs;
