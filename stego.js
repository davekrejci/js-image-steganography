
// returns a 1 or 0 for the bit in 'location'
let getBit = function(number, location) {
    return ((number >> location) & 1);
 };
 
 // sets the bit in 'location' to 'bit' (either a 1 or 0)
 let setBit = function(number, location, bit) {
    return (number & ~(1 << location)) | (bit << location);
 };
 
 // returns an array of 1s and 0s for a 16 bit number
 let getBitsFromNumber = function(number) {
    let bits = [];
    for (let i = 0; i < 16; i++) {
        bits.push(getBit(number, i));
    }
    return bits;
 };
 
 // returns the next 2-byte number
 let getNumberFromBits = function(bytes) {
     let number = 0, pos = 0, loc = 0;
     while (pos < 16) {
         let bit = getBit(bytes[loc], 0);
         number = setBit(number, pos, bit);
         pos++;
         loc++;
     }
     return number;
 };

 // returns an array of 1s and 0s for the string 'message'
 let getMessageBits = function(message) {
     let messageBits = [];
     for (let i = 0; i < message.length; i++) {
        // charCodeAt method returns an integer between 0 and 65535 representing the UTF-16 code unit at the given index.
        let code = message.charCodeAt(i);
        messageBits = messageBits.concat(getBitsFromNumber(code));
    }
    return messageBits;
};

// encode the message in the image 
let encode = function(pixels, message) {

    // exit early if the message is too big for the image
    if (((message.length + 1) * 16) > pixels.length) {
        console.error('Message is too big for the image.');
        return;
    }

    // encode the message length into first 16 bits
    let lengthBits = getBitsFromNumber(message.length);
    for(let i = 0; i < lengthBits.length; i ++){
      // get the bit representation of the pixels blue channel
      let blueChannelBits = getBitsFromNumber(pixels[i].b);   
      // set lsb (last bit) to bit from message
      blueChannelBits[0] = lengthBits[i];
      pixels[i].b = getNumberFromBits(blueChannelBits);
    }
    
    // encode the message into the remaining bits
    let messageBits = getMessageBits(message);
    for(let i = 16, j = 0; i < messageBits.length + 16; i++, j++){
      // get the bit representation of the pixels blue channel
      let blueChannelBits = getBitsFromNumber(pixels[i].b);   
      // set lsb (last bit) to bit from message
      blueChannelBits[0] = messageBits[j];
      pixels[i].b = getNumberFromBits(blueChannelBits);
    }
};

let decode = function(pixels){  
    // decode the message length from first 16 bits
    let lengthBits = [];
    for(let i = 0; i < 16; i++){
        // get the bit representation of the pixels blue channel
        let blueChannelBits = getBitsFromNumber(pixels[i].b);   
        // get lsb (last bit)
        lengthBits += blueChannelBits[0];
    }
    let messageLength = getNumberFromBits(lengthBits);
    let bitCount = messageLength * 16;

    // decode the rest of the message
    let message = '';
    let messageBits = [];
    for(let i = 16; i < bitCount + 16; i++){
      // get the bit representation of the pixels blue channel
      let blueChannelBits = getBitsFromNumber(pixels[i].b);   
      // get lsb (last bit)
      messageBits += blueChannelBits[0];
    }
    let charBits = chunkArray(messageBits, 16);
    charBits.forEach(bits => {
        let code = getNumberFromBits(bits);
        let char = String.fromCharCode(code);
        message += char;
    });
    return message;
}

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}

module.exports = { getMessageBits, getBitsFromNumber, getNumberFromBits, encode, decode }