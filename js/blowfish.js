'use strict'

class Blowfish {
    key = 'blowfish13670BLOW25849FISH80374EAt91526CrypTOgraPhyZeRO4';

    constructor() {
        this.arrayKeys = [...arrayKeys];
        this.sBox0  = [...sBox0];
        this.sBox1  = [...sBox1];
        this.sBox2  = [...sBox2];
        this.sBox3  = [...sBox3];
        this.initKeys();
    }

    initKeys() {
        let number32 = 0;
        let currentIndex = 0;
  
        for (let i = 0; i < 18; i++) {
            for (let j = 4; j > 0; j--) {
                number32 = this.getPositiveNumber(number32 << 8 | this.key.charCodeAt(currentIndex));
                currentIndex = (currentIndex+ 1) % this.key.length;
            }
            this.arrayKeys[i] = this.xor(this.arrayKeys[i], number32);
            number32 = 0;
        }
  
        let initNumbers32 = [0, 0];
        for (let i = 0; i < 18; i += 2) {
            initNumbers32 = this.feistelNetworkDirect(initNumbers32[0], initNumbers32[1]);
            this.arrayKeys[i] = initNumbers32[0];
            this.arrayKeys[i + 1] = initNumbers32[1];
        }
  
        for (let i = 0; i < 256; i += 2) {
            initNumbers32 = this.feistelNetworkDirect(initNumbers32[0], initNumbers32[1]);
            this.sBox0[i] = initNumbers32[0];
            this.sBox0[i + 1] = initNumbers32[1];
        }
  
        for (let i = 0; i < 256; i += 2) {
            initNumbers32 = this.feistelNetworkDirect(initNumbers32[0], initNumbers32[1]);
            this.sBox1[i] = initNumbers32[0];
            this.sBox1[i + 1] = initNumbers32[1];
        }
  
        for (let i = 0; i < 256; i += 2) {
            initNumbers32 = this.feistelNetworkDirect(initNumbers32[0], initNumbers32[1]);
            this.sBox2[i] = initNumbers32[0];
            this.sBox2[i + 1] = initNumbers32[1];
        }
  
        for (let i = 0; i < 256; i += 2) {
            initNumbers32 = this.feistelNetworkDirect(initNumbers32[0], initNumbers32[1]);
            this.sBox3[i] = initNumbers32[0];
            this.sBox3[i + 1] = initNumbers32[1];
        }
    }

    encoding(normalString) {
        let rowProgramString = baseUTF64.getProgramStringFromNormalString(normalString);
        const excessChar = rowProgramString.length % 8; 
        if (excessChar !== 0) {
            rowProgramString += '\0'.repeat(8 - excessChar); 
        }

        const countStrings64 = rowProgramString.length / 8;
        let codeString = '';
        for (let i = 0; i < countStrings64; i++) {
            const string64 = rowProgramString.slice(i * 8, (i + 1) * 8);
    
            const [rowLeftNumber32, rowRightNumber32] = this.splitString64byNumber32(string64);
            const [readyLeftNumber32, readyRightNumber32] = this.feistelNetworkDirect(rowLeftNumber32, rowRightNumber32);
            const readyProgramString = this.getStringFromNumber(readyLeftNumber32) + this.getStringFromNumber(readyRightNumber32);
            codeString +=  baseUTF64.getCodeStringFromProgramString(readyProgramString);
        }

        return codeString;
    }

    decoding(rowCodeString) {
        let readyCodeString = rowCodeString;
        const excessChar = readyCodeString.length % 11; 
        if (excessChar !== 0) {
            readyCodeString += '+'.repeat(11 - excessChar);
        }

        const countStrings64 = readyCodeString.length / 11;
        let readyProgramString = '';
        for (let i = 0; i < countStrings64; i++) {
            const codeString64 = readyCodeString.slice(i * 11, (i + 1) * 11);
            const string64 = baseUTF64.getProgramStringFromCodeString(codeString64);

            const [rowLeftNumber32, rowRightNumber32] = this.splitString64byNumber32(string64);
            const [readyLeftNumber32, readyRightNumber32] = this.feistelNetworkRevers(rowLeftNumber32, rowRightNumber32);
  
            const programString = this.getStringFromNumber(readyLeftNumber32) + this.getStringFromNumber(readyRightNumber32);
            readyProgramString += programString.replace(/\0+$/g, '');
        }

        return baseUTF64.getNormalStringFromProgramString(readyProgramString);
    }

