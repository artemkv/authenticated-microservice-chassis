import * as api from '../sessionapi';

import React, {useEffect} from 'react';

export default (props) => {
    useEffect(() => {
        api.getTest()
            .then((_) => {
                console.log('SUCCESS');
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
            });
    }, []);

    return <div>APP_SIGNED_IN</div>;
};
