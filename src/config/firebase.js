// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { configInfo } from '../constantValues/constantValues';

import {getDatabase} from 'firebase/database';

const firebaseConfig = configInfo;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


export const db = getDatabase(app);

