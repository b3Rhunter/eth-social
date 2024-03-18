import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';

const Profile = ({ userAddress, userName }) => {
    const [newUserName, setNewUserName] = useState(userName);
    const [file, setFile] = useState(null);
 


    const updateUserName = async () => {
        const userRef = doc(db, "users", userAddress);
        await updateDoc(userRef, { userName: newUserName });
        alert("Username updated successfully!");
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const updateProfilePicture = async () => {
        if (!file) return;
        const fileRef = ref(storage, `profilePictures/${userAddress}`);
        await uploadBytes(fileRef, file);
        const photoURL = await getDownloadURL(fileRef);
        await updateDoc(doc(db, "users", userAddress), { avatar: photoURL });
        alert("Profile picture updated successfully!");
    };

    return (
        <div className="profile">
            <div className='profile-ui'>
            <input
                type="text"
                placeholder='New Username'
                value={newUserName || ''}
                onChange={(e) => setNewUserName(e.target.value)}
            />
            <button className='ui-btn' onClick={updateUserName}>Change Username</button>

            <input type="file" onChange={handleFileChange} />
            <button className='ui-btn' onClick={updateProfilePicture}>Change Picture</button>
            </div>
            
        </div>
    );
};

Profile.propTypes = {
    userAddress: PropTypes.string.isRequired,
    userName: PropTypes.string,
};

export default Profile;
