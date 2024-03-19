import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ABI from '../ABIs/DAI_ABI.json';
import PropTypes from 'prop-types';
import { doc, updateDoc, arrayUnion, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import CryptoJS from 'crypto-js';

const Send = ({ setBalance, userAddress, name }) => {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientAvatar, setRecipientAvatar] = useState('');
    const [personalMessage, setPersonalMessage] = useState('');
    const [selectedToken, setSelectedToken] = useState('ETH');
    const [isFriend, setIsFriend] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state) {
            setAddress(location.state.address);
            setRecipientName(location.state.userName);
            setRecipientAvatar(location.state.avatar);
        }
        const checkFriendStatus = async () => {
            const userRef = doc(db, "users", userAddress);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const friendsList = userData.friends || [];
                const friendExists = friendsList.some(friend => friend.address === address);
                setIsFriend(friendExists);
            }
        };
        checkFriendStatus();
    }, [location, userAddress, address]);

    const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    const DAI_CONTRACT_ADDRESS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
    const TEST_CONTRACT_ADDRESS = "0xd6176dCfD007A23AEFceC0cB1ace95a0b87565A2"

    const sendMessage = async (txHash) => {
        const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;
        
        
        const messagesRef = collection(db, "messages");
        await addDoc(messagesRef, {
            from: userAddress,
            fromName: CryptoJS.AES.encrypt(name, secretKey).toString(), 
            to: address,
            toName: CryptoJS.AES.encrypt(recipientName, secretKey).toString(),
            message: CryptoJS.AES.encrypt(personalMessage, secretKey).toString(),
            amount: CryptoJS.AES.encrypt(amount.toString(), secretKey).toString(),
            token: CryptoJS.AES.encrypt(selectedToken, secretKey).toString(),
            txHash: txHash,
            createdAt: new Date()
        });
    };

    const sendTokens = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            let txHash;

            if (selectedToken === 'ETH') {
                txHash = await sendEth();
            } else {
                let tokenAddress;
                switch (selectedToken) {
                    case 'DAI':
                        tokenAddress = DAI_CONTRACT_ADDRESS;
                        break;
                    case 'USDC':
                        tokenAddress = USDC_CONTRACT_ADDRESS;
                        break;
                    case 'TEST':
                        tokenAddress = TEST_CONTRACT_ADDRESS;
                        break;
                    default:
                        throw new Error("Unsupported token");
                }
                const contract = new ethers.Contract(tokenAddress, ABI, signer);
                const tx = await contract.transfer(address, ethers.parseUnits(amount.toString(), 18));
                await tx.wait();
                txHash = tx.hash;
            }

            if (txHash) {
                await sendMessage(txHash);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const sendEth = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            const tx = await signer.sendTransaction({
                to: address,
                value: ethers.parseEther(amount.toString())
            });
            await tx.wait();
            setBalance(ethers.formatEther(await provider.getBalance(userAddress)));

            return tx.hash; 
        } catch (error) {
            console.log(error);
        }
    }

    const addFriend = async () => {
        if (!address || !recipientName || !recipientAvatar) {
            console.log("Missing information for adding a friend");
            return;
        }
        try {
            const userRef = doc(db, "users", userAddress);
            const friendData = { address, userName: recipientName, avatar: recipientAvatar };
            await updateDoc(userRef, {
                friends: arrayUnion(friendData) 
            });
            alert(`${recipientName} added as a friend!`);
            navigate('/');
        } catch (error) {
            console.error("Failed to add friend:", error);
        }
    };
    

    return (
        <div className="send-container">
            {recipientAvatar && <img className='rec-avatar' src={recipientAvatar} alt="Recipient Avatar" />}
            <p>To: {recipientName || 'Unknown'}</p>
            <input type="text" placeholder="Add a personal message..." onChange={(e) => setPersonalMessage(e.target.value)} />

            <input type="text" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
            <select onChange={(e) => setSelectedToken(e.target.value)} value={selectedToken}>
                <option value="ETH">ETH</option>
                <option value="DAI">DAI</option>
                <option value="USDC">USDC</option>
                <option value="TEST">Test Token</option>
            </select>
            <button className='ui-btn' onClick={sendTokens}>Send</button>
            {!isFriend && (
            <button className='ui-btn' onClick={addFriend}>Add Friend</button>
            )}
        </div>
    )
};


Send.propTypes = {
    setBalance: PropTypes.func.isRequired,
    balance: PropTypes.string,
    userAddress: PropTypes.string,
    name: PropTypes.string
};

export default Send;