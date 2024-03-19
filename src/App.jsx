import { useState } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { db } from './firebase';
import { getDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import Home from './components/Home';
import Send from './components/Send';
import Profile from './components/Profile';
import Factory from './components/Factory';
import MyTokens from './components/MyTokens';
import NFTFactory from './components/NFTFactory';
import MyNFTs from './components/MyNFTs';
import MyGPT from './components/MyGPT';
import Social from './components/Social';
import Messages from './components/Messages';
import Logo from './assets/eth.svg';

function App() {
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const defaultAvatarUrl = "https://doodleipsum.com/600?shape=circle&bg=ceebff";

  const connect = async () => {
    let signer = null;
    let provider;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();
      const desiredChainId = '0x14A34';
      if (network.chainId !== parseInt(desiredChainId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: desiredChainId,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      const _userAddress = await signer.getAddress();
      setUserAddress(_userAddress);
      const getBalance = await provider.getBalance(_userAddress);
      let userName = null;
      let userAvatar = null;
      const userDocRef = doc(db, "users", _userAddress);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setName(userData.userName);
        setAvatar(userData.avatar);
        console.log("Loaded user profile from Firestore:", userData.userName, userData.avatar);
      } else {
        const ensProvider = new ethers.InfuraProvider('mainnet');
        const ens = await ensProvider.lookupAddress(_userAddress);
        if (ens) {
          userName = ens;
          userAvatar = await ensProvider.getAvatar(ens) || defaultAvatarUrl;
        } else {
          userName = _userAddress.substr(0, 6) + "...";
          userAvatar = defaultAvatarUrl;
        }
        setName(userName);
        setAvatar(userAvatar);
        await setDoc(userDocRef, {
          walletAddress: _userAddress,
          userName: userName,
          avatar: userAvatar,
          createdAt: serverTimestamp()
        });
        setName(userName);
        setAvatar(userAvatar);
        console.log("New user profile created in Firestore:", _userAddress, userName, userAvatar);
      }

      const message = "sign in";
      await signer.signMessage(message);
      setConnected(true);
      setBalance(ethers.formatEther(getBalance)?.substr(0, 4));
    }
  };

  function disconnect() {
    setConnected(false);
    setName(null);
    setAvatar(null);
    setBalance(0);
  }

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <BrowserRouter>
      <div className='bg-img'>
        <img className='logo' src={Logo} alt='logo' />
      </div>

      <div className='App'>

        {!connected && (
          <div className='logIn'>
            <button className='connect' onClick={connect}>Connect</button>
            <p>Need a wallet? Click <a href='https://metamask.io/download/' target='_blank'>here</a>.</p>
          </div>
        )}
        {connected && (
          <>
            <Link to='/'>{avatar && <img src={avatar} className='avatar' alt="Home" />}</Link>
            <nav>
              <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className={isMenuOpen ? "line line1" : "line"}></div>
                <div className={isMenuOpen ? "line line2" : "line"}></div>
                <div className={isMenuOpen ? "line line3" : "line"}></div>
              </div>
              <button className='disconnect' onClick={disconnect}>{name}</button>
            </nav>
            <div className={isMenuOpen ? "nav open" : "nav"}>
              <Link to='/social' onClick={closeMenu}>Friends</Link>
              <Link to='/myGpt' onClick={closeMenu}>My GPT</Link>
              <Link to='/factory' onClick={closeMenu}>Token Factory</Link>
              <Link to='/nftFactory' onClick={closeMenu}>NFT Factory</Link>
              <Link to='/profile' onClick={closeMenu}>Profile</Link>
            </div>
          </>
        )}

        {connected && (
          <main>
            <Routes>
              <Route path='/' element={<Home userAddress={userAddress} />} />
              <Route path='/send' element={<Send balance={balance} setBalance={setBalance} userAddress={userAddress} name={name} />} />
              <Route path='/profile' element={<Profile userAddress={userAddress} userName={name} />} />
              <Route path='/factory' element={<Factory />} />
              <Route path='/nftFactory' element={<NFTFactory />} />
              <Route path='/myNfts' element={<MyNFTs />} />
              <Route path='/myTokens' element={<MyTokens />} />
              <Route path='/myGpt' element={<MyGPT />} />
              <Route path='/social' element={<Social userAddress={userAddress} />} />
              <Route path='/messages' element={<Messages userAddress={userAddress} />} />
            </Routes>
          </main>
        )}
      </div>

    </BrowserRouter>
  );
}

export default App;
