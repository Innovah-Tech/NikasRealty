import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-PERDJVZ0SX';

export const initGA = () => {
    if (!TRACKING_ID) {
        if (import.meta.env.DEV) {
            console.warn('Google Analytics tracking ID not found');
        }
        return;
    }

    try {
        ReactGA.initialize(TRACKING_ID, {
            gaOptions: {
                debug_mode: import.meta.env.DEV,
                // Avoid noisy network errors when ad blockers block gtag
                send_page_view: false,
            },
            gtagOptions: {
                transport_type: 'beacon',
            },
        });
        if (import.meta.env.DEV) {
            console.log('Google Analytics initialized');
        }
    } catch {
        // Silently ignore when blocked by ad blockers or privacy extensions
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
