import React from 'react';
import logo from './logo.svg';
import './App.css';
import ConfigedFirebase from './config/firebaseConfig'
import FirebaseFileUploader from './components/FirebaseFileUploader';
// import firebase from 'firebase/compat';
import { getStorage, ref} from 'firebase/storage';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function App() {
  const fireStorage = getStorage(ConfigedFirebase);
  const imagesRef = ref(fireStorage, 'images');
  // Sign in using a popup.
  const auth = getAuth(ConfigedFirebase)
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <path style={{fill:"red"}}>
      <img src={"http://s.cdpn.io/3/kiwi.svg"} style={{fill:"red"}}/>


      </path>
      
      <button onClick={async ()=>{
        await signInWithPopup(auth, provider)
      }}>Signin</button>

      <FirebaseFileUploader 
        multiple = {true} //use this to controll allow multiple or not 
        processURLFunction={(list) =>{
            console.log("firebaseList",list)
        }}
        maxNumberOfFiles={10} //if multiple, maxNo = ?, set to 0 for inf pic to upload
        accept={".jpg,.jpeg,.png,.svg"}
        fireStorageRef={imagesRef}
        // disableDownloadURL
        withPreview

      />
    </div>
  );
}

export default App;
