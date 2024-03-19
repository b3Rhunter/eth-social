import { useState } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Factory_ABI from '../ABIs/Factory_ABI.json';

const FactoryContractAddress = '0xb7e24187114EeF8A1a46aB177D13989f7A351690';

const Factory = () => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [maxSupply, setMaxSupply] = useState('');
    const [preMineAmount, setPreMineAmount] = useState('');
    const [pricePerToken, setPricePerToken] = useState('');

    const createToken = async () => {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();
                const factoryContract = new ethers.Contract(FactoryContractAddress, Factory_ABI, signer);
    
                const txResponse = await factoryContract.createToken(
                    name, 
                    symbol, 
                    ethers.parseUnits(maxSupply, 'ether'),
                    ethers.parseUnits(preMineAmount, 'ether'), 
                    ethers.parseUnits(pricePerToken, 'ether'),
                );
    
                await txResponse.wait();
                
                const tokens = await factoryContract.getOwnedTokens(userAddress);
                console.log('Tokens:', tokens);
                alert('Token created successfully!');
            } catch (error) {
                console.error('Error creating token:', error);
                alert('Error creating token. See console for details.');
            }
        };

    return (
        <div className='factory'>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Token Name" />
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Token Symbol" />
            <input type="text" value={maxSupply} onChange={(e) => setMaxSupply(e.target.value)} placeholder="Max Supply" />
            <input type="text" value={preMineAmount} onChange={(e) => setPreMineAmount(e.target.value)} placeholder="Pre-Mine Amount" />
            <input type="text" value={pricePerToken} onChange={(e) => setPricePerToken(e.target.value)} placeholder="Price Per Token (in ETH)" />
            <button className='ui-btn' onClick={createToken}>Create Token</button>
            <Link to='/myTokens' className='nav-link ui-btn'>My Tokens</Link>
        </div>
    );
};

export default Factory;
