import { UAParser } from 'ua-parser-js';

export const getDeviceInfo = () => {
    if (typeof window === 'undefined') {
        return {
            device: 'SERVER',
            browser: 'Unknown',
            os: 'Unknown'
        };
    }

    const parser = new UAParser();
    const result = parser.getResult();
    
    return {
        device: `${result.browser.name || 'Unknown'} ${result.browser.version || ''} / ${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
        browser: result.browser.name || 'Unknown',
        browserVersion: result.browser.version || 'Unknown',
        os: result.os.name || 'Unknown',
        osVersion: result.os.version || 'Unknown',
        deviceType: result.device.type || 'desktop'
    };
};