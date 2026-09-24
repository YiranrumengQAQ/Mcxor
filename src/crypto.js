export const Crypto = {
  DEFAULT_KEY: [0x38,0x38,0x33,0x32,0x39,0x38,0x35,0x31],
  isEncrypted(data){ return data.length >= 4 && ((data[0]===0x80||data[0]===0x90)&&data[1]===0x1d&&data[2]===0x30&&data[3]===0x01); },
  decrypt(data,key){ if(!this.isEncrypted(data)) throw Error('文件未加密'); const body=data.slice(4), out=new Uint8Array(body.length), k=key||this.DEFAULT_KEY; for(let i=0;i<body.length;i++) out[i]=body[i]^k[i%k.length]; return out; },
  deriveKey(name,data){ const current=data.slice(4,20), manifest=[...name].map(c=>c.charCodeAt(0)); manifest.push(10); if(current.length!==manifest.length)return null; const d=current.map((v,i)=>v^manifest[i]); return d.length===16&&d.slice(0,8).every((v,i)=>v===d[i+8])?d.slice(0,8):null; },
  hexToBytes(hex){ return hex.match(/.{2}/g)?.map(v=>parseInt(v,16))||[]; },
  bytesToHex(bytes){ return bytes.map(v=>v.toString(16).padStart(2,'0')).join(''); }
};
