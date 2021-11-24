import * as firebaseAuth from 'firebase/auth';

import React, {useEffect} from 'react';

import {initializeApp} from 'firebase/app';

const firebaseui = require('firebaseui');


// TODO: use your own config
const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};
initializeApp(firebaseConfig);

export default () => {
    function renderFirebaseAuth() {
        const ui = firebaseui.auth.AuthUI.getInstance() ||
        new firebaseui.auth.AuthUI(firebaseAuth.getAuth());

        ui.start('#firebaseui-auth-container', {
            callbacks: {
                signInSuccessWithAuthResult: function(_, __) {
                    // do not redirect
                    return false;
                }
            },
            signInOptions: [
                {
                    provider: firebaseAuth.EmailAuthProvider.PROVIDER_ID,
                    requireDisplayName: false // Do not require user provide name upon signup
                },
                firebaseAuth.GoogleAuthProvider.PROVIDER_ID,
                firebaseAuth.GithubAuthProvider.PROVIDER_ID
            ]
        });
    }

    useEffect(() => {
        renderFirebaseAuth();
    }, []);

    return <div id="firebaseui-auth-container" />;
};
