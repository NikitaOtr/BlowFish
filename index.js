'use strick'

const blowFish = new Blowfish();


const inputEncoding = document.querySelector('#inputEncoding');
const outputEncoding = document.querySelector('#outputEncoding');
const buttonEncoding = document.querySelector('#buttonEncoding')

buttonEncoding.addEventListener('click', () => {
    const result = blowFish.encoding(inputEncoding.value);
    outputEncoding.value = result;
    
    inputDecoding.value = result;
    outputDecoding.value = blowFish.decoding(inputDecoding.value);
});


const inputDecoding = document.querySelector('#inputDecoding');
const outputDecoding = document.querySelector('#outputDecoding');
const buttonDecoding = document.querySelector('#buttonDecoding');

buttonDecoding.addEventListener('click', () => {
    const result = blowFish.decoding(inputDecoding.value);
    outputDecoding.value = result;
});