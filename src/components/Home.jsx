import { Link } from 'react-router-dom';

const Home = () => {

    return (
        <div className="home">
            <h1>ethSocial</h1>
            <Link to='/social' className='ui-btn nav-link'>Make Friends</Link>
            <Link to='/factory' className='ui-btn nav-link'>Create Tokens</Link>
            <Link to='/nftFactory' className='ui-btn nav-link'>Create NFT</Link>
            <Link to='/myGpt' className='ui-btn nav-link'>My GPT</Link>
            <Link to='/profile' className='ui-btn nav-link'>Edit Profile</Link>
        </div>
    );
};

export default Home;
