const reader = require("readline-sync");
const chalk = require("chalk");
const getPixels = require("get-pixels");
const savePixels = require("save-pixels");
const { encode, decode } = require('./stego');
const fs = require('fs');

console.log(chalk.green("******** Image Steganography ********"));
let operation = reader.question(
`
Operations:
1. Encode
2. Decode

` + chalk.yellow('Choose operation: '));

if(operation == 1){
  let path = reader.question(chalk.yellow('Input image path: '));
  let message = reader.question(chalk.yellow('Message to conceal: '));
  getPixels(path, function(err, rgbaArray) {
    if(err) {
      console.log(chalk.red("ERROR - " + err.message));
      return;
    }
    let pixels = [];
    for(i=0; i< rgbaArray.data.length; i+=4){
      let pixel = {
          "r": rgbaArray.data[i],
          "g": rgbaArray.data[i+1],
          "b": rgbaArray.data[i+2],
          "a": rgbaArray.data[i+3],
      }
      pixels.push(pixel);
    }
  
      encode(pixels, message);
  
      let pixelArray = [];
      pixels.forEach(pixel => {
        pixelArray.push(pixel.r);
        pixelArray.push(pixel.g);
        pixelArray.push(pixel.b);
        pixelArray.push(pixel.a);
      });
      let data = Uint8Array.from(pixelArray);
      rgbaArray.data = data;
  
      savePixels(rgbaArray,"png").pipe(fs.createWriteStream('out.png'));
  
  
  } );

}
else if(operation == 2){
  let path = reader.question(chalk.yellow('Input image path: '));
  getPixels(path, function(err, rgbaArray) {
    if(err) {
      console.log(chalk.red("ERROR - " + err.message));
      return;
    }
    let pixels = [];
    for(i=0; i< rgbaArray.data.length; i+=4){
      let pixel = {
          "r": rgbaArray.data[i],
          "g": rgbaArray.data[i+1],
          "b": rgbaArray.data[i+2],
          "a": rgbaArray.data[i+3],
      }
      pixels.push(pixel);
    }
  
    let message = decode(pixels);
    console.log("Found message: " + message);
  });
}
else{
  console.log("Invalid operation.");
}

/*
  Pouzivam znaky z UTF-16. kazdy znak se prevede na 16-bitovou reprezentaci.
  Tudiz na kazdy znak zpravy potrebuji 16 bitu. 
  
  Zprava se uklada pouze do modreho kanalu, tudiz na jeden znak se pouzije 16 pixelu
  U kazdeho pixelu se zmeni pouze nejmene vyznamny bit u modreho kanalu (nejtezsi odhaleni lidskym okem)

*/
