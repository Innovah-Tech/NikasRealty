import ReactGA from 'react-ga4';

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '';

export const initGA = () => {
    if (TRACKING_ID) {
        ReactGA.initialize(TRACKING_ID, {
            gaOptions: {
                debug_mode: import.meta.env.DEV,
            },
        });
        console.log('Google Analytics initialized');
    } else {
        console.warn('Google Analytics tracking ID not found');
    }
};

export const logPageView = (path: string) => {
    if (TRACKING_ID) {
        ReactGA.send({ hitType: 'pageview', page: path });
    }
};

export const logEvent = (category: string, action: string, label?: string) => {
    if (TRACKING_ID) {
        ReactGA.event({
            category,
            action,
            label,
        });
    }
};

export const logException = (description: string, fatal = false) => {
    if (TRACKING_ID) {
        ReactGA.event({
            category: 'Exception',
            action: description,
            label: fatal ? 'Fatal' : 'Non-fatal',
        });
    }
};
