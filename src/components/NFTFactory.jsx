import { useState } from 'react';
import { ethers } from "ethers";
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ABI from '../ABIs/ERC721_ABI.json';

const contractAddress = "0x655cf610e30ADA5AFFC4da0222Ff920A52Aa7595";

const NFTFactory = () => {

    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [description, setDescription] = useState('');
    const [imageURL, setImageURL] = useState('');

    const createNFT = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const contract = new ethers.Contract(contractAddress, ABI, signer);

            const txResponse = await contract.safeMint(
                userAddress,
                name, 
                symbol, 
                description,
                imageURL
            );

            await txResponse.wait();
            alert('NFT created successfully!');
        } catch (error) {
            console.error('Error creating NFT:', error);
            alert('Error creating NFT. See console for details.');
        }
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        setImageURL(downloadURL); 
    };

    return (
        <div className="nft-factory">
            <h2>Create an NFT</h2>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="NFT Name" />
                <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="NFT Symbol" />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="NFT Description" />
                <input type="file" onChange={onFileChange} />
                <button className='ui-btn' onClick={createNFT}>Create NFT</button>
        </div>
    );
}

export default NFTFactory;