    feistelNetworkDirect(leftNumber32, rightNumber32) {
        for (let i = 0; i < 16; i++) {
            leftNumber32 = this.xor(leftNumber32, this.arrayKeys[i]);
            const leftNumber32BeforeF = this.funcF(leftNumber32);
            rightNumber32 = this.xor(leftNumber32BeforeF, rightNumber32);
            [leftNumber32, rightNumber32] = [rightNumber32, leftNumber32];
        }
    
        [leftNumber32, rightNumber32] = [rightNumber32, leftNumber32];    
        leftNumber32 = this.xor(leftNumber32, this.arrayKeys[17]);
        rightNumber32 = this.xor(rightNumber32, this.arrayKeys[16]);

        return [leftNumber32, rightNumber32];
    }

    feistelNetworkRevers(leftNumber32, rightNumber32) {
        rightNumber32 = this.xor(rightNumber32, this.arrayKeys[16]);
        leftNumber32 = this.xor(leftNumber32, this.arrayKeys[17]);
        [leftNumber32, rightNumber32] = [rightNumber32, leftNumber32];

        for (let i = 15; i > -1; i--) {
            [leftNumber32, rightNumber32] = [rightNumber32, leftNumber32];
            const leftNumber32BeforeF = this.funcF(leftNumber32);
            rightNumber32 = this.xor(leftNumber32BeforeF, rightNumber32);
            leftNumber32 = this.xor(leftNumber32, this.arrayKeys[i]);
        }
        
        return [leftNumber32, rightNumber32];
    }

    funcF(leftNumber32) {
        const [ANumber8, BNumber8, CNumber8, DNumber8] = this.splitNumber32byNumber8(leftNumber32);
        const ANumber32 = this.sBox0[ANumber8];
        const BNumber32 = this.sBox1[BNumber8];
        const CNumber32 = this.sBox2[CNumber8];
        const DNumber32 = this.sBox3[DNumber8];

        const ABNumber32 = this.sumMod32(ANumber32, BNumber32);
        const ABCNumber32 = this.xor(ABNumber32, CNumber32);
        const ABCDNumber32 = this.sumMod32(ABCNumber32, DNumber32);

        return ABCDNumber32;
    }

    splitString64byNumber32(string64) {
        const leftString32 = string64.substring(0, 4);
        const rightString32 = string64.substring(4, 8);
        return [this.getNumberFromString(leftString32) , this.getNumberFromString(rightString32)];
    }

    splitNumber32byNumber8(number32) {
        return [number32 >>> 24,
                number32 << 8 >>> 24,
                number32 << 16 >>> 24, 
                number32 << 24 >>> 24];
    }

    getNumberFromString(string32) {
        return this.getPositiveNumber(string32.charCodeAt(0) << 24 | 
                                      string32.charCodeAt(1) << 16 |
                                      string32.charCodeAt(2) << 8 | 
                                      string32.charCodeAt(3));
    }

    getStringFromNumber(number32) {
        const [ANumber8, BNumber8, CNumber8, DNumber8] = this.splitNumber32byNumber8(number32);
        return String.fromCharCode(ANumber8) +
               String.fromCharCode(BNumber8) +
               String.fromCharCode(CNumber8) + 
               String.fromCharCode(DNumber8);
    }

    xor(n1, n2) {
        return this.getPositiveNumber(n1 ^ n2);
    }

    sumMod32(n1, n2) {
        return this.getPositiveNumber((n1 + n2) | 0);
    }

    getPositiveNumber(n) {
        return n >>> 0;
    }
};