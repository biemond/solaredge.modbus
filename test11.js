console.log('-------------------');

let value = 0;
let buffer;

// if (value == 0) {
//     chargehex1 =  0;
//     chargehex2 =  0;
//   } else if (value == 500) {
//     chargehex1 =  0;
//     chargehex2 =  17402;
//   } else if (value == 1000) {
//     chargehex1 =  0;
//     chargehex2 =  17530;
//   }  else if (value == 1500) {
//     chargehex1 =  32768;
//     chargehex2 =  17595;

if (value < -3.4028234663852886e38 || value > 3.4028234663852886e38) {
  throw new Error('Value out of range for FLOAT32: ' + value);
}
// buffer = Buffer.allocUnsafe(4);
// buffer.writeFloatLE(value);

buffer = Buffer.allocUnsafe(4);
buffer.writeFloatBE(value);
buffer.swap32().swap16();

let bytes = buffer
  .toString('hex')
  .toUpperCase()
  .replace(/(.{2})/g, '$1 ')
  .trimEnd();

console.log('Write register: Bytes: ' + bytes);
console.log('Write register: ' + buffer.toString('hex'));
if (buffer.byteLength > 2) {
  console.log('---------2----------');
} else {
  console.log('----------1---------');
}
