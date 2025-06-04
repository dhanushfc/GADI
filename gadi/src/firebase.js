import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDev-md1MHZl1D6IquSzIz0uhp19EZbM5s',
  authDomain: 'gadi-729c3.firebaseapp.com',
  projectId: 'gadi-729c3',
  storageBucket: 'gadi-729c3.appspot.com',
  messagingSenderId: '501210468279',
  appId: '1:501210468279:web:c2ca374d35ca0977a5a232',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 