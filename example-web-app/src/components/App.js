import * as firebaseAuth from 'firebase/auth';

import React, {useEffect, useState} from 'react';
import {cleanIdToken, setIdToken} from '../sessionapi';

import FirebaseAuth from './FirebaseAuth';
import SignedInArea from './SignedInArea';

const APP_LOADED_SIGN_IN_STATUS_UNKNOWN = 0;
const APP_USER_INITIATED_SIGN_IN = 1;
const APP_SIGNED_IN = 2;
const APP_SIGNED_OUT = 3;
const APP_USER_INITIATED_SIGN_OUT = 4;

export default () => {
    const [signInStatus, setSignInStatus] = useState(
        APP_LOADED_SIGN_IN_STATUS_UNKNOWN
    );

    // https://firebaseopensource.com/projects/firebase/firebaseui-web/
    // When redirecting back from Identity Providers like Google and Facebook or email link sign-in,
    // ui.start() method needs to be called to finish the sign-in flow.
    // If it requires a user interaction to start the initial sign-in process,
    // you need to check if there is a pending redirect operation going on on page load
    // to check whether start() needs to be called.
    useEffect(() => {
        const ui = firebaseui.auth.AuthUI.getInstance() ||
        new firebaseui.auth.AuthUI(firebaseAuth.getAuth());
        if (ui.isPendingRedirect()) {
            setSignInStatus(APP_USER_INITIATED_SIGN_IN);
        }
    }, []);

    firebaseAuth.getAuth().onAuthStateChanged(function(user) {
        if (user) {
            user.getIdToken().then(function(idToken) {
                console.log('ID TOKEN: ' + idToken);
                setIdToken(idToken);
                setSignInStatus((status) => {
                    if (status === APP_LOADED_SIGN_IN_STATUS_UNKNOWN ||
                    status === APP_USER_INITIATED_SIGN_IN) {
                        return APP_SIGNED_IN;
                    }
                    return status;
                });
            }).catch((_) => {
                cleanIdToken();
                setSignInStatus(APP_SIGNED_OUT);
            }); ;
        } else {
            cleanIdToken();
            setSignInStatus((status) => {
                if (status === APP_LOADED_SIGN_IN_STATUS_UNKNOWN ||
                    status === APP_USER_INITIATED_SIGN_OUT) {
                    return APP_SIGNED_OUT;
                }
                return status;
            });
        }
    });

    function onSignInRequested() {
        setSignInStatus(APP_USER_INITIATED_SIGN_IN);
    }

    function onSignOutRequested() {
        cleanIdToken();
        setSignInStatus(APP_USER_INITIATED_SIGN_OUT);
        firebaseAuth.getAuth().signOut();
        setSignInStatus(APP_SIGNED_OUT);
    }

    switch (signInStatus) {
    case APP_LOADED_SIGN_IN_STATUS_UNKNOWN:
        return <div>APP_LOADED_SIGN_IN_STATUS_UNKNOWN</div>;
    case APP_USER_INITIATED_SIGN_IN:
        return <FirebaseAuth />;
    case APP_SIGNED_IN:
        return <div>
            <SignedInArea />
            <button onClick={onSignOutRequested}>SIGN OUT</button>
        </div>;
    case APP_SIGNED_OUT:
        return <div>
            <div>APP_SIGNED_OUT</div>
            <button onClick={onSignInRequested}>SIGN IN</button>
        </div>;
    case APP_USER_INITIATED_SIGN_OUT:
        return <div>APP_USER_INITIATED_SIGN_OUT</div>;
    }
};
