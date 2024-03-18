import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import PropTypes from 'prop-types';

const Home = ({ userAddress }) => {
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                userName: doc.data().userName,
                avatar: doc.data().avatar
            })).filter(user => user.id !== userAddress);
            setUsers(usersList);
        };

        fetchUsers();
    }, [userAddress]);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!userAddress) return;
            const userRef = doc(db, "users", userAddress);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData.friends) {
                    setFriends(userData.friends);
                }
            }
        };

        fetchFriends();
    }, [userAddress]);

    return (
        <div className="home">
            <h1>ethSocial</h1>
            <div className='users'>
            {users.length > 0 ? (
                <div className='user-list'>
                <h2>All Users</h2>
                    {users.map(user => (
                        <div key={user.id}>
                            <Link to='/send' state={{ address: user.id, userName: user.userName, avatar: user.avatar }}>
                                {user.userName}
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No users found.</p>
            )}
            <div className='friends-list'>
                <h2>Friends List</h2>
                <div>
                    {friends.length > 0 ? (
                        friends.map((friend, index) => (
                            <div key={index}>
                                <Link to='/send' state={{ address: friend.address, userName: friend.userName, avatar: friend.avatar }}>
                                    {friend.userName}
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p>No friends added.</p>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

Home.propTypes = {
    userAddress: PropTypes.string
};

export default Home;
