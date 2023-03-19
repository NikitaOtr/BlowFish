'use strict'

const baseUTF64 = {
    key: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/=',

    getProgramStringFromCodeString(codeString) {
        let countEquals = 0;        
        let stringLen = codeString.length;
        while (stringLen > 0) {
            if (countEquals === 2) {
                stringLen -= 10;
            } else {
                stringLen -= 11;
            }
            countEquals = (countEquals + 1) % 3;
        }
        let clearCodeString = codeString + '='.repeat(countEquals);

        clearCodeString = clearCodeString.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        let programString = '';
        let i = 0;
    
        while (i < clearCodeString.length) {
            const encodeChar1 = this.key.indexOf(clearCodeString.charAt(i++));
            const encodeChar2 = this.key.indexOf(clearCodeString.charAt(i++));
            const encodeChar3 = this.key.indexOf(clearCodeString.charAt(i++));
            const encodeChar4 = this.key.indexOf(clearCodeString.charAt(i++));
    
            const char1 = (encodeChar1 << 2) | (encodeChar2 >> 4);
            const char2 = ((encodeChar2 & 15) << 4) | (encodeChar3 >> 2);
            const char3 = ((encodeChar3 & 3) << 6) | encodeChar4;
    
            programString += String.fromCharCode(char1);
    
            if (encodeChar3 != 64) {
                programString += String.fromCharCode(char2);
            }

            if (encodeChar4 != 64) {
                programString += String.fromCharCode(char3);
            }
        }
        return programString;
    },

    getProgramStringFromNormalString(normalString) {
        let programString = '';
        for (let i = 0; i < normalString.length; i++) {
            const char = normalString.charCodeAt(i);
            if (char < 128) {
                programString += String.fromCharCode(char);
            } else if (char > 127 && char < 2048) {
                programString += String.fromCharCode(char >> 6 | 192);
                programString += String.fromCharCode(char & 63 | 128);
            } else {
                programString += String.fromCharCode(char >> 12 | 224);
                programString += String.fromCharCode(char >> 6 & 63 | 128);
                programString += String.fromCharCode(char & 63 | 128);
            }
        }
        return programString;
    },

    getCodeStringFromProgramString(programString) {
        let codeString = '';
        let i = 0;
    
        while (i < programString.length) {
            const char1 = programString.charCodeAt(i++);
            const char2 = programString.charCodeAt(i++);
            const char3 = programString.charCodeAt(i++);
    
            let encodeChar1 = char1 >> 2;
            let encodeChar2 = ((char1 & 3) << 4) | (char2 >> 4);
            let encodeChar3 = ((char2 & 15) << 2) | (char3 >> 6);
            let encodeChar4 = char3 & 63;
    
            if (isNaN(char2)) {
                encodeChar3 = encodeChar4 = 64;
            } else if (isNaN(char3)) {
                encodeChar4 = 64;
            }
    
            codeString += this.key.charAt(encodeChar1) + this.key.charAt(encodeChar2) + 
                          this.key.charAt(encodeChar3) + this.key.charAt(encodeChar4);
        }
        return codeString.replaceAll('=', '');
    },
    
    getNormalStringFromProgramString(programString) {
        let normalString = '';
        let i = 0;
        let char1;
        let char2;
        let char3;
    
        while (i < programString.length) {
            char1 = programString.charCodeAt(i);
            if (char1 < 128) {
                normalString += String.fromCharCode(char1);
                i += 1;
            } else if ((char1 > 191) && (char1 < 224)) {
                char2 = programString.charCodeAt(i + 1);
                normalString += String.fromCharCode(((char1 & 31) << 6) | (char2 & 63));
                i += 2;
            } else {
                char2 = programString.charCodeAt(i + 1);
                char3 = programString.charCodeAt(i + 2);
                normalString += String.fromCharCode(((char1 & 15) << 12) | ((char2 & 63) << 6) | (char3 & 63));
                i += 3;
            }
        }
        return normalString.replace(/\0+$/g, '');
    },
};