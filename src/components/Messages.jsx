import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PropTypes from 'prop-types';
import CryptoJS from 'crypto-js';

const Messages = ({ userAddress }) => {
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('received');

    const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;

    const decryptMessage = (encryptedMessage) => {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    };

    useEffect(() => {
        const fetchMessages = async () => {
            const sentMessagesQuery = query(collection(db, "messages"), where("from", "==", userAddress));
            const receivedMessagesQuery = query(collection(db, "messages"), where("to", "==", userAddress));

            const [sentMessagesSnapshot, receivedMessagesSnapshot] = await Promise.all([
                getDocs(sentMessagesQuery),
                getDocs(receivedMessagesQuery)
            ]);

            const sentMessages = sentMessagesSnapshot.docs.map(doc => ({
                ...doc.data(),
                direction: 'sent'
            }));

            const receivedMessages = receivedMessagesSnapshot.docs.map(doc => ({
                ...doc.data(),
                direction: 'received'
            }));

            // Sorting directly in set state
            setSentMessages(sentMessages.sort((a, b) => (b.createdAt ? b.createdAt.seconds : 0) - (a.createdAt ? a.createdAt.seconds : 0))); // Added null checks for createdAt
            setReceivedMessages(receivedMessages.sort((a, b) => (b.createdAt ? b.createdAt.seconds : 0) - (a.createdAt ? a.createdAt.seconds : 0)));
        };

        fetchMessages();
    }, [userAddress]);

    const handleBackToReceivedMessages = () => {
        setActiveTab('received'); // Switch back to the received messages tab
    };

    

    return (
        <div className='messages-section'>
            <div className="messages-tabs">
            {activeTab === 'received' && (
                <button className={`tab ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>Sent Messages</button>
            )}
                </div>

            <div className='messages-list'>
                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Messages</h2>
                {activeTab === 'received' ? (
                    receivedMessages.length > 0 ? (
                        receivedMessages.map((message, index) => (
                            <div key={index} className="message">
                                <p>From: {decryptMessage(message.fromName)}</p>
                                <p>Message: {decryptMessage(message.message)}</p>
                                <p>Amount: {decryptMessage(message.amount)} {decryptMessage(message.token)}</p>
                                <p>Transaction Hash: <a href={`https://sepolia-explorer.base.org/tx/${message.txHash}`} target="_blank" rel="noopener noreferrer">{message.txHash.substr(0, 6) + "..."}</a></p>
                            </div>
                        ))
                    ) : <p>No received messages found.</p>
                ) : activeTab === 'sent' ? (
                    sentMessages.length > 0 ? (
                        sentMessages.map((message, index) => (
                            <div key={index} className="message">
                                <p>To: {decryptMessage(message.toName)}</p>
                                <p>Message: {decryptMessage(message.message)}</p>
                                <p>Amount: {decryptMessage(message.amount)} {decryptMessage(message.token)}</p>
                                <p>Transaction Hash: <a href={`https://sepolia-explorer.base.org/tx/${message.txHash}`} target="_blank" rel="noopener noreferrer">{message.txHash.substr(0, 6) + "..."}</a></p>
                            </div>
                        ))
                    ) : <p>No sent messages found.</p>
                ) : null}
                {activeTab === 'sent' && (
                  <button className="back-button" onClick={handleBackToReceivedMessages}>
                  Back to Received Messages
              </button>
                )}
  
            </div>
        </div>
    );
}

Messages.propTypes = {
    userAddress: PropTypes.string
};

export default Messages;
