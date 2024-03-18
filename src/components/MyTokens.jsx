import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Factory_ABI from '../ABIs/Factory_ABI.json';

const MyTokens = () => {

    const [myTokens, setMyTokens] = useState([]);

    const FactoryContractAddress = '0xb7e24187114EeF8A1a46aB177D13989f7A351690';

    const getMyTokens = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const factoryContract = new ethers.Contract(FactoryContractAddress, Factory_ABI, signer);
            const tokens = await factoryContract.getOwnedTokens(userAddress);
            setMyTokens(tokens);
            console.log('Tokens:', tokens);
        } catch (error) {
            console.error('Error getting tokens:', error);
            alert('Error getting tokens. See console for details.');
        }
    }

    useEffect(() => {
        getMyTokens();
    }, []);

    return (
        <div className='my-tokens'>
        {myTokens.length > 0 ? myTokens.map((token, index) => (
                <div key={index}>
                    <p>Address: {token[0]}</p>
                    <p>Name: {token[1]}</p>
                    <p>Symbol: {token[2]}</p>
                    <p>Max Supply: {ethers.formatUnits(token[3], 'ether')}</p>
                    <p>Pre-Mine Amount: {ethers.formatUnits(token[4], 'ether')}</p>
                    <p>Price Per Token: {ethers.formatUnits(token[5], 'ether')} ETH</p>
                    <hr />
                </div>
            )) : <p>No tokens found.</p>}
        </div>
    );
}

export default MyTokens;