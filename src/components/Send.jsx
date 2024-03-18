import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ABI from '../ABIs/DAI_ABI.json';
import PropTypes from 'prop-types';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Send = ({ setBalance, userAddress }) => {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientAvatar, setRecipientAvatar] = useState('');
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
        // Fetch current user's friend list to check if recipient is already a friend
        const checkFriendStatus = async () => {
            const userRef = doc(db, "users", userAddress);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Check if the recipient's address is in the current user's friends list
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

    const sendTokens = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            if (selectedToken === 'ETH') {
                sendEth();
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
            }
            // Update balance here
        } catch (error) {
            console.log(error);
        }
    }

    const sendEth = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            const _userAddress = await signer.getAddress();
            const tx = await signer.sendTransaction({
                to: address,
                value: ethers.parseEther(amount.toString())
            });
            await tx.wait();
            setBalance(ethers.formatEther(await provider.getBalance(_userAddress)));
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
    userAddress: PropTypes.string
};

export default Send;